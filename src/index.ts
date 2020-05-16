import dotenv from 'dotenv';

import { createClient } from 'medea';

import {
  scrapeSeriesInformationToFile,
  scrapeSeriesInformation
} from './01_scrapeSeriesInformation';
import {
  consolidateNewTagsToFile,
  consolidateNewTags
} from './02_consolidateNewTags';
import {
  updateSeriesTagsFromFile,
  updateSeriesTags
} from './03_updateSeriesTags';
import removeTag from './04_removeTag';

import { Modes } from './enums/Modes';
import { SeriesType } from './enums/SeriesType';
import validate from './utils/validate';
import getSeriesItems from './utils/getSeriesItems';

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
    .addOption({
      option: 'ids',
      description: `Comma separated list of series Id to be updated, required if mode is 'processSelectedSeries'`,
      validate: (_: any, value: any) => {
        if (!value) {
          return false;
        }

        if (typeof value === 'number') {
          return true;
        } else if (typeof value !== 'string') {
          return false;
        }

        const ids = value
          .split(',')
          .map((x) => Number(x))
          .filter((x) => x && !isNaN(x));

        return ids.length > 0;
      },
      required: (client) =>
        client.get('mode') && client.get('mode') === Modes.processSelectedSeries
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
      await scrapeSeriesInformationToFile(cli.get('type'));
      break;

    case Modes.consolidate:
      await consolidateNewTagsToFile(cli.get('type'));
      break;

    case Modes.scrapeAndMap:
      await scrapeSeriesInformationToFile(cli.get('type'));
      await consolidateNewTagsToFile(cli.get('type'));
      break;

    case Modes.updateTags:
      await updateSeriesTagsFromFile(cli.get('type'));
      break;

    case Modes.removeTag:
      await validate(
        async () => cli.validate('id'),
        () => console.log(`Invalid id supplied. Expected a number.`)
      );

      await removeTag(cli.get('id'));
      break;

    case Modes.processSelectedSeries:
      await validate(
        async () => cli.validate('ids'),
        () =>
          console.log(
            `One or more invalid ids supplied. Expected a comma separated list of numbers.`
          )
      );

      const seriesType = cli.get('type');
      const items = await getSeriesItems(seriesType, cli.get('ids'));

      const { results } = await scrapeSeriesInformation(seriesType, items);
      const mapped = await consolidateNewTags(results);
      await updateSeriesTags(seriesType, mapped);
      break;

    default:
      console.log(`Mode case '${cli.get('mode')}' is not handled.`);
      break;
  }

  process.exit(0);
}

start();
