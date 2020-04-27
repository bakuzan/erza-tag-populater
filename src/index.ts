import dotenv from 'dotenv';

import { createClient } from 'medea';

import scrapeSeriesInformation from './01_scrapeSeriesInformation';
import consolidateNewTags from './02_consolidateNewTags';

import { Modes } from './enums/Modes';
import { SeriesType } from './enums/SeriesType';
import validate from '@/utils/validate';

dotenv.config();

async function start() {
  const windowColumns = process.stdout.columns || 80;
  const cli = createClient('Tag Populater', { windowColumns })
    .addOption({
      option: 'mode',
      shortcut: 'm',
      description: `Process to run. Options: 'scrape', 'consolidate', or 'scrapeAndMap'`,
      validate: (_: any, value: string) => value in Modes,
      required: true
    })
    .addOption({
      option: 'type',
      shortcut: 't',
      description: `Series type to scrape, required if mode=scrape. Options: 'anime' or 'manga'`,
      validate: (_: any, value: string) => value in SeriesType,
      required: true
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
    () =>
      console.log(
        `Invalid mode supplied. Expected one of: 'scrape', 'consolidate', or 'scrapeAndMap'`
      )
  );

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
    default:
      console.log(`Mode case '${cli.get('mode')}' is not handled.`);
      break;
  }

  process.exit(0);
}

start();
