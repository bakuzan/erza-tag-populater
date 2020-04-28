import { ScrapeHandler } from '@/interfaces/ScrapeHandler';
import createHentaiHereHandler from './hentaihere';
import hentaigasm from './hentaigasm';

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
  [
    'hentai.animestigma.com',
    async (page, series) => {
      const tags = Array.from(page('label > a'));
      const newTags = tags.map((node) =>
        page(node).text().toLowerCase().trim()
      );

      return { ...series, newTags };
    }
  ],
  [
    'hanime.tv',
    async (page, series) => {
      const tags = Array.from(page(`a.btn[href^='/browse/tags']`));
      const newTags = tags.map((node) =>
        page(node).text().toLowerCase().trim()
      );

      return { ...series, newTags };
    }
  ],
  ['urbanhentai.com', hentaigasm],
  ['hentaigasm.com', hentaigasm],
  [
    'hentaihaven.org',
    async (page, series) => {
      const tags = Array.from(page(`span.tags > a`));
      const newTags = tags
        .map((node) => page(node).text().toLowerCase().trim())
        .filter((x, i, a) => a.indexOf(x) === i);

      return { ...series, newTags };
    }
  ],
  [
    'hentai.animeholics.org',
    async (page, series) => {
      const tags = Array.from(page(`.entry-footer a`));
      const newTags = tags
        .map((node) => page(node).text().toLowerCase().trim())
        .filter((x, i, a) => a.indexOf(x) === i);

      return { ...series, newTags };
    }
  ],
  [
    'hentaiplay.net',
    async (page, series) => {
      const [postItem] = Array.from(page(`#content .item-post:nth-child(1)`));
      const newTags =
        page(postItem)
          .attr('class')
          ?.split(' ')
          .filter((x) => x.startsWith('tag-'))
          .map((x) => x.replace('tag-', '')) ?? [];

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
