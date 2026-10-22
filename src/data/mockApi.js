// Dev-only in-memory mock backend used when VITE_USE_MOCK=true.
// Shape mirrors what server/src/routes/*.js returns, so the frontend code
// doesn't need to know whether a real backend is behind it.
//
// Mirrors the production seed: only the four demo accounts exist up front.
// Problems, suggestions, feedback, announcements, volunteers and activity
// start EMPTY. Any writes you perform (reporting, suggesting, posting an
// announcement) are kept in memory for the browser session, so the mock
// still exercises every CRUD path — refresh resets to the clean slate.

import { WARDS } from "./geography";

const wardAt = (i) => WARDS[i].id;
const wardName = (id) => WARDS.find((w) => w.id === id)?.name;
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

let nextOrdinal = 1;
const makeId = () => {
  nextOrdinal += 1;
  return `mock-${String(nextOrdinal).padStart(6, "0")}`;
};
const refId = (prefix, n) => `${prefix}-${String(n).padStart(5, "0")}`;

// ---------------------------------------------------------------- Users
// Four demo accounts, same four roles the real server seeds. Password is
// the same `demo1234` the backend uses, so login works identically against
// either backend.
const DEMO_PASSWORD = "demo1234";
const users = [
  { id: "mock-user-resident",  name: "R. Narayana",     phone: "9876500001", role: "Resident",      wardId: wardAt(0), preferredLanguage: "en", createdAt: daysAgo(60) },
  { id: "mock-user-volunteer", name: "V. Ramesh",       phone: "9876500002", role: "Volunteer",     wardId: wardAt(0), preferredLanguage: "en", createdAt: daysAgo(55) },
  { id: "mock-user-wardadmin", name: "Ch. Ravi Teja",   phone: "9876500004", role: "Ward Admin",    wardId: wardAt(2), preferredLanguage: "en", createdAt: daysAgo(45) },
  { id: "mock-user-admin",     name: "Administrator",   phone: "9876500000", role: "Administrator", wardId: null,      preferredLanguage: "en", createdAt: daysAgo(90) },
];

const safeUser = (u) => (u ? { ...u } : null);

// Current session (mock JWT is just the user id).
const token = (userId) => `mock-token-${userId}`;
const userFromToken = (tok) => {
  if (!tok) return null;
  const id = tok.replace(/^Bearer /, "").replace(/^mock-token-/, "");
  return users.find((u) => u.id === id) || null;
};

// ---------------------------------------------------------------- Data stores
// Everything else starts empty. Writes from the UI go in here and persist
// for the browser session — refresh clears them.
const volunteers = [];
const problems = [];
const announcements = [];
const suggestions = [];
const feedback = [];
const activityLog = [];

// ---------------------------------------------------------------- Router
function matchRoute(method, path) {
  const url = path.split("?")[0];
  return `${method} ${url}`;
}

