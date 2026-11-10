import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink, readFile } from "node:fs/promises";
import path from "node:path";
import type { FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import { documentKindInput } from "../applications/application.schema.js";

export type UploadFile = {
  kind: ReturnType<typeof documentKindInput.parse>;
  originalName: string;
  mimeType: string;
  bytes: Buffer;
  storageKey?: string;
};
export function detectMime(bytes: Buffer) {
  if (bytes.subarray(0, 5).toString() === "%PDF-") return "application/pdf";
  if (
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return "image/jpeg";
  throw new AppError(
    "Isi berkas harus PDF, JPG, atau PNG.",
    422,
    "INVALID_FILE",
  );
}
export async function readUpload(
  request: FastifyRequest,
  replacementKind?: UploadFile["kind"],
) {
  if (!request.isMultipart())
    throw new AppError(
      "Gunakan formulir multipart untuk berkas.",
      415,
      "UNSUPPORTED_MEDIA_TYPE",
    );
  let data: unknown;
  const files: UploadFile[] = [];
  for await (const part of request.parts()) {
    if (part.type === "file") {
      const kind =
        replacementKind && part.fieldname === "file"
          ? replacementKind
          : documentKindInput.parse(part.fieldname);
      if (replacementKind && kind !== replacementKind)
        throw new AppError("Jenis berkas tidak sesuai.", 422, "INVALID_FILE");
      if (files.some((f) => f.kind === kind))
        throw new AppError(
          "Jenis berkas tidak boleh berulang.",
          422,
          "INVALID_FILE",
        );
      const bytes = await part.toBuffer();
      if (!bytes.length || bytes.length > 5242880 || part.file.truncated)
        throw new AppError(
          "Berkas harus berukuran 1 byte sampai 5 MB.",
          413,
          "INVALID_FILE_SIZE",
        );
      const mimeType = detectMime(bytes);
      const ext = path.extname(part.filename).toLowerCase();
      if (
        !(
          mimeType === "application/pdf"
            ? [".pdf"]
            : mimeType === "image/png"
              ? [".png"]
              : [".jpg", ".jpeg"]
        ).includes(ext) ||
        mimeType !== part.mimetype
      )
        throw new AppError(
          "Nama, jenis, dan isi berkas harus sesuai.",
          422,
          "INVALID_FILE",
        );
      const originalName = [
        ...path.basename(part.filename.replaceAll("\\", "/")),
      ]
        .filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) !== 127)
        .join("")
        .slice(0, 255);
      if (!originalName)
        throw new AppError("Nama berkas tidak valid.", 422, "INVALID_FILE");
      files.push({ kind, originalName, mimeType, bytes });
    } else {
      if (replacementKind || part.fieldname !== "data" || data !== undefined)
        throw new AppError("Field formulir tidak valid.", 422, "INVALID_FORM");
      try {
        data = JSON.parse(String(part.value));
      } catch {
        throw new AppError(
          "Data formulir bukan JSON valid.",
          422,
          "INVALID_FORM",
        );
      }
    }
  }
  if (replacementKind && files.length !== 1)
    throw new AppError("Pilih satu berkas.", 422, "INVALID_FILE");
  return { data, files };
}
export function createStorage(root: string) {
  const base = path.resolve(root);
  const filePath = (key: string) => {
    if (!/^[a-f0-9-]{36}$/.test(key))
      throw new AppError("Berkas tidak ditemukan.", 404, "NOT_FOUND");
    return path.join(base, key);
  };
  return {
    async save(file: UploadFile) {
      await mkdir(base, { recursive: true, mode: 0o700 });
      const key = randomUUID();
      await writeFile(filePath(key), file.bytes, { flag: "wx", mode: 0o600 });
      file.storageKey = key;
      return key;
    },
    async remove(key: string) {
      await unlink(filePath(key)).catch(() => undefined);
    },
    async read(key: string) {
      try {
        return await readFile(filePath(key));
      } catch {
        throw new AppError(
          "Berkas tidak tersedia pada storage.",
          404,
          "NOT_FOUND",
        );
      }
    },
  };
}
