import { buildSchema } from 'type-graphql';
import { CustomerResolver } from './resolvers/customer-resolver.ts';
// Будем добавлять другие резолверы по мере необходимости

export const createSchema = async () => {
  return await buildSchema({
    resolvers: [CustomerResolver],
    validate: false,
  });
};
