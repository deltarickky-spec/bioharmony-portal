import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "storage");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ orders: [], submissions: [] }, null, 2));
}

function readDb() {
  ensure();
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function writeDb(db) {
  ensure();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function newId(prefix = "id") {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

export function createOrder(order) {
  const db = readDb();
  db.orders.push(order);
  writeDb(db);
  return order;
}

export function updateOrderBySessionId(session_id, patch) {
  const db = readDb();
  const idx = db.orders.findIndex((o) => o.stripe_session_id === session_id);
  if (idx === -1) return null;
  db.orders[idx] = { ...db.orders[idx], ...patch };
  writeDb(db);
  return db.orders[idx];
}

export function getOrderBySessionId(session_id) {
  const db = readDb();
  return db.orders.find((o) => o.stripe_session_id === session_id) || null;
}

export function listSubmissions() {
  const db = readDb();
  return db.submissions.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
}

export function createSubmission(submission) {
  const db = readDb();
  db.submissions.push(submission);
  writeDb(db);
  return submission;
}

export function updateSubmission(id, patch) {
  const db = readDb();
  const idx = db.submissions.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  db.submissions[idx] = { ...db.submissions[idx], ...patch };
  writeDb(db);
  return db.submissions[idx];
}

export function getSubmission(id) {
  const db = readDb();
  return db.submissions.find((s) => s.id === id) || null;
}
