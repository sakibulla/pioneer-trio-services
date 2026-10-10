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

    // Generate a demo reset token (in production, this would be a secure token stored in DB)
    const resetToken = 'demo-reset-' + Math.random().toString(36).substring(2, 15);
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    console.log(`
╔════════════════════════════════════════════════════════════╗
║          PASSWORD RESET CODE (for testing)                ║
╠════════════════════════════════════════════════════════════╣
║ Email: ${email}
║ Reset Token: ${resetToken}
║ Reset URL: ${resetUrl}
╠════════════════════════════════════════════════════════════╣
║ Demo Code sent! Use this token to reset password.         ║
╚════════════════════════════════════════════════════════════╝
    `);

    // Return success message with demo token in response
    return NextResponse.json(
      {
        success: true,
        message: 'Password reset link sent to your email!',
        demoToken: resetToken, // For testing - in production remove this
        demoResetUrl: resetUrl, // For testing - in production remove this
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
