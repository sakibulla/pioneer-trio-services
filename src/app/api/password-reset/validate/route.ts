import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    // Stub validation - in production, this would:
    // 1. Look up token in database
    // 2. Check if token is expired
    // 3. Return valid/invalid status

    // For demo: consider any token valid
    return NextResponse.json(
      { valid: true, message: 'Token is valid' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'An error occurred validating the token' },
      { status: 500 }
    );
  }
}
