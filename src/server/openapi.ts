import { generateOpenApiDocument } from 'trpc-openapi';
import { appRouter } from '~/server/routers/_app';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Example CRUD API',
  description: 'OpenAPI compliant REST API built using tRPC with Next.js',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000/api',
  docsUrl: 'http://localhost:3000/api/docs',
});
