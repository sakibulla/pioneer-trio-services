import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

let transporter: any = null;

// Initialize transporter with error handling
function getTransporter() {
  if (!transporter) {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      console.error('❌ Gmail credentials not configured');
      throw new Error('Email service not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD');
    }

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }
  return transporter;
}

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

    // Generate a 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Get transporter
    const emailTransporter = getTransporter();

    // Send email with reset code
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your Pioneer Trio Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1c1917; margin-top: 0;">Password Reset Code</h2>
            <p style="color: #666; font-size: 16px;">Hi,</p>
            <p style="color: #666; font-size: 16px;">You requested a password reset for your Pioneer Trio account. Use the code below:</p>
            
            <div style="background-color: #ffffff; border: 2px solid #14b8a6; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="color: #14b8a6; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 5px;">${resetCode}</p>
            </div>

            <p style="color: #666; font-size: 14px;">
              <strong>This code will expire in 10 minutes.</strong>
            </p>

            <p style="color: #666; font-size: 14px;">
              If you didn't request this reset, please ignore this email or contact support.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px;">
              Pioneer Trio Services<br>
              <a href="https://www.pioneertrioservices.com" style="color: #14b8a6; text-decoration: none;">www.pioneertrioservices.com</a>
            </p>
          </div>
        </div>
      `,
    };

    await emailTransporter.sendMail(mailOptions);

    console.log(`✅ Reset code ${resetCode} sent to ${email}`);

    return NextResponse.json(
      {
        success: true,
        message: `Password reset code sent to ${email}. Please check your inbox.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send reset code';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
