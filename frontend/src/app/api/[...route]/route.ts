import app from '../../../backend/app';
import { NextRequest, NextResponse } from 'next/server';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';

export const dynamic = 'force-dynamic';

async function handleNextRequest(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const bodyBuffer = Buffer.from(await req.arrayBuffer());

  return new Promise<NextResponse>((resolve) => {
    const socket = new Socket();
    const reqStream = new IncomingMessage(socket);

    reqStream.url = url.pathname + url.search;
    reqStream.method = req.method;

    req.headers.forEach((value, key) => {
      reqStream.headers[key.toLowerCase()] = value;
    });

    if (bodyBuffer.length > 0) {
      reqStream.headers['content-length'] = bodyBuffer.length.toString();
    }

    const resHeaders: Record<string, string | string[]> = {};
    let statusCode = 200;
    const responseChunks: Buffer[] = [];

    const resStream = new ServerResponse(reqStream);

    resStream.setHeader = (name: string, value: string | string[]) => {
      resHeaders[name.toLowerCase()] = value;
      return resStream;
    };

    resStream.getHeader = (name: string) => resHeaders[name.toLowerCase()];

    resStream.writeHead = (code: number, headers?: any) => {
      statusCode = code;
      if (headers) {
        Object.keys(headers).forEach((h) => {
          resHeaders[h.toLowerCase()] = headers[h];
        });
      }
      return resStream;
    };

    resStream.write = (chunk: any) => {
      if (chunk) {
        responseChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return true;
    };

    resStream.end = (chunk?: any) => {
      if (chunk) {
        responseChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const responseBody = Buffer.concat(responseChunks);
      const headers = new Headers();

      Object.entries(resHeaders).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          v.forEach((val) => headers.append(k, val));
        } else if (v !== undefined) {
          headers.set(k, v.toString());
        }
      });

      resolve(new NextResponse(responseBody, { status: statusCode, headers }));
      return resStream;
    };

    // Forward request to Express app
    app(reqStream as any, resStream as any);

    if (bodyBuffer.length > 0) {
      reqStream.push(bodyBuffer);
    }
    reqStream.push(null);
  });
}

export async function GET(req: NextRequest) { return handleNextRequest(req); }
export async function POST(req: NextRequest) { return handleNextRequest(req); }
export async function PUT(req: NextRequest) { return handleNextRequest(req); }
export async function DELETE(req: NextRequest) { return handleNextRequest(req); }
export async function PATCH(req: NextRequest) { return handleNextRequest(req); }
export async function OPTIONS(req: NextRequest) { return handleNextRequest(req); }
