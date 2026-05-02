import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    plan: { type: String, enum: ["free", "premium"], default: "free" },
    credits: { type: Number, default: 0 },
    /** YYYY-MM for rolling monthly free quota */
    usageMonth: { type: String, default: "" },
    freeAnalysesUsed: { type: Number, default: 0 },
    mistakePatterns: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export type UserDoc = mongoose.HydratedDocument<InferSchemaType<typeof userSchema>>;

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
