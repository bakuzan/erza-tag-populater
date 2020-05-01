import path from 'path';

import { readIn } from 'medea';

import queries from './queries';
import { SeriesType } from './enums/SeriesType';
import { ProcessedSeries } from './interfaces/ProcessedSeries';
import { TagUpdateResponse } from './interfaces/TagUpdateResponse';
import { query } from './utils/query';

export async function updateSeriesTags(
  type: SeriesType,
  data: ProcessedSeries[]
) {
  const failed = [];

  for (const series of data) {
    const seriesId = series.id;
    const newTags = series.desired;

    const response = await query<TagUpdateResponse>(queries.TAGS_UPDATE[type], {
      seriesId,
      newTags,
      addTagIds: [],
      removeTagIds: []
    });

    if (!response.success) {
      console.log(`\r\nTag update failed for Id(${seriesId})`);
      response.errorMessages.forEach((x) => console.log(`${x}`));
      failed.push(series);
      continue;
    }

    console.log(`\r\nTag update complete for Id(${seriesId})`);
    response.warningMessages.forEach((x) => console.log(`${x}`));
  }

  console.log(`\r\nTag update failed for ${failed.length} series.`);
  console.log(
    `\r\nTag updates complete for ${data.length - failed.length} series.`
  );
}

export async function updateSeriesTagsFromFile(type: SeriesType) {
  const filename = path.resolve(
    path.join(__dirname, './output', `${type}_processed.json`)
  );

  const fileResponse = await readIn(filename, {
    read: true,
    shouldLog: true
  });

  if (!fileResponse.success) {
    console.error(`Read failed.\r\n`, fileResponse.error);
    process.exit(0);
  }

  const data: ProcessedSeries[] = JSON.parse(fileResponse.data);
  await updateSeriesTags(type, data);
}
