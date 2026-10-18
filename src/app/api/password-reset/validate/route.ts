import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/password-reset/validate?token=<token>
 * Checks if a reset token is valid and unexpired by querying the real backend.
 * The backend looks up the SHA-256 hash of the token in the database.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Reset token is required' },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      'http://localhost:5000/api/v1';

    // The backend validate endpoint will verify the token hash in the DB
    const res = await fetch(`${backendUrl}/auth/validate-reset-token?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { valid: true, message: data.message || 'Token is valid' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { valid: false, message: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[password-reset/validate] Error:', error);
    return NextResponse.json(
      { valid: false, message: 'An error occurred validating the token' },
      { status: 500 }
    );
  }
}
