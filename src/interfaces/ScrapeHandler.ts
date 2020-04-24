import { ResultSeries } from './ResultSeries';
import { Series } from './Series';

export type ScrapeHandler = (
  page: CheerioStatic,
  series: Series,
  pageUrl: string
) => Promise<ResultSeries>;
