import dotenv from 'dotenv';

import { createClient } from 'medea';

import scrapeSeriesInformation from './01_scrapeSeriesInformation';
import consolidateNewTags from './02_consolidateNewTags';
import updateSeriesTags from './03_updateSeriesTags';
import removeTag from './04_removeTag';

import { Modes } from './enums/Modes';
import { SeriesType } from './enums/SeriesType';
import validate from './utils/validate';

dotenv.config();

const modeOptions = Object.keys(Modes).reduce((p, k, i, a) => {
  const sep = i + 1 === a.length ? ' or ' : ' ';
  return `${p},${sep}${k}`;
});

async function start() {
  const windowColumns = process.stdout.columns || 80;

  const cli = createClient('Tag Populater', { windowColumns })
    .addOption({
      option: 'mode',
      shortcut: 'm',
      description: `Process to run, required. Options: ${modeOptions}`,
      validate: (_: any, value: string) => value in Modes,
      required: true
    })
    .addOption({
      option: 'type',
      shortcut: 't',
      description: `Series type to use, required if mode is not 'removeTag'. Options: 'anime' or 'manga'`,
      validate: (_: any, value: string) => value in SeriesType,
      required: (client) =>
        client.get('mode') && client.get('mode') !== Modes.removeTag
    })
    .addOption({
      option: 'id',
      description: `Tag Id to be removed, required if mode is 'removeTag'`,
      validate: (_: any, value: string) => !!(value && !isNaN(Number(value))),
      required: (client) =>
        client.get('mode') && client.get('mode') === Modes.removeTag
    })
    .parse(process.argv)
    .welcome();

  const missing = cli.missingRequiredOptions();

  if (!cli.any() || missing.length) {
    cli.helpText();

    if (missing.length) {
      console.log(`* Missing required arguments:\r\n`);
      missing.forEach((o) => cli.log(o.option));
    }

    process.exit(0);
  }

  await validate(
    async () => cli.validate('mode'),
    () => console.log(`Invalid mode supplied. Expected one of: ${modeOptions}`)
  );

  if (cli.isRequired('type')) {
    await validate(
      async () => cli.validate('type'),
      () => console.log(`Invalid type supplied. Expected: 'anime' or 'manga'.`)
    );
  }

  switch (cli.get('mode')) {
    case Modes.scrape:
      await scrapeSeriesInformation(cli.get('type'));
      break;
    case Modes.consolidate:
      await consolidateNewTags(cli.get('type'));
      break;
    case Modes.scrapeAndMap:
      await scrapeSeriesInformation(cli.get('type'));
      await consolidateNewTags(cli.get('type'));
      break;
    case Modes.updateTags:
      await updateSeriesTags(cli.get('type'));
      break;
    case Modes.removeTag:
      await validate(
        async () => cli.validate('id'),
        () => console.log(`Invalid id supplied. Expected a number.`)
      );

      await removeTag(cli.get('id'));
      break;
    default:
      console.log(`Mode case '${cli.get('mode')}' is not handled.`);
      break;
  }

  process.exit(0);
}

start();
