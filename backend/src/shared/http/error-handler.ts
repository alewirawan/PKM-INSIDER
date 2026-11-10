import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/app-error.js";
import { ZodError } from "zod";

type ValidationIssue = {
  instancePath?: string;
  params?: { missingProperty?: string };
  message?: string;
};

export function registerErrorHandlers(app: FastifyInstance) {
  app.setNotFoundHandler((request, reply) => {
    return reply.code(404).send({
      message: "Endpoint tidak ditemukan.",
      code: "NOT_FOUND",
      requestId: request.id,
    });
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError)
      return reply.code(422).send({
        message: error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
        code: "VALIDATION_ERROR",
        requestId: request.id,
      });
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        message: error.message,
        code: error.code,
        requestId: request.id,
        ...(error.details ? { errors: error.details } : {}),
      });
    }

    const validation = (error as { validation?: ValidationIssue[] }).validation;
    if (validation) {
      const errors: Record<string, string[]> = {};
      for (const issue of validation) {
        const field =
          issue.params?.missingProperty ??
          issue.instancePath?.replace(/^\//, "") ??
          "request";
        errors[field] = [issue.message ?? "Nilai tidak valid."];
      }
      return reply.code(422).send({
        message: "Data yang dikirim belum valid.",
        code: "VALIDATION_ERROR",
        requestId: request.id,
        errors,
      });
    }

    const httpStatus = (error as { statusCode?: number }).statusCode;
    if (httpStatus && httpStatus >= 400 && httpStatus < 500)
      return reply
        .code(httpStatus)
        .send({
          message:
            httpStatus === 413
              ? "Ukuran atau jumlah berkas melebihi batas."
              : "Permintaan tidak valid.",
          code: "BAD_REQUEST",
          requestId: request.id,
        });
    request.log.error(
      { errorType: error instanceof Error ? error.name : "UnknownError" },
      "Unhandled request error",
    );
    return reply.code(500).send({
      message: "Terjadi kesalahan pada server.",
      code: "INTERNAL_SERVER_ERROR",
      requestId: request.id,
    });
  });
}
