import path from 'path';
import URL from 'url';

import { writeFileAsync } from 'medea';

import { SeriesType } from './enums/SeriesType';
import { Series } from './interfaces/Series';
import { ResultSeries } from './interfaces/ResultSeries';
import fetchPage from './utils/readCachedFile';
import getPagedSeriesItems from './utils/getPagedSeriesItems';

import scrapeHandlers from './scrapeHandlers';

export async function scrapeSeriesInformation(
  type: SeriesType,
  items: Series[]
) {
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

  return {
    results,
    noLink,
    badLink,
    noHandler
  };
}

export async function scrapeSeriesInformationToFile(type: SeriesType) {
  const items = await getPagedSeriesItems(type);

  const { results, noLink, badLink, noHandler } = await scrapeSeriesInformation(
    type,
    items
  );

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
