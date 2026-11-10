import { createHash, randomBytes } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import type { FastifyRequest } from "fastify";
import type { Database } from "../../db/client.js";
import type { AppConfig } from "../../config/env.js";
import {
  applicantAccounts,
  applicantSessions,
  applicantAccessTokens,
} from "../../db/schema/applicant-auth.js";
import { applications } from "../../db/schema/applications.js";
import { auditEvents } from "../../db/schema/audit.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";
import { requireOrigin } from "../../shared/http/access.js";
import { findApplication } from "../applications/application.repository.js";

export const applicantCookie = "nh_applicant_session";
export const tokenHash = (s: string) =>
  createHash("sha256").update(s).digest("hex");
export function createApplicantAuth(db: Database, config: AppConfig) {
  const dummyHash = hash(randomBytes(32).toString("hex"));
  return {
    async login(number: string, password: string) {
      const [row] = await db
        .select({ account: applicantAccounts })
        .from(applicantAccounts)
        .innerJoin(
          applications,
          eq(applicantAccounts.applicationId, applications.id),
        )
        .where(
          and(
            eq(applications.registrationNumber, number.toUpperCase()),
            isNull(applicantAccounts.disabledAt),
          ),
        );
      const valid = await verify(
        row?.account.passwordHash ?? (await dummyHash),
        password,
      );
      if (!row || !row.account.activatedAt || !valid)
        throw new UnauthorizedError(
          "Nomor pendaftaran atau password tidak sesuai.",
        );
      const token = randomBytes(32).toString("base64url");
      await db
        .insert(applicantSessions)
        .values({
          tokenHash: tokenHash(token),
          accountId: row.account.id,
          expiresAt: new Date(Date.now() + 12 * 3600000),
        });
      return token;
    },
    async session(request: FastifyRequest) {
      const token = request.cookies[applicantCookie];
      if (!token)
        throw new UnauthorizedError("Silakan masuk sebagai pendaftar.");
      const [row] = await db
        .select({ account: applicantAccounts, application: applications })
        .from(applicantSessions)
        .innerJoin(
          applicantAccounts,
          eq(applicantSessions.accountId, applicantAccounts.id),
        )
        .innerJoin(
          applications,
          eq(applicantAccounts.applicationId, applications.id),
        )
        .where(
          and(
            eq(applicantSessions.tokenHash, tokenHash(token)),
            gt(applicantSessions.expiresAt, new Date()),
            isNull(applicantAccounts.disabledAt),
          ),
        );
      if (!row)
        throw new UnauthorizedError(
          "Sesi pendaftar berakhir. Silakan masuk kembali.",
        );
      if (!["GET", "HEAD", "OPTIONS"].includes(request.method))
        requireOrigin(request, config);
      return row;
    },
    async logout(token?: string) {
      if (token)
        await db
          .delete(applicantSessions)
          .where(eq(applicantSessions.tokenHash, tokenHash(token)));
    },
    async issue(number: string, adminId: string) {
      const app = await findApplication(db, number);
      const [account] = await db
        .select()
        .from(applicantAccounts)
        .where(eq(applicantAccounts.applicationId, app.id));
      if (!account)
        throw new UnauthorizedError(
          "Akun pendaftar belum tersedia untuk data lama ini.",
        );
      const token = randomBytes(32).toString("base64url");
      await db.transaction(async (tx) => {
        await tx.execute(
          sql`SELECT pg_advisory_xact_lock(hashtextextended(${account.id}, 0))`,
        );
        await tx
          .update(applicantAccessTokens)
          .set({ consumedAt: new Date() })
          .where(
            and(
              eq(applicantAccessTokens.accountId, account.id),
              isNull(applicantAccessTokens.consumedAt),
            ),
          );
        await tx
          .insert(applicantAccessTokens)
          .values({
            tokenHash: tokenHash(token),
            accountId: account.id,
            purpose: account.activatedAt ? "recovery" : "activation",
            issuedBy: adminId,
            expiresAt: new Date(Date.now() + 30 * 60000),
          });
        await tx
          .insert(auditEvents)
          .values({
            adminId,
            action: "applicant.access.issue",
            resourceType: "application",
            resourceId: number,
          });
      });
      return { token, expiresInMinutes: 30 };
    },
    async activate(token: string, password: string) {
      const passwordHash = await hash(password);
      await db.transaction(async (tx) => {
        const [access] = await tx
          .select()
          .from(applicantAccessTokens)
          .where(
            and(
              eq(applicantAccessTokens.tokenHash, tokenHash(token)),
              isNull(applicantAccessTokens.consumedAt),
              gt(applicantAccessTokens.expiresAt, new Date()),
            ),
          )
          .for("update");
        if (!access)
          throw new UnauthorizedError(
            "Tautan tidak valid, sudah dipakai, atau kedaluwarsa.",
          );
        const [account] = await tx
          .update(applicantAccounts)
          .set({ passwordHash, activatedAt: new Date() })
          .where(
            and(
              eq(applicantAccounts.id, access.accountId),
              isNull(applicantAccounts.disabledAt),
            ),
          )
          .returning();
        if (!account) throw new UnauthorizedError();
        await tx
          .update(applicantAccessTokens)
          .set({ consumedAt: new Date() })
          .where(eq(applicantAccessTokens.accountId, access.accountId));
        await tx
          .delete(applicantSessions)
          .where(eq(applicantSessions.accountId, access.accountId));
        await tx
          .insert(auditEvents)
          .values({
            applicantAccountId: access.accountId,
            action: "applicant.access.activate",
            resourceType: "application",
            resourceId: account.applicationId,
          });
      });
    },
  };
}
