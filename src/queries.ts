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
    [SeriesType.anime]: `
    mutation AnimeUpdateTags(
      $seriesId: Int!
      $newTags: [String]
      $addTagIds: [Int]
      $removeTagIds: [Int]
    ) {
      value: animeUpdateTags(
        seriesId: $seriesId
        newTags: $newTags
        addTagIds: $addTagIds
        removeTagIds: $removeTagIds
      ) {
        success
        errorMessages
        warningMessages
      }
    }    
    `,
    [SeriesType.manga]: `
    mutation MangaUpdateTags(
      $seriesId: Int!
      $newTags: [String]
      $addTagIds: [Int]
      $removeTagIds: [Int]
    ) {
      value:mangaUpdateTags(
        seriesId: $seriesId
        newTags: $newTags
        addTagIds: $addTagIds
        removeTagIds: $removeTagIds
      ) {
        success
        errorMessages
        warningMessages
      }
    }
    `
  },
  TAG_BY_ID: `
  query GetTag($id: Int!) {
    value: tagById(id: $id) {
      id
      name
    }
  }  
  `,
  REMOVE_TAG: `
  mutation RemoveTag($id: Int!) {
    value: tagRemove(id: $id) {
      success
      errorMessages
    }
  }
  `
};
