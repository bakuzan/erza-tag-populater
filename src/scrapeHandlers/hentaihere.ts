import { ScrapeHandler } from '@/interfaces/ScrapeHandler';

const createHentaiHereHandler = (
  labelSelector: string,
  tagSelector: string
): ScrapeHandler => async (page, series) => {
  const targets = ['Category', 'Content'];

  const labels = Array.from(page(labelSelector)).filter((x) =>
    targets.some((word) => page(x).text().includes(word))
  );

  const tags = labels.reduce(
    (p, node) => [...p, ...Array.from(page(node.parentNode).find(tagSelector))],
    [] as CheerioElement[]
  );

  const newTags = tags.map((node) => page(node).text().toLowerCase().trim());

  return { ...series, newTags };
};

export default createHentaiHereHandler;
