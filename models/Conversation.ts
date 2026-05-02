import mongoose, { Schema, type InferSchemaType } from "mongoose";
import type { AnalysisResult } from "@/lib/types/analysis";

const conversationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "Conversation" },
    source: { type: String, enum: ["paste", "upload"], required: true },
    rawInput: { type: String, default: "" },
    contextMode: {
      type: String,
      enum: ["dating", "interview", "workplace", "friendship", "conflict", "negotiation"],
      required: true,
    },
    toneMode: { type: String, enum: ["brutal", "safe"], required: true },
    status: {
      type: String,
      enum: ["queued", "processing", "ready", "failed"],
      default: "queued",
      index: true,
    },
    normalizedTurns: { type: Schema.Types.Mixed, default: [] },
    warnings: { type: [String], default: [] },
    analysis: { type: Schema.Types.Mixed },
    errorMessage: { type: String },
    contentHash: { type: String, index: true },
    tokensUsed: { type: Number },
  },
  { timestamps: true }
);

export type ConversationDoc = InferSchemaType<typeof conversationSchema> & {
  _id: mongoose.Types.ObjectId;
  analysis?: AnalysisResult;
};

export const Conversation =
  mongoose.models.Conversation ?? mongoose.model("Conversation", conversationSchema);
