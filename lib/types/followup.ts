export type FollowupStatus = "pending" | "done" | "cancelled";

export const FOLLOWUP_STATUSES: readonly FollowupStatus[] = [
  "pending",
  "done",
  "cancelled",
] as const;

export type Followup = {
  id: string;
  profile_id: string;
  client_id: string | null;
  quote_id: string | null;
  subject: string;
  notes: string | null;
  due_at: string | null;
  status: FollowupStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type FollowupInsert = {
  subject: string;
  notes?: string | null;
  due_at?: string | null;
  client_id?: string | null;
  quote_id?: string | null;
};

export type FollowupFieldErrors = Partial<
  Record<"subject", "required">
>;

export type FollowupBucket = "overdue" | "today" | "upcoming" | "completed";

export function bucketOf(
  followup: Pick<Followup, "status" | "due_at">,
  now: Date = new Date(),
): FollowupBucket {
  if (followup.status !== "pending") return "completed";
  if (!followup.due_at) return "upcoming";
  const due = new Date(followup.due_at);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  if (due < startOfToday) return "overdue";
  if (due < endOfToday) return "today";
  return "upcoming";
}