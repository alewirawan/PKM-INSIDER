import { requestApi } from "../api-client";
import type {
  Application,
  StudentDocument,
  DocumentRequirements,
} from "../cms/types";
import type { SelectedFiles } from "../../components/registration/DocumentFields";
export type ApplicationFields = {
  studentName: string;
  nisn: string;
  originSchool: string;
  birthPlace: string;
  birthDate: string;
  gender: "Laki-laki" | "Perempuan";
  address: string;
  parentName: string;
  parentOccupation: string;
  phone: string;
  email: string;
  extracurriculars: string[];
};
export type ApiDocument = Omit<StudentDocument, "key"> & {
  id: string;
  kind: StudentDocument["key"];
  hasFile: boolean;
  receivedPhysically: boolean;
};
type ApiApplication = Omit<Application, "documents"> & {
  source: "Website" | "Offline";
  documents: ApiDocument[];
  extracurriculars: string[];
  documentRequirements: DocumentRequirements;
};
function mapRecord(v: ApiApplication): Application {
  return {
    ...v,
    program: "",
    registrationSource: v.source,
    extracurricular: v.extracurriculars.join(", ") || "Belum menentukan",
    documents: v.documents.map((d) => ({ ...d, key: d.kind })),
  };
}
export async function listApplicationPage(query: URLSearchParams) {
  const result = await requestApi<{
    items: ApiApplication[];
    nextCursor: string | null;
  }>(`/applications?${query}`);
  return { ...result, items: result.items.map(mapRecord) };
}
export async function getApplication(id: string) {
  return mapRecord(await requestApi<ApiApplication>(`/applications/${id}`));
}
export async function updateApplication(
  id: string,
  value: Partial<ApplicationFields> & {
    status?: Application["status"];
    notes?: string;
  },
) {
  return mapRecord(
    await requestApi<ApiApplication>(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(value),
    }),
  );
}
export async function submitOnline(
  value: ApplicationFields & { password: string; consent: boolean },
  files: SelectedFiles,
  key: string,
) {
  const form = new FormData();
  form.append("data", JSON.stringify(value));
  for (const [kind, file] of Object.entries(files))
    if (file) form.append(kind, file);
  return requestApi<{ id: string; status: string; submittedAt: string }>(
    "/applications",
    {
      method: "POST",
      body: form,
      headers: { "Idempotency-Key": key },
      timeoutMs: 60000,
    },
  );
}
export async function submitOffline(
  value: ApplicationFields & { notes: string; receivedDocumentKinds: string[] },
  key: string,
) {
  return requestApi<{ id: string }>("/applications/offline", {
    method: "POST",
    body: JSON.stringify(value),
    headers: { "Idempotency-Key": key },
  });
}
export async function reviewDocument(
  id: string,
  documentId: string,
  status: string,
  reviewNote: string,
  receivedPhysically: boolean,
) {
  return requestApi(`/applications/${id}/documents/${documentId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, reviewNote, receivedPhysically }),
  });
}
export async function getApplicant() {
  return mapRecord(await requestApi<ApiApplication>("/applicant/application"));
}
export async function replaceDocument(kind: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return requestApi(`/applicant/documents/${kind}`, {
    method: "PUT",
    body: form,
    timeoutMs: 60000,
  });
}
export function missingRequirements(
  requirements: DocumentRequirements,
  available: string[],
) {
  return (
    requirements.requiredKinds.filter((k) => !available.includes(k)).length >
      0 ||
    (requirements.requireOneGraduationDocument &&
      !available.some((k) => k === "skl" || k === "ijazah"))
  );
}
