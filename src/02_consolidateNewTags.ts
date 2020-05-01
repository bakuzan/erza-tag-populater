import path from 'path';

import { readIn, writeFileAsync } from 'medea';

import { SeriesType } from './enums/SeriesType';
import { ResultSeries } from './interfaces/ResultSeries';
import { ProcessedSeries } from './interfaces/ProcessedSeries';
import { ignoredTags, mapNewTagToDesiredTag } from './tagMappings';

export async function consolidateNewTags(data: ResultSeries[]) {
  const mapped: ProcessedSeries[] = [];

  for (const series of data) {
    const { newTags, tags, ...other } = series;
    const ignored: string[] = [];
    const processed: string[] = [];

    series.newTags.forEach((t) =>
      ignoredTags.includes(t)
        ? ignored.push(t)
        : processed.push(mapNewTagToDesiredTag.get(t) ?? t)
    );

    const desired = processed.filter(
      (x, i, a) => a.indexOf(x) === i && !tags.some((t) => t.name === x)
    );

    mapped.push({
      ...other,
      tags,
      desired,
      ignored
    });
  }

  const seriesWithDesiredTags = mapped.filter((x) => x.desired.length !== 0);
  const seriesWithoutDesiredTags = mapped.filter((x) => x.desired.length === 0);

  if (seriesWithoutDesiredTags.length) {
    seriesWithoutDesiredTags.forEach((s) =>
      console.log(`Id(${s.id}): ${s.title}`)
    );
    console.log(
      `\r\nWarning: ${seriesWithoutDesiredTags.length} series without any desired tags!`
    );
  }

  console.log(
    `\r\n${seriesWithDesiredTags.length} series with at least 1 desired tag.`
  );

  return seriesWithDesiredTags;
}

export async function consolidateNewTagsToFile(type: SeriesType) {
  const filename = path.resolve(
    path.join(__dirname, './output', `${type}_results.json`)
  );

  const response = await readIn(filename, {
    read: true,
    write: true,
    shouldLog: true
  });

  if (!response.success) {
    console.error(`Read failed.\r\n`, response.error);
    process.exit(0);
  }

  const data: ResultSeries[] = JSON.parse(response.data);
  const seriesWithDesiredTags = await consolidateNewTags(data);

  const outputFilename = path.resolve(
    path.join(__dirname, './output', `${type}_processed.json`)
  );

  await writeFileAsync(outputFilename, JSON.stringify(seriesWithDesiredTags));
}
