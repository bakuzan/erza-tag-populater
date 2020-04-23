export interface SeriesResponse {
  hasMore: boolean;
  nodes: Series[];
}

export interface Series {
  id: number;
  title: string;
  link?: string;
  tags: SeriesTag[];
}

export interface SeriesTag {
  id: number;
  name: string;
}
