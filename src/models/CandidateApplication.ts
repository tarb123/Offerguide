import mongoose from "mongoose";

/**
 * Single source of truth for the CandidateApplication model.
 *
 * Previously this schema was redefined inline in every route. Because Mongoose
 * caches the first compiled model on `mongoose.models` for the life of the Node
 * process, adding a field (e.g. `assignedProgramId`) had no effect until a full
 * server restart — the cached, field-less model kept winning and silently
 * dropped the new path on read and write.
 *
 * Defining it once here, and re-registering it whenever this module evaluates,
 * makes schema changes take effect on hot-reload without a manual restart.
 */
const CandidateApplicationSchema = new mongoose.Schema(
  {
    candidateId: String,
    email: { type: String, lowercase: true },
    fullName: String,

    guardianName: String,
    gender: String,
    nationality: String,
    cnic: String,
    dob: String,
    address: String,
    contactNumber: String,

    qualification: String,
    recentJobTitleYear: String,
    expectations: String,
    laptopAvailable: String,
    internetConnection: String,

    confirmation: Boolean,
    termsAgreement: Boolean,

    // Enrollment link — which program (and therefore which mentor) the
    // candidate is registered under.
    assignedProgramId: String,
    assignedProgramName: String,
  },
  { timestamps: true }
);

// Drop any previously-compiled model so this schema always wins on reload.
if (mongoose.models.CandidateApplication) {
  mongoose.deleteModel("CandidateApplication");
}

const CandidateApplication = mongoose.model(
  "CandidateApplication",
  CandidateApplicationSchema
);

export default CandidateApplication;
