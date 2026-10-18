import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      'http://localhost:5000/api/v1';

    // Forward to the real backend which stores the token in DB and sends the email
    const res = await fetch(`${backendUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      return NextResponse.json(
        {
          success: true,
          message:
            'If that email is registered, a password reset link has been sent. Please check your inbox.',
        },
        { status: 200 }
      );
    } else {
      const errorData = await res.json().catch(() => ({}));
      console.error('[forgot-password] Backend error:', errorData);
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || 'Failed to send reset email. Please try again.',
        },
        { status: res.status }
      );
    }
  } catch (error) {
    console.error('[forgot-password] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Network error. Please check your connection and try again.' },
      { status: 500 }
    );
  }
}
