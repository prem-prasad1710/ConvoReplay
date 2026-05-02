import mongoose from "mongoose";

function getMongoUri(): string {
  const u = process.env.MONGODB_URI;
  if (typeof u !== "string" || u.length === 0) {
    throw new Error("Please define MONGODB_URI in .env");
  }
  return u;
}

/**
 * Path segment after host (e.g. ...mongodb.net/convoreplay?opts → convoreplay).
 * If missing, Mongoose would otherwise default new data to the `test` database.
 */
export function parseDbNameFromUri(uri: string): string | undefined {
  const q = uri.indexOf("?");
  const base = q === -1 ? uri : uri.slice(0, q);
  const afterScheme = base.split("://")[1];
  if (!afterScheme) return undefined;
  const slash = afterScheme.indexOf("/");
  if (slash === -1 || slash === afterScheme.length - 1) return undefined;
  const db = afterScheme.slice(slash + 1).replace(/\/+$/, "");
  if (!db.length) return undefined;
  try {
    return decodeURIComponent(db);
  } catch {
    return db;
  }
}

/** Which database name Atlas / Compass should show after the first write. */
export function getResolvedMongoDbName(): string | null {
  const u = process.env.MONGODB_URI;
  if (typeof u !== "string" || u.length === 0) return null;
  const normalized = normalizeMongoUri(u);
  const fromPath = parseDbNameFromUri(normalized);
  if (fromPath) return fromPath;
  const fromEnv = process.env.MONGODB_DB?.trim();
  if (fromEnv) return fromEnv;
  return "convoreplay";
}

/**
 * Fixes a common Atlas/Vercel mistake: putting the DB name in the query string
 * (`...net/?convoreplay&retryWrites=...`) which triggers MongoParseError:
 * "option convoreplay is not supported". Correct form: `...net/convoreplay?retryWrites=...`
 */
export function normalizeMongoUri(uri: string): string {
  if (parseDbNameFromUri(uri)) return uri;

  const qIndex = uri.indexOf("?");
  if (qIndex === -1) return uri;

  const base = uri.slice(0, qIndex);
  const query = uri.slice(qIndex + 1);
  const firstAmp = query.indexOf("&");
  const firstPart = firstAmp === -1 ? query : query.slice(0, firstAmp);
  const rest = firstAmp === -1 ? "" : query.slice(firstAmp + 1);

  if (firstPart.includes("=")) return uri;

  if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(firstPart)) return uri;

  const reserved = new Set([
    "retrywrites",
    "tls",
    "ssl",
    "w",
    "journal",
    "readpreference",
    "readconcernlevel",
    "authsource",
    "authmechanism",
    "compressors",
    "appname",
  ]);
  if (reserved.has(firstPart.toLowerCase())) return uri;

  if (parseDbNameFromUri(base)) return uri;

  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const newBase = `${trimmedBase}/${firstPart}`;
  return rest.length > 0 ? `${newBase}?${rest}` : newBase;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongoose = globalThis as unknown as {
  mongooseCache?: MongooseCache;
};

const cache: MongooseCache = globalForMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalForMongoose.mongooseCache = cache;

export async function connectDb(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    const raw = getMongoUri();
    const uri = normalizeMongoUri(raw);
    const opts: mongoose.ConnectOptions = {};
    if (!parseDbNameFromUri(uri)) {
      opts.dbName = process.env.MONGODB_DB?.trim() || "convoreplay";
    }
    cache.promise = mongoose.connect(uri, opts);
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
