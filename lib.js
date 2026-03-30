import { REPAIRS_TABLE, SUPABASE_ANON_KEY, SUPABASE_URL, VISITS_TABLE } from "./config.js";
import { supabase } from "./supabaseClient.js";

const DAY_STORAGE_KEY = "repair_cafe_day_override";
const DEVICE_TOKEN_KEY = "repair_cafe_device_token";
const VISITS_LOCAL_KEY = "repair_cafe_visits_v1";
const REPAIRS_LOCAL_KEY = "repair_cafe_repairs_v1";
const UI_LANG_KEY = "repair_cafe_ui_lang";

function isSupabaseConfigured() {
  return !SUPABASE_URL.includes("YOUR_PROJECT_ID") && !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY");
}

function readJsonArray(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJsonArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function safeUuid() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getUiLanguage() {
  const params = new URLSearchParams(location.search);
  const queryLang = (params.get("lang") || "").toLowerCase();
  if (queryLang === "en" || queryLang === "nl") {
    localStorage.setItem(UI_LANG_KEY, queryLang);
    return queryLang;
  }

  const storedLang = (localStorage.getItem(UI_LANG_KEY) || "").toLowerCase();
  if (storedLang === "en" || storedLang === "nl") {
    return storedLang;
  }
  return "nl";
}

export function getLocalISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getDeviceToken() {
  let token = localStorage.getItem(DEVICE_TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(DEVICE_TOKEN_KEY, token);
  }
  return token;
}

async function fetchExactCount(tableName, columnName, value, extraEq = {}) {
  const { count, error } = await supabase
    .from(tableName)
    .select("id", { count: "exact", head: true })
    .eq(columnName, value)
    .match(extraEq);

  if (error) throw error;
  return count ?? 0;
}

export async function upsertVisitOncePerDay(visitDay) {
  const deviceToken = getDeviceToken();
  const visits = readJsonArray(VISITS_LOCAL_KEY);
  const already = visits.some((v) => v.visit_day === visitDay && v.device_token === deviceToken);
  if (!already) {
    visits.push({
      id: safeUuid(),
      visit_day: visitDay,
      device_token: deviceToken,
      created_at: nowIso(),
    });
    writeJsonArray(VISITS_LOCAL_KEY, visits);
  }

  if (!isSupabaseConfigured()) return;
  try {
    // Local-first mode: write locally first, then best-effort mirror to Supabase.
    const { error } = await supabase
      .from(VISITS_TABLE)
      .upsert(
        {
          visit_day: visitDay,
          device_token: deviceToken,
        },
        { onConflict: "visit_day,device_token" }
      );
    if (error) throw error;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Supabase visit mirror failed; continuing with localStorage data.", e);
  }
}

export async function fetchVisitorCountToday(visitDay) {
  const visits = readJsonArray(VISITS_LOCAL_KEY);
  return visits.filter((v) => v.visit_day === visitDay).length;
}

export async function fetchRepairsSummaryToday(repairDay) {
  const repairs = readJsonArray(REPAIRS_LOCAL_KEY).filter((r) => r.repair_day === repairDay);
  const queuedCount = repairs.filter((r) => r.status === "queued").length;
  const inProgressCount = repairs.filter((r) => r.status === "in_progress").length;
  const doneCount = repairs.filter((r) => r.status === "done").length;

  return { queuedCount, inProgressCount, doneCount };
}

export async function fetchLatestRepairsToday(repairDay, limit = 14) {
  const repairs = readJsonArray(REPAIRS_LOCAL_KEY)
    .filter((r) => r.repair_day === repairDay)
    .sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")))
    .slice(0, limit);
  return repairs;
}

export async function addRepairItemToday(repairDay, { category, description }) {
  const row = {
    id: safeUuid(),
    repair_day: repairDay,
    category: category?.trim() || "General",
    description: description?.trim() || "",
    status: "queued",
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  const repairs = readJsonArray(REPAIRS_LOCAL_KEY);
  repairs.push(row);
  writeJsonArray(REPAIRS_LOCAL_KEY, repairs);

  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from(REPAIRS_TABLE).insert({
      repair_day: row.repair_day,
      category: row.category,
      description: row.description,
      status: row.status,
    });
    if (error) throw error;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Supabase repair insert mirror failed; continuing with localStorage data.", e);
  }
}

export async function setRepairStatus(repairId, newStatus) {
  const repairs = readJsonArray(REPAIRS_LOCAL_KEY);
  const idx = repairs.findIndex((r) => r.id === repairId);
  if (idx >= 0) {
    repairs[idx] = { ...repairs[idx], status: newStatus, updated_at: nowIso() };
    writeJsonArray(REPAIRS_LOCAL_KEY, repairs);
  }

  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from(REPAIRS_TABLE).update({ status: newStatus }).eq("id", repairId);
    if (error) throw error;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Supabase repair update mirror failed; continuing with localStorage data.", e);
  }
}

export function statusLabel(status, lang = "nl") {
  if (status === "queued") return lang === "en" ? "Queued" : "Wachtrij";
  if (status === "in_progress") return lang === "en" ? "In progress" : "Bezig";
  if (status === "done") return lang === "en" ? "Done" : "Klaar";
  return status;
}

export function statusTone(status) {
  if (status === "queued") return "toneQueued";
  if (status === "in_progress") return "toneProgress";
  if (status === "done") return "toneDone";
  return "toneQueued";
}

export function getEffectiveRepairDay() {
  // Handy for testing: you can override the day from devtools without touching code.
  const override = localStorage.getItem(DAY_STORAGE_KEY);
  return override || getLocalISODate();
}