function params(path) {
  const q = path.split("?")[1];
  if (!q) return {};
  const out = {};
  for (const pair of q.split("&")) {
    const [k, v = ""] = pair.split("=");
    out[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return out;
}

function err(status, message) {
  const e = new Error(message);
  e.status = status;
  e.rawMessage = message;
  return e;
}

// Simulate a little network latency so loading states show.
const DELAY_MS = 120;
const settle = (data) => new Promise((resolve) => setTimeout(() => resolve(data), DELAY_MS));

export async function mockRequest({ method, path, body, authToken }) {
  const route = matchRoute(method, path);
  const query = params(path);
  const user = userFromToken(authToken);

  // ---------- Auth
  if (route === "GET /auth/me") {
    if (!user) throw err(401, "Not authenticated.");
    return settle({ user: safeUser(user) });
  }
  if (route === "POST /auth/login" || route === "POST /auth/admin-login") {
    const match = users.find((u) => u.phone === body?.phone);
    if (!match) throw err(401, "No account found with this phone number.");
    if (body?.password !== DEMO_PASSWORD) throw err(401, "Incorrect password.");
    if (route === "POST /auth/admin-login" && !["Ward Admin", "Administrator"].includes(match.role)) {
      throw err(403, "This account does not have admin access.");
    }
    return settle({ token: token(match.id), user: safeUser(match) });
  }
  if (route === "POST /auth/register") {
    if (users.find((u) => u.phone === body?.phone)) {
      throw err(409, "An account with this phone number already exists.");
    }
    const u = {
      id: makeId(),
      name: (body.name || "").trim(),
      phone: (body.phone || "").trim(),
      role: "Resident",
      wardId: body.wardId || null,
      preferredLanguage: "en",
      createdAt: new Date().toISOString(),
    };
    users.push(u);
    return settle({ token: token(u.id), user: safeUser(u) });
  }
  if (route === "POST /auth/otp/send") {
    return settle({ message: `A verification code was sent to the number ending ${(body?.phone || "").slice(-4)}.` });
  }
  if (route === "POST /auth/otp/verify") {
    const match = users.find((u) => u.phone === body?.phone) || users[0];
    return settle({ token: token(match.id), user: safeUser(match) });
  }
  if (route === "POST /auth/forgot-password/start") {
    const match = users.find((u) => u.phone === body?.phone);
    if (!match) throw err(404, "No account found with this phone number.");
    return settle({ resetId: "mock-reset", questionId: "first-pet" });
  }
  if (route === "POST /auth/forgot-password/verify-answer") return settle({ resetToken: "mock-reset-token" });
  if (route === "POST /auth/forgot-password/reset") return settle({ ok: true });

  // ---------- Problems
  if (route === "GET /problems") {
    let list = [...problems];
    if (query.wardId) list = list.filter((p) => p.wardId === query.wardId);
    if (query.category) list = list.filter((p) => p.category === query.category);
    if (query.priority) list = list.filter((p) => p.priority === query.priority);
    if (query.status) list = list.filter((p) => p.status === query.status);
    const staff = user && ["Volunteer", "Ward Admin", "Administrator"].includes(user.role);
    if (!staff) list = list.filter((p) => p.status !== "New");
    return settle({
      problems: list.map((p) => ({
        ...p,
        reportedByName: staff ? p.reportedByName : null,
        reportedByPhone: staff ? p.reportedByPhone : null,
      })),
    });
  }
  const problemGet = route.match(/^GET \/problems\/([^/]+)$/);
  if (problemGet) {
    const p = problems.find((x) => x.id === problemGet[1]);
    if (!p) throw err(404, "Problem not found.");
    return settle({ problem: { ...p } });
  }
  if (route === "POST /problems") {
    if (!user) throw err(401, "Not authenticated.");
    const p = {
      id: makeId(),
      ...body,
      photos: Array.isArray(body.photos) ? body.photos : [body.photo].filter(Boolean),
      status: "New",
      priority: "Medium",
      supportCount: 0,
      assignedVolunteer: null,
      comments: [],
      timeline: [{ status: "New", date: new Date().toISOString() }],
      progressPhotos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reportedBy: user.id,
    };
    problems.unshift(p);
    return settle({ problem: p });
  }
  const problemPatch = route.match(/^PATCH \/problems\/([^/]+)$/);
  if (problemPatch) {
    const p = problems.find((x) => x.id === problemPatch[1]);
    if (!p) throw err(404, "Problem not found.");
    Object.assign(p, body);
    if (body.status) p.timeline.push({ status: body.status, date: new Date().toISOString() });
    p.updatedAt = new Date().toISOString();
    return settle({ problem: { ...p } });
  }
  const problemDel = route.match(/^DELETE \/problems\/([^/]+)$/);
  if (problemDel) {
    const i = problems.findIndex((x) => x.id === problemDel[1]);
    if (i === -1) throw err(404, "Problem not found.");
    problems.splice(i, 1);
    return settle(null);
  }
  const problemComment = route.match(/^POST \/problems\/([^/]+)\/comments$/);
  if (problemComment) {
    const p = problems.find((x) => x.id === problemComment[1]);
    if (!p) throw err(404, "Problem not found.");
    p.comments.push({ author: user?.name || "Guest", text: body.text, date: new Date().toISOString() });
    return settle({ problem: { ...p } });
  }
  const problemUp = route.match(/^POST \/problems\/([^/]+)\/upvote$/);
  if (problemUp) {
    const p = problems.find((x) => x.id === problemUp[1]);
    if (!p) throw err(404, "Problem not found.");
    p.supportCount += 1;
    return settle({ problem: { ...p } });
  }

  // ---------- Announcements
  if (route === "GET /announcements") return settle({ announcements: [...announcements] });
  if (route === "POST /announcements") {
    const a = { id: makeId(), ...body, postedById: user?.id || "mock-user-admin", date: new Date().toISOString(), createdAt: new Date().toISOString() };
    announcements.unshift(a);
    return settle({ announcement: a });
  }
  const annDel = route.match(/^DELETE \/announcements\/([^/]+)$/);
  if (annDel) {
    const i = announcements.findIndex((x) => x.id === annDel[1]);
    if (i >= 0) announcements.splice(i, 1);
    return settle(null);
  }

  // ---------- Volunteers
  if (route === "GET /volunteers") return settle({ volunteers: [...volunteers] });

  // ---------- Users
  if (route === "GET /users") return settle({ users: users.map(safeUser) });
  const userPatch = route.match(/^PATCH \/users\/([^/]+)$/);
  if (userPatch) {
    const u = users.find((x) => x.id === userPatch[1]);
    if (!u) throw err(404, "User not found.");
    Object.assign(u, body);
    return settle({ user: safeUser(u) });
  }
  const userDel = route.match(/^DELETE \/users\/([^/]+)$/);
  if (userDel) {
    const i = users.findIndex((x) => x.id === userDel[1]);
    if (i >= 0) users.splice(i, 1);
    return settle(null);
  }
  const userPw = route.match(/^PATCH \/users\/([^/]+)\/password$/);
  if (userPw) return settle({ ok: true });

  // ---------- Activity log
  if (route === "GET /activity-log") return settle({ entries: [...activityLog] });
  if (route === "POST /activity-log") {
    const entry = { id: makeId(), actor: user?.name || "Guest", action: body.action, date: new Date().toISOString() };
    activityLog.unshift(entry);
    return settle({ entry });
  }

  // ---------- Suggestions
  if (route === "GET /suggestions") {
    let list = [...suggestions];
    if (query.wardId) list = list.filter((s) => s.wardId === query.wardId);
    if (query.status) list = list.filter((s) => s.status === query.status);
    if (query.category) list = list.filter((s) => s.category === query.category);
    return settle({ suggestions: list });
  }
  if (route === "POST /suggestions") {
    if (!user) throw err(401, "Not authenticated.");
    const n = suggestions.length + 1;
    const s = {
      id: makeId(),
      referenceId: refId("SG", n),
      ...body,
      wardName: wardName(body.wardId),
      status: "Submitted",
      moderationNote: null,
      supportCount: 0,
      submittedByName: user.name,
      submittedByPhone: user.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    suggestions.unshift(s);
    return settle({ suggestion: s });
  }
  const suggPatch = route.match(/^PATCH \/suggestions\/([^/]+)$/);
  if (suggPatch) {
    const s = suggestions.find((x) => x.id === suggPatch[1]);
    if (!s) throw err(404, "Suggestion not found.");
    Object.assign(s, body);
    s.updatedAt = new Date().toISOString();
    return settle({ suggestion: { ...s } });
  }
  const suggDel = route.match(/^DELETE \/suggestions\/([^/]+)$/);
  if (suggDel) {
    const i = suggestions.findIndex((x) => x.id === suggDel[1]);
    if (i >= 0) suggestions.splice(i, 1);
    return settle(null);
  }
  const suggUp = route.match(/^POST \/suggestions\/([^/]+)\/upvote$/);
  if (suggUp) {
    const s = suggestions.find((x) => x.id === suggUp[1]);
    if (!s) throw err(404, "Suggestion not found.");
    s.supportCount += 1;
    return settle({ suggestion: { ...s } });
  }

  // ---------- Feedback
  if (route === "GET /feedback") {
    const staff = user && ["Volunteer", "Ward Admin", "Administrator"].includes(user.role);
    const list = (staff ? feedback : feedback.filter((f) => f.isPublic)).map((f) => ({ ...f }));
    return settle({ feedback: list });
  }
  if (route === "POST /feedback") {
    const n = feedback.length + 1;
    const f = {
      id: makeId(),
      referenceId: refId("FB", n),
      topic: body.topic,
      message: body.message,
      rating: body.rating ? Number(body.rating) : null,
      wardId: body.wardId || null,
      isPublic: Boolean(body.isPublic),
      shareContact: Boolean(body.shareContact),
      submittedByName: body.shareContact ? (body.name || user?.name || null) : null,
      submittedByPhone: body.shareContact ? (body.phone || user?.phone || null) : null,
      response: null,
      respondedAt: null,
      createdAt: new Date().toISOString(),
    };
    feedback.unshift(f);
    return settle({ feedback: f });
  }
  const fbPatch = route.match(/^PATCH \/feedback\/([^/]+)$/);
  if (fbPatch) {
    const f = feedback.find((x) => x.id === fbPatch[1]);
    if (!f) throw err(404, "Feedback not found.");
    if (body.isPublic !== undefined) f.isPublic = Boolean(body.isPublic);
    if (body.response !== undefined) {
      f.response = body.response;
      f.respondedAt = body.response ? new Date().toISOString() : null;
    }
    return settle({ feedback: { ...f } });
  }
  const fbDel = route.match(/^DELETE \/feedback\/([^/]+)$/);
  if (fbDel) {
    const i = feedback.findIndex((x) => x.id === fbDel[1]);
    if (i >= 0) feedback.splice(i, 1);
    return settle(null);
  }

  // ---------- Health
  if (route === "GET /health") return settle({ ok: true });

  throw err(404, "Not found.");
}

export const MOCK_META = {
  demoPassword: DEMO_PASSWORD,
  demoAccounts: users.map((u) => ({ role: u.role, phone: u.phone })),
};
