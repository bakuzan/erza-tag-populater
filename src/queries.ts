import { SeriesType } from './enums/SeriesType';

export default {
  PAGED_ITEMS: {
    [SeriesType.anime]: `
  query AnimeItems($paging: Paging) {
    value: animePaged(isAdult: true, paging: $paging) {
      hasMore
      nodes {
        id
        title
        link
        tags {
          id
          name
        }
      }
    }
  }
  `,
    [SeriesType.manga]: `
  query MangaItems($paging: Paging) {
    value: mangaPaged(isAdult: true, paging: $paging) {
      hasMore
      nodes {
        id
        title
        link
        tags {
          id
          name
        }
      }
    }
  }
  `
  },
  TAGS_UPDATE: {
    [SeriesType.anime]: ``,
    [SeriesType.manga]: ``
  }
};
