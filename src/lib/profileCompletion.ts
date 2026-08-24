export const PROFILE_COMPLETION_FIELDS = [
  "name",
  "dob",
  "gender",
  "religion",
  "profession",
  "height",
  "city",
  "relationshipGoal",
  "bio",
  "interests",
  "personality",
  "photos",
] as const;

export type ProfileCompletionField = (typeof PROFILE_COMPLETION_FIELDS)[number];

const FIELD_ALIASES: Record<ProfileCompletionField, readonly string[]> = {
  name: ["name"],
  dob: ["dob", "birthDate"],
  gender: ["gender"],
  religion: ["religion"],
  profession: ["profession"],
  height: ["height"],
  city: ["city"],
  relationshipGoal: ["relationshipGoal"],
  bio: ["bio"],
  interests: ["interests"],
  personality: ["personality", "personalityWords"],
  photos: ["photos", "avatarUrl"],
};

function hasValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasValue);
  if (typeof value === "string") return value.trim().length > 0;
  return value !== null && value !== undefined && value !== false;
}

export function calculateProfileCompletion(profile: Record<string, unknown> | null | undefined): number {
  if (!profile) return 0;

  const completedFields = PROFILE_COMPLETION_FIELDS.filter((field) =>
    FIELD_ALIASES[field].some((key) => hasValue(profile[key])),
  ).length;

  return Math.round((completedFields / PROFILE_COMPLETION_FIELDS.length) * 100);
}
