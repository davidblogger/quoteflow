export type NotificationType =
  | "new_request"
  | "quote_sent"
  | "quote_accepted"
  | "quote_rejected"
  | "followup_created"
  | "followup_completed"
  | "client_created";

export const NOTIFICATION_TYPES: readonly NotificationType[] = [
  "new_request",
  "quote_sent",
  "quote_accepted",
  "quote_rejected",
  "followup_created",
  "followup_completed",
  "client_created",
] as const;

export type Notification = {
  id: string;
  profile_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  link: string | null;
  reference_id: string | null;
  read_at: string | null;
  created_at: string;
};
