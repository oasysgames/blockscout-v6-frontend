import { NextResponse } from 'next/server';
import type { GraphQLRequestBody } from './types';

import { getEnvValue } from 'configs/app/utils';

interface GraphQLResponse {
  data?: unknown;
  errors?: Array<{ message: string }>;
}

const THEGRAPH_API_URL = getEnvValue('NEXT_PUBLIC_EXPERIMENT_API_URL') || 'http://localhost:8000/subgraphs/name/oasys/bridge';

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json() as GraphQLRequestBody;
    console.info('[Backend] Received GraphQL request:', {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
    });

    console.info('[Backend] Forwarding request to TheGraph:', {
      url: THEGRAPH_API_URL,
      query: body.query,
      variables: body.variables,
    });

    const response = await fetch(THEGRAPH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('[Backend] TheGraph request failed:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
      throw new Error(`GraphQL request failed with status ${ response.status }`);
    }

    const data = await response.json() as GraphQLResponse;
    const duration = Date.now() - startTime;

    if (data.errors) {
      console.error('[Backend] TheGraph response contains errors:', {
        errors: data.errors,
        duration,
      });
      throw new Error(data.errors[0]?.message || 'GraphQL query failed');
    }
    console.info(`THEGRAPH_API_URL `, THEGRAPH_API_URL);
    //  'http://localhost:8000'になるなぜ？
    // 本来は、

    console.info('[Backend] TheGraph request successful', {
      url: THEGRAPH_API_URL, // 'http://localhost:8000' なぜ？
      duration,
      responseSize: JSON.stringify(data).length,
      hasData: Boolean(data.data),
      response: data, // { message: 'Not found' }
    });

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Backend] GraphQL request error', {
      url: THEGRAPH_API_URL,
      duration,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    });
    return NextResponse.json({
      errors: [ { message: error instanceof Error ? error.message : 'Internal server error' } ],
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
