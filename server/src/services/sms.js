// SMS delivery for OTP verification and notifications (status changes, volunteer
// assignment, announcements). Two providers, switched by MSG91_PROVIDER_MODE:
//   - "mock" (default): logs the message instead of sending — safe for dev/staging.
//   - "live": sends through MSG91's Flow API using DLT-approved templates.
//
// The template copy below is placeholder text for the mock provider and for local
// development. In live mode the actual wording is whatever was approved on the DLT
// platform for MSG91_TEMPLATE_ID_* — this code only fills in the template variables,
// it does not control the message text MSG91 actually sends.

const TEMPLATES = {
  otp: {
    en: ({ code }) => `${code} is your challapalli.people verification code. Valid for 5 minutes. Do not share this code with anyone.`,
    te: ({ code }) => `${code} మీ challapalli.people ధృవీకరణ కోడ్. 5 నిమిషాల వరకు చెల్లుతుంది. ఈ కోడ్‌ను ఎవరితోనూ పంచుకోవద్దు.`,
  },
  statusChange: {
    en: ({ title, status }) => `Update on your complaint "${title}": status changed to ${status}. Track it on challapalli.people.`,
    te: ({ title, status }) => `మీ ఫిర్యాదు "${title}" స్థితి ${status}కి మారింది. challapalli.peopleలో ట్రాక్ చేయండి.`,
  },
  assignment: {
    en: ({ title, wardName }) => `You've been assigned to resolve "${title}" in ${wardName}. Please check challapalli.people for details.`,
    te: ({ title, wardName }) => `${wardName}లో "${title}" పరిష్కరించడానికి మిమ్మల్ని నియమించారు. వివరాల కోసం challapalli.people చూడండి.`,
  },
  announcement: {
    en: ({ title }) => `New announcement on challapalli.people: "${title}". Open the app to read more.`,
    te: ({ title }) => `challapalli.peopleలో కొత్త ప్రకటన: "${title}". మరిన్ని వివరాల కోసం యాప్ తెరవండి.`,
  },
};

function renderMessage(templateKey, language, params) {
  const template = TEMPLATES[templateKey];
  if (!template) throw new Error(`Unknown SMS template: ${templateKey}`);
  const build = template[language] || template.en;
  return build(params);
}

async function sendMock({ to, templateKey, language, message }) {
  console.log(`[sms:mock] to=${to} template=${templateKey} lang=${language} :: ${message}`);
  return { ok: true, mock: true };
}

async function sendLive({ to, templateKey, language, params }) {
  const authkey = process.env.MSG91_API_KEY;
  const sender = process.env.MSG91_SENDER_ID || "MNDVSM";
  const templateEnvKey = `MSG91_TEMPLATE_ID_${templateKey.toUpperCase()}_${language.toUpperCase()}`;
  const templateId = process.env[templateEnvKey];

  if (!authkey) throw new Error("MSG91_API_KEY is not set.");
  if (!templateId) throw new Error(`${templateEnvKey} is not set — register and approve this DLT template first.`);

  const res = await fetch("https://control.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: { "Content-Type": "application/json", authkey },
    body: JSON.stringify({
      template_id: templateId,
      sender,
      short_url: "0",
      recipients: [{ mobiles: to.startsWith("91") ? to : `91${to}`, ...params }],
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || data?.type === "error") {
    throw new Error(data?.message || `MSG91 request failed (${res.status})`);
  }
  return { ok: true, mock: false, response: data };
}

// Fire this and forget for notification-style sends (status/assignment/announcement) —
// a delivery failure there shouldn't fail the request that triggered it. For OTP sends,
// callers should check `.ok` since the user is actively waiting on that message.
export async function sendSms({ to, templateKey, params = {}, language = "en" }) {
  const mode = process.env.MSG91_PROVIDER_MODE || "mock";
  const message = renderMessage(templateKey, language, params);

  try {
    if (mode === "live") {
      return await sendLive({ to, templateKey, language, params });
    }
    return await sendMock({ to, templateKey, language, message });
  } catch (err) {
    console.error(`[sms] failed to send "${templateKey}" to ${to}:`, err.message);
    return { ok: false, error: err.message };
  }
}
