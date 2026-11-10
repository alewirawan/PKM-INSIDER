import { count, eq, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import type { Database } from "../../db/client.js";
import { applications } from "../../db/schema/applications.js";
import { applicationDocumentSlots } from "../../db/schema/documents.js";
import { posts } from "../../db/schema/posts.js";
import {
  contactMessages,
  newsletterSubscriptions,
} from "../../db/schema/messages.js";
import type { Access } from "../../shared/http/access.js";
import { requirementsMet } from "../applications/application.repository.js";
import { statusToUi } from "../applications/application.schema.js";

export async function registerDashboardRoutes(
  app: FastifyInstance,
  db: Database,
  access: Access,
) {
  app.get(
    "/dashboard/summary",
    { onRequest: access.guard(["super_admin"]) },
    async () => {
      const [rows, docs, published, messages, subscribers, weeks] =
        await Promise.all([
          db
            .select({
              id: applications.id,
              source: applications.source,
              status: applications.status,
              requirements: applications.documentRequirements,
            })
            .from(applications),
          db
            .select({
              applicationId: applicationDocumentSlots.applicationId,
              kind: applicationDocumentSlots.kind,
              status: applicationDocumentSlots.status,
            })
            .from(applicationDocumentSlots),
          db
            .select({ value: count() })
            .from(posts)
            .where(eq(posts.status, "Terbit")),
          db
            .select({ value: count() })
            .from(contactMessages)
            .where(eq(contactMessages.status, "Baru")),
          db.select({ value: count() }).from(newsletterSubscriptions),
          db.execute(sql`SELECT date_trunc('week', submitted_at AT TIME ZONE 'Asia/Jakarta')::date::text AS week, count(*)::int AS count
        FROM applications WHERE submitted_at >= now() - interval '28 days' GROUP BY 1 ORDER BY 1`),
        ]);
      const byStatus = {
        Verifikasi: 0,
        Terverifikasi: 0,
        Wawancara: 0,
        Diterima: 0,
        Ditolak: 0,
      };
      for (const row of rows) byStatus[statusToUi[row.status]]++;
      return {
        totalApplications: rows.length,
        websiteApplications: rows.filter((r) => r.source === "website").length,
        offlineApplications: rows.filter((r) => r.source === "offline").length,
        completeApplications: rows.filter((r) =>
          requirementsMet(
            r.requirements ?? {
              requiredKinds: [],
              requireOneGraduationDocument: false,
            },
            docs
              .filter(
                (d) =>
                  d.applicationId === r.id &&
                  d.status !== "missing" &&
                  d.status !== "needs_correction",
              )
              .map((d) => d.kind),
          ),
        ).length,
        byStatus,
        publishedPosts: published[0]!.value,
        unreadMessages: messages[0]!.value,
        newsletterCount: subscribers[0]!.value,
        weekly: weeks,
        generatedAt: new Date().toISOString(),
      };
    },
  );
}
