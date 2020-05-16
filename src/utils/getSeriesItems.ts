import { SeriesType } from '@/enums/SeriesType';
import { Series } from '@/interfaces/Series';
import { query } from '@/utils/query';
import queries from '@/queries';

export default async function getSeriesItems(
  type: SeriesType,
  idString: string | number
) {
  const ids = `${idString}`
    .split(',')
    .map((x) => Number(x))
    .filter((x) => x && !isNaN(x));

  console.log(`Requesting ${type} series with id in (${idString})...`);
  console.log(
    `Note: If no series with a requested id exists, it will be ignored.\r\n`
  );

  const items: Series[] = [];

  for (const id of ids) {
    const item = await query<Series>(queries.BY_ID[type], {
      id
    });

    items.push(item);
  }

  return items;
}
