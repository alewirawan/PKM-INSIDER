import type {
  RegistrationSource,
  StudentDocument,
  StudentDocumentStatus,
} from "./types";

export const documentLabels: Array<Pick<StudentDocument, "key" | "label">> = [
  { key: "skl", label: "SKL" },
  { key: "ijazah", label: "Ijazah" },
  { key: "kk", label: "Kartu Keluarga" },
  { key: "ktp", label: "KTP orang tua/wali" },
  { key: "kip", label: "PIP / KIP (opsional)" },
  { key: "akta", label: "Akta Kelahiran" },
  { key: "rapor", label: "Rapor" },
  { key: "pasfoto", label: "Pas foto 3×4" },
];

export function createStudentDocuments(
  source: RegistrationSource,
  verifiedKeys: StudentDocument["key"][] = [],
  uploadedKeys: StudentDocument["key"][] = [],
): StudentDocument[] {
  return documentLabels.map((document) => {
    const status: StudentDocumentStatus = verifiedKeys.includes(document.key)
      ? "Terverifikasi"
      : uploadedKeys.includes(document.key)
        ? "Menunggu pemeriksaan"
        : "Belum ada";
    return {
      ...document,
      status,
      ...(status === "Belum ada"
        ? {}
        : { fileName: `${document.key}-${source.toLowerCase()}-demo.pdf` }),
    };
  });
}

export function normalizeDocuments(
  documents: StudentDocument[] = [],
): StudentDocument[] {
  const current = documentLabels.map((definition) => {
    const saved = documents.find((doc) => doc.key === definition.key);
    return {
      ...saved,
      ...definition,
      status:
        saved?.status === "Diunggah"
          ? ("Menunggu pemeriksaan" as const)
          : (saved?.status ?? ("Belum ada" as const)),
    };
  });
  return [
    ...current,
    ...documents
      .filter((document) => document.key === "photo")
      .map((document) => ({
        ...document,
        status:
          document.status === "Diunggah"
            ? ("Menunggu pemeriksaan" as const)
            : document.status,
      })),
  ];
}

export function requiredDocumentsComplete(documents: StudentDocument[] = []) {
  const ready = (key: StudentDocument["key"]) =>
    documents.some(
      (doc) =>
        doc.key === key &&
        !!doc.fileName &&
        ["Terverifikasi", "Menunggu pemeriksaan", "Diunggah"].includes(
          doc.status,
        ),
    );
  return (
    ["kk", "ktp", "akta"].every((key) =>
      ready(key as StudentDocument["key"]),
    ) &&
    (ready("skl") || ready("ijazah"))
  );
}
