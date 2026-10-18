import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/password-reset/confirm
 * Validates the reset token against the real backend database and sets the new password.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      'http://localhost:5000/api/v1';

    // Forward to the real backend which validates the DB token and updates the password
    const res = await fetch(`${backendUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: true,
          message:
            data.message ||
            'Password reset successful. You can now log in with your new password.',
        },
        { status: 200 }
      );
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error('[password-reset/confirm] Backend error:', errorData);
      return NextResponse.json(
        {
          success: false,
          message:
            errorData.message ||
            'Invalid or expired reset token. Please request a new password reset.',
        },
        { status: res.status }
      );
    }
  } catch (error) {
    console.error('[password-reset/confirm] Error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
