import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import dotenv from 'dotenv';
import { typeDefs } from './schema/index.js';
import { resolvers } from './resolvers/index.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Create Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      extensions: {
        code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
      },
    };
  },
});

async function startServer() {
  await server.start();

  // Apply middleware
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // GraphQL endpoint
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Add authentication context here if needed
        return {
          // user: await getUser(req.headers.authorization),
        };
      },
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
