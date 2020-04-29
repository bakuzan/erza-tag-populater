import fs from 'fs';
import path from 'path';
import URL from 'url';

import { writeFileAsync } from 'medea';

import { SeriesType } from './enums/SeriesType';
import { SeriesResponse, Series } from './interfaces/Series';
import { ResultSeries } from './interfaces/ResultSeries';
import { query } from './utils/query';
import fetchPage from './utils/readCachedFile';
import queries from './queries';
import scrapeHandlers from './scrapeHandlers';

const pageSize = 100;

async function getSeriesItems(type: SeriesType) {
  const filename = path.resolve(
    path.join(__dirname, './output', `${type}.json`)
  );

  try {
    fs.accessSync(filename, fs.constants.R_OK);
    console.log(`Reading ${type} from file.`);

    const data = fs.readFileSync(filename, 'utf-8');
    return JSON.parse(data) as Series[];
  } catch (err) {
    console.error(`No file for ${type}, will request.`);
  }

  let page = 0;
  const items = [];

  while (true) {
    console.log(`Requesting page ${page + 1} of ${type} items...`);
    const response = await query<SeriesResponse>(queries.PAGED_ITEMS[type], {
      paging: { size: pageSize, page }
    });

    page++;
    items.push(...response.nodes);

    if (!response.hasMore) {
      console.log(`All ${type} pages returned.`);
      break;
    }
  }

  await writeFileAsync(filename, JSON.stringify(items));

  return items;
}

export default async function scrapeSeriesInformation(type: SeriesType) {
  const items = await getSeriesItems(type);

  const noLink: Series[] = [];
  const badLink: Series[] = [];
  const noHandler: Series[] = [];
  const results: ResultSeries[] = [];

  for (const series of items) {
    if (!series.link) {
      noLink.push(series);
      continue;
    }

    const key = `${type}_${series.id}`;
    const pageUrl = series.link;
    const hostname = URL.parse(pageUrl).hostname ?? 'unknown';

    const $ = await fetchPage(key, pageUrl, {
      cacheStaleTime: null,
      exitOnError: false
    });

    const handler = scrapeHandlers.get(hostname);

    if (!$) {
      console.log(
        `Failed to fetch page at url: ${pageUrl}, skipping key: ${key}.`
      );
      badLink.push(series);
      continue;
    }

    if (!handler) {
      console.log(
        `No scrape handler found for hostname: ${hostname}, skipping key: ${key}.`
      );
      noHandler.push(series);
      continue;
    }

    const result = await handler($, series, pageUrl);
    results.push(result);
  }

  const outputFilename = path.resolve(
    path.join(__dirname, './output', `${type}_{0}.json`)
  );

  const outputs = [
    { name: 'results', items: results },
    { name: 'no-links', items: noLink },
    { name: 'bad-links', items: badLink },
    { name: 'no-handlers', items: noHandler }
  ];

  for (const o of outputs) {
    await writeFileAsync(
      outputFilename.replace('{0}', o.name),
      JSON.stringify(o.items)
    );
  }
}
