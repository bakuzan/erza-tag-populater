import { ask } from 'stdio';

export default async function confirmation(question: string) {
  const noes = ['no', 'n'];
  const yeses = ['yes', 'y'];

  const answer = await ask(question, {
    options: [...yeses, ...noes],
    maxRetries: 2
  });

  return yeses.includes(answer);
}
