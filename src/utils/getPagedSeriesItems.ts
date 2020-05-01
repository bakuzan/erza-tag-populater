import fs from 'fs';
import path from 'path';

import { writeFileAsync } from 'medea';

import { SeriesType } from '@/enums/SeriesType';
import { SeriesResponse, Series } from '@/interfaces/Series';
import { query } from '@/utils/query';
import queries from '@/queries';

const pageSize = 100;

export default async function getPagedSeriesItems(type: SeriesType) {
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
