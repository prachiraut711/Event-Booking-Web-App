const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const getSenderEmail = () => {
  if (process.env.RESEND_FROM_EMAIL) {
    return process.env.RESEND_FROM_EMAIL;
  }

  if (process.env.NODE_ENV === 'production') {
    const errorMsg = 'Production email configuration is missing: RESEND_FROM_EMAIL must be set.';
    console.error(`[Email Config Error] ${errorMsg}`);
    const err = new Error(errorMsg);
    err.isConfigurationError = true;
    throw err;
  }

  return 'onboarding@resend.dev';
};
/**

* Send booking confirmation email with EventSphere design
  */
  const sendBookingEmail = async (
  userEmail,
  userName,
  eventTitle,
  bookingRef,
  seatsCount = 1,
  amount = 0
  ) => {
  if (!resend) {
    const err = new Error('Email delivery service is unconfigured. RESEND_API_KEY is not set.');
    err.isConfigurationError = true;
    throw err;
  }

  const senderEmail = getSenderEmail();
  const mailOptions = {
  from: `EventSphere <${senderEmail}>`,
  to: [userEmail],
  subject: `Confirmed: Your Ticket for ${eventTitle} (Ref: ${bookingRef || 'CONFIRMED'})`,
  html: `         <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">              <div style="background-color: #0f172a; padding: 28px 24px; text-align: center;">                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px; font-weight: 800;">
                       🎟️ EventSphere                  </h1>                  <p style="color: #f97316; margin: 6px 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                       Booking Confirmation                  </p>              </div>              <div style="padding: 32px 28px;">                  <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Hi ${userName},</h2>                  <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                       Your registration for <strong style="color: #0f172a;">${eventTitle}</strong> is successfully confirmed! Here are your ticket details:                  </p>                  <div style="background-color: #f8fafc; border-left: 4px solid #f97316; padding: 18px; border-radius: 6px; margin: 24px 0;">                      <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">BOOKING REFERENCE</p>                      <p style="margin: 0 0 12px; color: #0f172a; font-size: 18px; font-weight: 700; font-family: monospace;">${bookingRef || 'ES-CONFIRMED'}</p>                      <p style="margin: 0 0 4px; color: #334155; font-size: 14px;"><strong>Seats:</strong> ${seatsCount}</p>                      <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Total:</strong> ${amount === 0 ? 'FREE' :`₹${amount}`}</p>                  </div>                  <p style="color: #475569; font-size: 14px; line-height: 1.5;">
                       You can access your digital E-ticket and QR code directly from your EventSphere user dashboard at any time.                  </p>                  <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
                       Thank you for choosing EventSphere • Modern Event Platform                  </div>              </div>          </div>
       `
  };

  const { data, error } = await resend.emails.send(mailOptions);

  if (error) {
    console.error('Booking email delivery failed:', error.message);
    const err = new Error(error.message || 'Booking confirmation email could not be sent.');
    err.isDomainRestricted = Boolean(
      error.message && (
        error.message.includes('testing emails') ||
        error.message.includes('verify a domain') ||
        error.message.includes('only send testing emails')
      )
    );
    throw err;
  }

  return data;
  };

/**

* Send OTP verification email
  */
  const sendOTPEmail = async (userEmail, otp, type) => {
  const isRegister = type === 'account_verification';
  const title = isRegister
  ? 'Verify Your EventSphere Account'
  : 'EventSphere Verification Code';

  const message = isRegister
  ? 'Please use the 6-digit one-time password below to verify your new EventSphere account and activate full access.'
  : 'Please enter the 6-digit verification code below to authorize your event booking action.';

  if (!resend) {
    const err = new Error('Email delivery service is unconfigured. RESEND_API_KEY is not set.');
    err.isConfigurationError = true;
    throw err;
  }

  const senderEmail = getSenderEmail();
  const mailOptions = {
  from: `EventSphere Security <${senderEmail}>`,
  to: [userEmail],
  subject: `${isRegister ? 'Account Verification' : 'Booking Verification'}: Your EventSphere code`,
  html: `          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">              <div style="background-color: #0f172a; padding: 26px 20px; text-align: center;">                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">
                       EventSphere                  </h1>                  <p style="color: #f97316; margin: 4px 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                       Security Verification                  </p>              </div>              <div style="padding: 32px 24px; text-align: center;">                  <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">${title}</h2>                  <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
                       ${message}                  </p>                  <div style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 14px 28px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: monospace;">
                       ${otp}                  </div>                  <p style="color: #94a3b8; font-size: 13px; margin-top: 24px; margin-bottom: 0;">
                       ⏱️ This code will expire in <strong>5 minutes</strong>. If you did not make this request, you can safely ignore this email.                  </p>              </div>              <div style="background-color: #f8fafc; padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px;">
                   © ${new Date().getFullYear()} EventSphere Security System.              </div>          </div>
       `
  };

  const { data, error } = await resend.emails.send(mailOptions);

  if (error) {
    console.error('OTP email delivery failed:', error.message);
    const err = new Error(error.message || 'Verification email could not be sent.');
    err.isDomainRestricted = Boolean(
      error.message && (
        error.message.includes('testing emails') ||
        error.message.includes('verify a domain') ||
        error.message.includes('only send testing emails')
      )
    );
    throw err;
  }

  return data;
};

