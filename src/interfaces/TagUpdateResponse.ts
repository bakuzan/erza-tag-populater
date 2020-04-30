import { MutationResponse } from './MutationResponse';

export interface TagUpdateResponse extends MutationResponse {
  warningMessages: string[];
}
