/**
 * SMS gateway wrapper.
 *
 * Supports two FOSS/free-tier-friendly providers, selected via SMS_PROVIDER env var:
 *   - "fast2sms" (recommended for India — has a free-credits trial, INR pricing after)
 *   - "twilio"   (works globally, free trial credits)
 *
 * Both branches are fully implemented — no mocks. Set SMS_PROVIDER and the
 * matching credentials in .env to activate.
 */

type SendSmsResult = { success: boolean; providerResponse: unknown };

const PROVIDER = process.env.SMS_PROVIDER ?? "fast2sms";

async function sendViaFast2Sms(phoneNoCountryCode: string, message: string): Promise<SendSmsResult> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) throw new Error("FAST2SMS_API_KEY is not set");

  const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: "q", // quick transactional route
      message,
      language: "english",
      flash: 0,
      numbers: phoneNoCountryCode, // Fast2SMS expects 10-digit number, no +91
    }),
  });

  const json = await res.json();
  if (!res.ok || json?.return !== true) {
    throw new Error(`Fast2SMS send failed: ${JSON.stringify(json)}`);
  }
  return { success: true, providerResponse: json };
}

async function sendViaTwilio(fullE164Phone: string, message: string): Promise<SendSmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) throw new Error("Twilio credentials are not fully set");

  const basicAuth = Buffer.from(`${sid}:${token}`).toString("base64");
  const body = new URLSearchParams({ To: fullE164Phone, From: from, Body: message });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(`Twilio send failed: ${JSON.stringify(json)}`);
  return { success: true, providerResponse: json };
}

/** phone must already be normalized E.164, e.g. +919876543210 */
export async function sendSms(phone: string, message: string): Promise<SendSmsResult> {
  if (process.env.SMS_DRY_RUN === "true") {
    // eslint-disable-next-line no-console
    console.log(`[SMS_DRY_RUN] -> ${phone}: ${message}`);
    return { success: true, providerResponse: { dryRun: true } };
  }

  if (PROVIDER === "fast2sms") {
    const tenDigit = phone.replace("+91", "");
    return sendViaFast2Sms(tenDigit, message);
  }
  if (PROVIDER === "twilio") {
    return sendViaTwilio(phone, message);
  }
  throw new Error(`Unknown SMS_PROVIDER: ${PROVIDER}`);
}

export const smsTemplates = {
  otp: (code: string) => `Your BirthWave verification code is ${code}. Valid for 5 minutes. Do not share this code.`,
  appointmentApproved: (dateStr: string, slot: string) =>
    `Your BirthWave appointment on ${dateStr} (${slot}) is CONFIRMED. See you at the clinic!`,
  reschedulePropo: (dateStr: string, slot: string, link: string) =>
    `Dr. Santoshi's clinic proposed a new slot: ${dateStr} (${slot}). Confirm or decline here: ${link}`,
  rescheduleConfirmedToStaff: (patientPhone: string, dateStr: string, slot: string) =>
    `Patient ${patientPhone} CONFIRMED the rescheduled slot: ${dateStr} (${slot}).`,
  rescheduleDeclinedToStaff: (patientPhone: string) =>
    `Patient ${patientPhone} DECLINED the proposed reschedule. Please follow up.`,
  clinicAlertNewApproval: (patientPhone: string, dateStr: string, slot: string) =>
    `New appointment APPROVED for ${patientPhone} on ${dateStr} (${slot}).`,
};

/** Fixed clinic alert number specified in the project brief */
export const CLINIC_ALERT_PHONE = "+918247748398";
