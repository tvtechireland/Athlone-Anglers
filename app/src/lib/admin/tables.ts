export type FieldType = "text" | "textarea" | "date" | "number" | "image" | "select";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  // Options for type "select". For a clearer admin UI, pass
  // {value, label} pairs instead of plain strings where the stored value
  // (e.g. "catch_release") shouldn't be shown verbatim.
  options?: string[] | { value: string; label: string }[];
  // Short help text shown under the field in the add form.
  help?: string;
  // Only show this field in the add form when another field currently
  // holds a specific value (e.g. the trout rule type only makes sense
  // once "Trout competition" is picked as the fishing type).
  showWhen?: { field: string; equals: string };
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
      {
        name: "format",
        label: "Fishing type",
        type: "select",
        options: [
          { value: "trout", label: "Trout competition" },
          { value: "pike", label: "Pike competition" },
        ],
        help: "Pike rules are always the same. For trout, you'll also pick the rule type below.",
      },
      {
        name: "trout_rule_type",
        label: "Trout rule type",
        type: "select",
        options: [
          { value: "all_purpose", label: "All-purpose fishing" },
          { value: "catch_release", label: "Catch-and-release only" },
          { value: "all_methods", label: "All methods" },
        ],
        showWhen: { field: "format", equals: "trout" },
      },
      { name: "location", label: "Start location", type: "text" },
      { name: "finish_location", label: "Finish / weigh-in location", type: "text" },
      { name: "presentation_location", label: "Presentation location", type: "text" },
      { name: "sponsor_name", label: "Sponsor (optional)", type: "text" },
      { name: "sponsor_logo_url", label: "Sponsor logo (optional)", type: "image" },
      { name: "image_url", label: "Photo (optional)", type: "image" },
    ],
  },
  // No add-form is rendered for this (results are entered via the
  // dedicated "Record results" screen, not the generic admin form) — kept
  // in the allowlist purely so deleteRow("results", id) is permitted.
  results: {
    label: "Results",
    titleField: "angler_name",
    fields: [],
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
      {
        name: "kind",
        label: "Use for",
        type: "select",
        required: true,
        options: [
          { value: "event", label: "Event" },
          { value: "news", label: "News" },
          { value: "announcement", label: "WhatsApp announcement" },
        ],
      },
      { name: "name", label: "Template name", type: "text", required: true },
      { name: "title", label: "Default title (optional)", type: "text" },
      { name: "body", label: "Default write-up (description / body / message)", type: "textarea" },
      { name: "location", label: "Start location (events only)", type: "text" },
      { name: "finish_location", label: "Finish / weigh-in location (events only)", type: "text" },
      { name: "presentation_location", label: "Presentation location (events only)", type: "text" },
    ],
  },
  sponsors: {
    label: "Sponsors",
    titleField: "name",
    duplicateFields: ["name"],
    fields: [
      { name: "name", label: "Sponsor name", type: "text", required: true },
      { name: "logo_url", label: "Logo", type: "image" },
      { name: "website_url", label: "Website (optional)", type: "text" },
    ],
  },
};

export type TableName =
  | "members"
  | "news"
  | "events"
  | "results"
  | "rules"
  | "templates"
  | "sponsors";
