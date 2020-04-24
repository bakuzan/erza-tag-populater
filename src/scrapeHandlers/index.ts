import { ScrapeHandler } from '@/interfaces/ScrapeHandler';
import createHentaiHereHandler from './hentaihere';

export default new Map<string, ScrapeHandler>([
  // Anime
  [
    'ohentai.org',
    async (page, series) => {
      const tags = Array.from(page('.tagcontainer > a'));
      const newTags = tags.map((node) =>
        page(node).text().toLowerCase().trim()
      );

      return { ...series, newTags };
    }
  ],
  // Manga
  [
    'nhentai.net',
    async (page, series) => {
      const tags = Array.from(page(`.tags > a[href^='/tag/']`));
      const newTags = tags.map((node) => {
        const tag = page(node);
        const text = tag.text();
        const countText = tag.find('.count').text();

        return text.replace(countText, '').toLowerCase().trim();
      });

      return { ...series, newTags };
    }
  ],
  ['hentaihere.com', createHentaiHereHandler(`.text-info`, '.tagbutton')],
  [
    'hentai2read.com',
    createHentaiHereHandler(`.text-primary > b`, '.tagButton')
  ],
  [
    'hentai.cafe',
    async (page, series) => {
      const tags = Array.from(page(`.entry-content a[href*='/tag/']`));
      const newTags = tags.map((node) =>
        page(node).text().toLowerCase().trim()
      );

      return { ...series, newTags };
    }
  ],
  [
    'hentainexus.com',
    async (page, series) => {
      const tags = Array.from(page(`.tag > a`));
      const newTags = tags.map((node) =>
        page(node).text().toLowerCase().trim()
      );

      return { ...series, newTags };
    }
  ],
  [
    'www.fakku.net',
    async (page, series) => {
      const tags = Array.from(page(`.content-wrap .tags > a[href^='/tags/']`));
      const newTags = tags.map((node) =>
        page(node).text().toLowerCase().trim()
      );

      return { ...series, newTags };
    }
  ],
  [
    'www.tsumino.com',
    async (page, series) => {
      const tags = Array.from(page(`#Tag > a`));
      const newTags = tags.map((node) =>
        page(node).text().toLowerCase().trim()
      );

      return { ...series, newTags };
    }
  ]
]);
