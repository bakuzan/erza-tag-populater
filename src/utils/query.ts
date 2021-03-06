import { query as medQuery } from 'medea';

export async function query<T = any>(
  gqlQuery: string,
  variables: { [key: string]: any }
): Promise<T> {
  const endpoint = process.env.API_ENDPOINT;

  if (!endpoint) {
    throw new Error('No query endpoint.');
  }

  try {
    const response = await medQuery(endpoint, {
      body: JSON.stringify({
        query: gqlQuery,
        variables
      })
    });

    if (!response.success) {
      console.log(response.error);
      process.exit(1);
    }

    // Query resolve names are being aliased to 'value'
    return response.data.value;
  } catch (e) {
    console.error(`Query failed.\n\r${e.message}`);
    process.exit(1);
  }
}
