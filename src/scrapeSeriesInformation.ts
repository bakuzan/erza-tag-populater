import fs from 'fs';
import path from 'path';

import { writeFileAsync } from 'medea';

import { SeriesType } from './enums/SeriesType';
import { SeriesResponse, Series } from './interfaces/Series';
import { ResultSeries } from './interfaces/ResultSeries';
import { query } from './utils/query';
import fetchPage from './utils/readCachedFile';
import queries from './queries';

const pageSize = 50;

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
    const response = await query<SeriesResponse>(queries[type], {
      paging: { size: pageSize, page }
    });

    page++;
    items.push(...response.nodes);

    if (!response.hasMore) {
      break;
    }
  }

  await writeFileAsync(filename, JSON.stringify(items));

  return items;
}

export default async function scrapeSeriesInformation(type: SeriesType) {
  const items = await getSeriesItems(type);
  const results: ResultSeries[] = [];

  for (const series of items) {
    if (!series.link) {
      results.push({ ...series, newTags: [] });
      continue;
    }

    const key = `${type}_${series.id}`;
    const pageUrl = series.link;
    const domain = ''; // TODO, GET

    const $ = await fetchPage(key, pageUrl);

    // TODO
    // create handlers based on link domain
    // scrape tags
    // clean tags
    // add to results
  }
}
