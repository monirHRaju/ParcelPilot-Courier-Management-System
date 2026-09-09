import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

import { loginSchema } from '../modules/auth/auth.schemas.js';
import { createParcelSchema } from '../modules/parcel/parcel.schemas.js';

export const registry = new OpenAPIRegistry();

// 1. Auth: Login
registry.registerPath({
  method: 'post',
  path: '/auth/login',
  summary: 'Login a user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successful login',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            accessToken: z.string(),
            refreshToken: z.string(),
          }),
        },
      },
    },
  },
});

// 2. Parcel: Create Parcel
registry.registerPath({
  method: 'post',
  path: '/parcels',
  summary: 'Create a new parcel',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createParcelSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Parcel created successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
            parcel: z.any(),
          }),
        },
      },
    },
  },
});

// 3. Public: Track Parcel
registry.registerPath({
  method: 'get',
  path: '/public/parcels/{id}/track',
  summary: 'Track a parcel by ID',
  request: {
    params: z.object({
      id: z.string().openapi({ description: 'Parcel tracking ID' }),
    }),
  },
  responses: {
    200: {
      description: 'Tracking information',
      content: {
        'application/json': {
          schema: z.object({
            id: z.string(),
            status: z.string(),
            statusHistory: z.array(z.any()),
          }),
        },
      },
    },
  },
});

export function generateOpenAPI() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'ParcelPilot API',
      description: 'API documentation for ParcelPilot courier platform',
    },
    servers: [{ url: 'http://localhost:4000' }],
  });
}
