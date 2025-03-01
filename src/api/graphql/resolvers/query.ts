import { generateAnswer } from '../../../rag/generator';
import { logger } from '../../../utils/logger';

export const queryResolvers = {
  health: () => 'OK',
  search: async (_: any, args: { query: string }) => {
    try {
      logger.info(`GraphQL search query: "${args.query}"`);
      const result = await generateAnswer(args.query);
      return result;
    } catch (error) {
      logger.error('Error in GraphQL search resolver:', error);
      throw new Error('Failed to generate answer');
    }
  }
};
