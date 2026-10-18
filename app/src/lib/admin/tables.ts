export type FieldType = "text" | "textarea" | "date" | "number" | "image" | "select";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  // Options for type "select".
  options?: string[];
};

export type TableConfig = {
  label: string;
  fields: FieldConfig[];
  // Field used as the row title in the admin list view.
  titleField: string;
  // If set, addRow refuses a new row whose values match an existing row on
  // all of these fields (text fields compared case-insensitively) — used to
  // catch accidental double-entry (e.g. the same event added twice).
  duplicateFields?: string[];
};

// Allowlist of committee-manageable tables — admin server actions only
// ever touch a table name that appears here, as a key, never a raw
// value from the request.
export const TABLE_CONFIGS: Record<string, TableConfig> = {
  members: {
    label: "Members",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "text", required: true },
      { name: "membership_type", label: "Membership type", type: "text" },
      { name: "paid_until", label: "Paid until", type: "date" },
    ],
  },
  news: {
    label: "News",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "body", label: "Body", type: "textarea", required: true },
      { name: "published_at", label: "Published at", type: "date" },
      { name: "image_url", label: "Photo (optional)", type: "image" },
    ],
  },
  events: {
    label: "Events",
    titleField: "title",
    duplicateFields: ["title", "event_date"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "event_date", label: "Date", type: "date", required: true },
      { name: "location", label: "Start location", type: "text" },
      { name: "finish_location", label: "Finish / weigh-in location", type: "text" },
      { name: "presentation_location", label: "Presentation location", type: "text" },
      { name: "image_url", label: "Photo (optional)", type: "image" },
    ],
  },
  results: {
    label: "Competition results",
    titleField: "competition_name",
    fields: [
      { name: "competition_name", label: "Competition", type: "text", required: true },
      { name: "event_date", label: "Date", type: "date", required: true },
      { name: "angler_name", label: "Angler", type: "text", required: true },
      { name: "weight_kg", label: "Weight (kg)", type: "number" },
      { name: "position", label: "Position", type: "number" },
    ],
  },
  competitions: {
    label: "Competitions",
    titleField: "name",
    duplicateFields: ["name", "event_date"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "event_date", label: "Date", type: "date", required: true },
      { name: "sponsor_name", label: "Sponsor (optional)", type: "text" },
      { name: "sponsor_logo_url", label: "Sponsor logo (optional)", type: "image" },
    ],
  },
  rules: {
    label: "Club rules",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "body", label: "Rule text", type: "textarea", required: true },
    ],
  },
  templates: {
    label: "Templates",
    titleField: "name",
    fields: [
      { name: "kind", label: "Use for", type: "select", options: ["event", "news"], required: true },
      { name: "name", label: "Template name", type: "text", required: true },
      { name: "title", label: "Default title (optional)", type: "text" },
      { name: "body", label: "Default write-up (description / body)", type: "textarea" },
      { name: "location", label: "Start location (events only)", type: "text" },
      { name: "finish_location", label: "Finish / weigh-in location (events only)", type: "text" },
      { name: "presentation_location", label: "Presentation location (events only)", type: "text" },
    ],
  },
};

export type TableName =
  | "members"
  | "news"
  | "events"
  | "results"
  | "competitions"
  | "rules"
  | "templates";
