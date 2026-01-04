import { NextRequest, NextResponse } from "next/server";

import { ApiError } from "@/lib/errors";

export function withAuthErrorHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle auth errors specifically
        if (error.code === "UNAUTHORIZED" || error.code === "FORBIDDEN") {
          // For API routes, return JSON error
          return NextResponse.json(
            {
              success: false,
              error: {
                code: error.code,
                message: error.message,
                redirectTo: "/unauthorized"
              }
            },
            { status: error.status }
          );
        }
      }
      
      // Re-throw other errors to be handled by default error handling
      throw error;
    }
  };
}
