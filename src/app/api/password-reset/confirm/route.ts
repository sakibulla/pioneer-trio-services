import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, newPassword } = body;

    if (!code || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Code and new password are required' },
        { status: 400 }
      );
    }

    if (code.length !== 6) {
      return NextResponse.json(
        { success: false, message: 'Invalid code format' },
        { status: 400 }
      );
    }

    // TODO: In production:
    // 1. Look up code in database
    // 2. Check if code is expired (10 minutes)
    // 3. Verify code matches email
    // 4. Hash new password
    // 5. Update user password in database
    // 6. Delete/invalidate the code
    // 7. Send confirmation email

    console.log(`✅ Password reset with code ${code}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successful. You can now login with your new password.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred resetting your password' },
      { status: 500 }
    );
  }
}