const getSanitizedDiagnostic = (err) => {
  const rawMsg = err?.message || '';
  const text = rawMsg.toLowerCase();
  const status = err?.status || err?.statusCode || (typeof err?.code === 'number' ? err.code : null);
  const code = typeof err?.code === 'string' ? err.code : null;

  let category = 'PROVIDER_ERROR';
  let sanitizedMessage = 'An unexpected email provider error occurred.';

  if (
    status === 401 ||
    status === 403 ||
    text.includes('unauthorized') ||
    text.includes('forbidden') ||
    text.includes('api key') ||
    text.includes('invalid key') ||
    text.includes('restricted_api_key')
  ) {
    category = 'AUTHENTICATION_ERROR';
    sanitizedMessage = 'Authentication or API authorization failed with the email provider.';
  } else if (
    status === 429 ||
    text.includes('rate limit') ||
    text.includes('too many requests') ||
    text.includes('quota')
  ) {
    category = 'RATE_LIMIT_ERROR';
    sanitizedMessage = 'Email provider rate limit or sending quota exceeded.';
  } else if (
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    text.includes('timeout') ||
    text.includes('econnrefused') ||
    text.includes('econnreset') ||
    text.includes('enotfound') ||
    text.includes('network') ||
    text.includes('fetch failed')
  ) {
    category = 'NETWORK_ERROR';
    sanitizedMessage = 'Network communication with the email provider failed or timed out.';
  } else if (status >= 500 && status < 600) {
    category = 'UPSTREAM_SERVICE_ERROR';
    sanitizedMessage = 'Email provider experienced an upstream service failure (5xx).';
  } else if (
    (status >= 400 && status < 500) ||
    text.includes('bad request') ||
    text.includes('validation') ||
    text.includes('invalid')
  ) {
    category = 'VALIDATION_ERROR';
    sanitizedMessage = 'Email provider rejected request payload as invalid.';
  }

  const details = [];
  if (status) details.push(`status: ${status}`);
  if (code && !code.includes('/') && !code.includes('\\')) details.push(`code: ${code}`);

  if (details.length > 0) {
    sanitizedMessage += ` (${details.join(', ')})`;
  }

  return { category, sanitizedMessage };
};

const formatEmailErrorMessage = (err) => {
  const rawMsg = err?.message || '';
  if (
    err?.isDomainRestricted ||
    rawMsg.includes('testing emails') ||
    rawMsg.includes('verify a domain') ||
    rawMsg.includes('only send testing emails')
  ) {
    return "Email delivery restricted: In test mode without a custom domain, emails can only be sent to the administrator's registered email address. Please retry with the admin email or verify a custom domain in Resend.";
  }
  if (
    err?.isConfigurationError ||
    rawMsg.includes('RESEND_API_KEY') ||
    rawMsg.includes('RESEND_FROM_EMAIL') ||
    rawMsg.includes('unconfigured') ||
    rawMsg.includes('configuration is missing')
  ) {
    return 'Email delivery service is currently not configured. Please contact the administrator.';
  }

  // Diagnostic log on server: safe error category and sanitized message (no arbitrary raw error messages)
  const { category, sanitizedMessage } = getSanitizedDiagnostic(err);
  console.error(`Diagnostic - Email provider error [Category: ${category}]: ${sanitizedMessage}`);

  return 'Email delivery failed. Please try again later or contact support.';
};

module.exports = {
  sendBookingEmail,
  sendOTPEmail,
  formatEmailErrorMessage,
  getSenderEmail,
  getSanitizedDiagnostic
};
