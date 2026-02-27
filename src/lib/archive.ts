import { subDays } from "date-fns";
import { db } from "./db";

/** Run once on app load: mark tasks completed > 30 days ago as archived. */
export async function runAutoArchive(): Promise<number> {
  const cutoff = subDays(new Date(), 30).toISOString();
  const toArchive = await db.tasks
    .where("status")
    .equals("completed")
    .filter((t) => Boolean(t.completedAt && t.completedAt < cutoff))
    .toArray();
  for (const t of toArchive) {
    await db.tasks.update(t.id, { status: "archived", updatedAt: new Date().toISOString() });
  }
  return toArchive.length;
}
