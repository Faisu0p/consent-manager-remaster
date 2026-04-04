import api from "./api";

const toDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatShortDate = (date) =>
  date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

const formatMonth = (date) =>
  date.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });

const timeAgo = (date) => {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const fetchDashboardAnalytics = async () => {
  const [consentResponse, userResponse] = await Promise.all([
    api.get("/consents/all"),
    api.get("/users/all-users"),
  ]);

  const consents = consentResponse?.data?.consents || [];
  const users = userResponse?.data || [];

  const granted = consents.filter((item) => item.consent_status).length;
  const revoked = Math.max(consents.length - granted, 0);
  const consentRate = consents.length ? Math.round((granted / consents.length) * 100) : 0;

  const complianceScore = Math.min(100, Math.max(0, consentRate));
  const complianceStatus =
    complianceScore >= 80 ? "Compliant" : complianceScore >= 60 ? "Needs Attention" : "At Risk";

  const dailyMap = new Map();
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    dailyMap.set(formatShortDate(day), { date: formatShortDate(day), granted: 0, revoked: 0, total: 0 });
  }

  consents.forEach((consent) => {
    const parsedDate = toDate(consent.consent_date);
    if (!parsedDate) return;
    const key = formatShortDate(parsedDate);
    if (!dailyMap.has(key)) return;
    const row = dailyMap.get(key);
    row.total += 1;
    if (consent.consent_status) row.granted += 1;
    else row.revoked += 1;
  });

  const dailyTrend = Array.from(dailyMap.values());

  const recentActivities = [...consents]
    .filter((item) => toDate(item.consent_date))
    .sort((a, b) => new Date(b.consent_date) - new Date(a.consent_date))
    .slice(0, 6)
    .map((item, index) => {
      const parsedDate = new Date(item.consent_date);
      return {
        id: item.consent_id || item.id || index,
        user: item.user_email || `User ${item.user_id}`,
        action: item.consent_status ? "Granted Consent" : "Revoked Consent",
        time: timeAgo(parsedDate),
      };
    });

  return {
    users,
    summary: {
      totalConsents: consents.length,
      granted,
      revoked,
      consentRate,
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.status === "Active").length,
    },
    compliance: {
      score: complianceScore,
      status: complianceStatus,
    },
    dailyTrend,
    recentActivities,
  };
};

export const fetchReportsAnalytics = async () => {
  const response = await api.get("/consents/all");
  const consents = response?.data?.consents || [];

  const monthMap = new Map();
  for (let i = 5; i >= 0; i -= 1) {
    const current = new Date();
    current.setDate(1);
    current.setMonth(current.getMonth() - i);
    monthMap.set(formatMonth(current), { month: formatMonth(current), accepted: 0, rejected: 0, total: 0 });
  }

  consents.forEach((consent) => {
    const parsedDate = toDate(consent.consent_date);
    if (!parsedDate) return;
    const key = formatMonth(parsedDate);
    if (!monthMap.has(key)) return;
    const row = monthMap.get(key);
    row.total += 1;
    if (consent.consent_status) row.accepted += 1;
    else row.rejected += 1;
  });

  const templateCount = consents.reduce((acc, item) => {
    const key = item.template_name || "Unknown Template";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const templateBreakdown = Object.entries(templateCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return {
    monthlyTrend: Array.from(monthMap.values()),
    templateBreakdown,
    totals: {
      total: consents.length,
      accepted: consents.filter((item) => item.consent_status).length,
      rejected: consents.filter((item) => !item.consent_status).length,
    },
  };
};
