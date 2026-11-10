import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { Database } from "../../db/client.js";
import type { AppConfig } from "../../config/env.js";
import { requireOrigin, type Access } from "../../shared/http/access.js";
import { createStorage, readUpload } from "../documents/document.storage.js";
import { createDocumentService } from "../documents/document.service.js";
import {
  createApplicantAuth,
  applicantCookie,
} from "../applicant-auth/applicant-auth.service.js";
import { createApplicationService } from "./application.service.js";
import {
  findApplication,
  applicationRecord,
  listApplications,
  getDocuments,
} from "./application.repository.js";
import { documentKindInput } from "./application.schema.js";

export async function registerApplicationRoutes(
  app: FastifyInstance,
  db: Database,
  access: Access,
  config: AppConfig,
) {
  const storage = createStorage(config.UPLOAD_DIR),
    service = createApplicationService(db, storage),
    documents = createDocumentService(db, storage),
    auth = createApplicantAuth(db, config);
  const roles = ["super_admin", "admin_ppdb"] as const;
  const guard = access.guard([...roles]);
  const id = (v: unknown) =>
    z
      .string()
      .regex(/^NH-[A-Z0-9-]+$/)
      .max(64)
      .parse(v);
  const cookieOptions = {
    path: "/api/v1/applicant",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: config.NODE_ENV === "production",
    maxAge: 12 * 3600,
  };
  app.post(
    "/applications",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (r, reply) => {
      requireOrigin(r, config);
      const { data, files } = await readUpload(r);
      return reply
        .code(201)
        .send(
          await service.submit(
            data,
            files,
            z.uuid().parse(r.headers["idempotency-key"]),
          ),
        );
    },
  );
  app.get("/applications", { onRequest: guard }, (r) =>
    listApplications(db, r.query),
  );
  app.put<{ Params: { number: string; kind: string } }>(
    "/applications/:number/documents/by-kind/:kind",
    { onRequest: guard },
    async (r) => {
      const admin = await access.admin(r, [...roles]);
      const application = await findApplication(db, id(r.params.number));
      const { files } = await readUpload(
        r,
        documentKindInput.parse(r.params.kind),
      );
      return documents.replace(application.id, null, files[0]!, admin.adminId);
    },
  );
  app.post("/applications/offline", { onRequest: guard }, async (r, reply) => {
    const admin = await access.admin(r, [...roles]);
    return reply
      .code(201)
      .send(
        await service.submit(
          r.body,
          [],
          z.uuid().parse(r.headers["idempotency-key"]),
          admin.adminId,
        ),
      );
  });
  app.get<{ Params: { number: string } }>(
    "/applications/:number",
    { onRequest: guard },
    async (r) =>
      applicationRecord(db, await findApplication(db, id(r.params.number))),
  );
  app.patch<{ Params: { number: string } }>(
    "/applications/:number",
    { onRequest: guard },
    async (r) =>
      service.update(
        id(r.params.number),
        r.body,
        (await access.admin(r, [...roles])).adminId,
      ),
  );
  app.get<{ Params: { number: string } }>(
    "/applications/:number/documents",
    { onRequest: guard },
    async (r) =>
      getDocuments(db, (await findApplication(db, id(r.params.number))).id),
  );
  app.patch<{ Params: { number: string; slot: string } }>(
    "/applications/:number/documents/:slot",
    { onRequest: guard },
    async (r) =>
      documents.review(
        id(r.params.number),
        r.params.slot,
        r.body,
        (await access.admin(r, [...roles])).adminId,
      ),
  );
  app.get<{ Params: { number: string; slot: string } }>(
    "/applications/:number/documents/:slot/download",
    { onRequest: guard },
    async (r, reply) => {
      const file = await documents.download(
        (await findApplication(db, id(r.params.number))).id,
        r.params.slot,
      );
      return reply
        .type(file.mime)
        .header(
          "Content-Disposition",
          `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        )
        .header("X-Content-Type-Options", "nosniff")
        .send(file.bytes);
    },
  );
  app.post<{ Params: { number: string } }>(
    "/applications/:number/access",
    { onRequest: guard },
    async (r) =>
      auth.issue(
        id(r.params.number),
        (await access.admin(r, [...roles])).adminId,
      ),
  );
  app.post(
    "/applicant/login",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (r, reply) => {
      requireOrigin(r, config);
      const v = z
        .strictObject({
          number: z.string().min(1).max(64),
          password: z.string().min(1).max(128),
        })
        .parse(r.body);
      reply.setCookie(
        applicantCookie,
        await auth.login(v.number, v.password),
        cookieOptions,
      );
      return reply.code(204).send();
    },
  );
  app.post("/applicant/logout", async (r, reply) => {
    requireOrigin(r, config);
    await auth.logout(r.cookies[applicantCookie]);
    reply.clearCookie(applicantCookie, { path: cookieOptions.path });
    return reply.code(204).send();
  });
  app.post(
    "/applicant/activate",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (r, reply) => {
      requireOrigin(r, config);
      const v = z
        .strictObject({
          token: z.string().min(32).max(128),
          password: z.string().min(12).max(128),
        })
        .parse(r.body);
      await auth.activate(v.token, v.password);
      return reply.code(204).send();
    },
  );
  app.get("/applicant/application", async (r) => {
    const session = await auth.session(r);
    const record = await applicationRecord(db, session.application);
    return {
      ...record,
      notes: undefined,
      documents: record.documents.map((doc) => ({
        ...doc,
        reviewedBy: undefined,
      })),
    };
  });
  app.put<{ Params: { kind: string } }>(
    "/applicant/documents/:kind",
    async (r) => {
      const session = await auth.session(r);
      const { files } = await readUpload(
        r,
        documentKindInput.parse(r.params.kind),
      );
      return documents.replace(
        session.application.id,
        session.account.id,
        files[0]!,
      );
    },
  );
  app.get<{ Params: { slot: string } }>(
    "/applicant/documents/:slot/download",
    async (r, reply) => {
      const session = await auth.session(r),
        file = await documents.download(session.application.id, r.params.slot);
      return reply
        .type(file.mime)
        .header(
          "Content-Disposition",
          `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        )
        .header("X-Content-Type-Options", "nosniff")
        .send(file.bytes);
    },
  );
}
