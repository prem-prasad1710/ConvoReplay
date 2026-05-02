import mongoose, { Schema } from "mongoose";

const analysisCacheSchema = new Schema(
  {
    contentHash: { type: String, required: true, index: true },
    contextMode: { type: String, required: true },
    toneMode: { type: String, required: true },
    analysis: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

analysisCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AnalysisCache =
  mongoose.models.AnalysisCache ?? mongoose.model("AnalysisCache", analysisCacheSchema);
