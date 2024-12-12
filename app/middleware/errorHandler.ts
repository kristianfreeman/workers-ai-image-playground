import { NextRequest, NextResponse } from 'next/server';

export async function errorHandler(err: any, req: NextRequest, res: NextResponse) {
  console.error("Error processing request:", err);

  const errorResponse = {
    error: "Internal Server Error",
    message: err.message,
    stack: err.stack
  };

  res.status(500).json(errorResponse);
}
