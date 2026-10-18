export type FieldType = "text" | "textarea" | "date" | "number";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
};

export type TableConfig = {
  label: string;
  fields: FieldConfig[];
  // Field used as the row title in the admin list view.
  titleField: string;
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
    ],
  },
  events: {
    label: "Events",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "event_date", label: "Date", type: "date", required: true },
      { name: "location", label: "Location", type: "text" },
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
};

export type TableName = "members" | "news" | "events" | "results";
