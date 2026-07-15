export const GENDER_OPTIONS = [
  { value: "female", label: "Woman" },
  { value: "male", label: "Man" },
  { value: "non-binary", label: "Non-binary" },
] as const;

export const REGISTRATION_GENDER_OPTIONS = [
  ...GENDER_OPTIONS,
  { value: "prefer-not", label: "Prefer not to say" },
] as const;

export const INTERESTED_IN_OPTIONS = [
  { value: "female", label: "Women" },
  { value: "male", label: "Men" },
  { value: "non-binary", label: "Non-binary" },
  { value: "everyone", label: "Everyone" },
] as const;

export type InterestedIn = (typeof INTERESTED_IN_OPTIONS)[number]["value"];
