import queries from './queries';
import { MutationResponse } from './interfaces/MutationResponse';
import { SeriesTag } from './interfaces/Series';
import { query } from './utils/query';
import confirmation from './utils/confirmation';

export default async function removeTag(tagId: string) {
  const id = Number(tagId);
  const tag = await query<SeriesTag>(queries.TAG_BY_ID, {
    id
  });

  if (!tag) {
    console.log(`Tag(Id: ${id}) not found.`);
    process.exit(0);
  }

  const answer = await confirmation(
    `Would you like to delete the '${tag.name}' tag?`
  );

  if (!answer) {
    process.exit(0);
  }

  const response = await query<MutationResponse>(queries.REMOVE_TAG, {
    id
  });

  if (response.success) {
    console.log(`\r\nDeleted '${tag.name}' tag.`);
  } else {
    console.log(`\r\nFailed to delete '${tag.name}' tag.`);
    response.errorMessages.forEach((x) => console.log(x));
  }
}
