import nodemailer from "nodemailer";

const readEnv = (name, fallback = "") => {
  const value = process.env[name];
  if (value === undefined || value === null) {
    return fallback;
  }
  return String(value).trim();
};

const getTransporter = () => {
  const host = readEnv("SMTP_HOST");
  const port = Number.parseInt(readEnv("SMTP_PORT", "587"), 10);
  const user = readEnv("SMTP_USER");
  const pass = readEnv("SMTP_PASS");
  const secure = readEnv("SMTP_SECURE", "false").toLowerCase() === "true";

  if (!host || !user || !pass || Number.isNaN(port)) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

export const sendRetrospectiveConsentEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error(
      "SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS in backend env."
    );
  }

  const from = readEnv("SMTP_FROM", readEnv("SMTP_USER"));

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};
