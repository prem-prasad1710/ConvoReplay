import mongoose from "mongoose";

function getMongoUri(): string {
  const u = process.env.MONGODB_URI;
  if (typeof u !== "string" || u.length === 0) {
    throw new Error("Please define MONGODB_URI in .env");
  }
  return u;
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
    cache.promise = mongoose.connect(getMongoUri());
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
