import { Series } from './Series';

export interface ProcessedSeries extends Series {
  desired: string[];
  ignored: string[];
}
