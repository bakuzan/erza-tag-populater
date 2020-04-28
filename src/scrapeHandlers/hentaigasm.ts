import { Series } from '@/interfaces/Series';

export default async (page: CheerioStatic, series: Series) => {
  const tags = Array.from(page(`#extras a[href*='/genre/']`));
  const newTags = tags.map((node) => page(node).text().toLowerCase().trim());

  return { ...series, newTags };
};
