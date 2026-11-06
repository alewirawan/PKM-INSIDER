// Run from the repository root:
// npm exec --yes --package=ajv-cli -- node contracts/tests/schema.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const yaml = require("js-yaml");

// npm exec exposes its isolated validator through PATH; no app dependency changes.
const executable = process.platform === "win32" ? "ajv.cmd" : "ajv";
const bin = process.env.PATH.split(path.delimiter)
  .map((directory) => path.join(directory, executable))
  .find((candidate) => fs.existsSync(candidate));
assert.ok(bin, "Run this test using the npm exec command above.");
const validatorRequire = createRequire(
  path.join(path.dirname(bin), "..", "package.json"),
);
const Ajv2020 = validatorRequire("ajv/dist/2020").default;
const addFormats = require("ajv-formats");
const document = yaml.load(
  fs.readFileSync(path.join(__dirname, "..", "openapi.yaml"), "utf8"),
);
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
ajv.addFormat("binary", true);
const id = "urn:nurul-huda:contract-test";
ajv.addSchema({ $id: id, components: document.components });
let count = 0;

function check(name, schema, data, expected) {
  const validate = ajv.getSchema(id + "#/components/schemas/" + schema);
  assert.ok(validate, schema);
  assert.equal(
    validate(data),
    expected,
    name + ": " + JSON.stringify(validate.errors),
  );
  count++;
}

function walk(value) {
  if (!value || typeof value !== "object") return;
  assert.ok(
    !Object.hasOwn(value, ""),
    "Empty key: possible shell interpolation of $ref.",
  );
  if (value.$ref) {
    assert.ok(
      value.$ref.startsWith("#/"),
      "Only local references are expected.",
    );
    const resolved = value.$ref
      .slice(2)
      .split("/")
      .reduce(
        (current, key) =>
          current?.[key.replace(/~1/g, "/").replace(/~0/g, "~")],
        document,
      );
    assert.ok(resolved, "Unresolved reference: " + value.$ref);
  }
  Object.values(value).forEach(walk);
}
walk(document);
for (const name of Object.keys(document.components.schemas)) {
  assert.ok(ajv.getSchema(id + "#/components/schemas/" + name), name);
}
const operationIds = new Set();
for (const [route, item] of Object.entries(document.paths)) {
  for (const method of ["get", "post", "put", "patch", "delete"]) {
    const operation = item[method];
    if (!operation) continue;
    assert.ok(
      !operationIds.has(operation.operationId),
      "Duplicate operationId",
    );
    operationIds.add(operation.operationId);
    assert.ok(
      Number.isInteger(operation["x-owner"]) &&
        operation["x-owner"] >= 1 &&
        operation["x-owner"] <= 10,
    );
    assert.equal(
      operation["x-implementation-status"],
      route.startsWith("/auth/") ? "foundation" : [2, 4].includes(operation["x-owner"]) ? "implemented" : "planned",
    );
    if (operation.security) assert.ok(operation["x-roles"].length);
  }
}

const validPost = {
  title: "Artikel Uji Backend",
  slug: "artikel-uji-backend",
  category: "Akademik",
  image: "/images/science.jpg",
  excerpt: "Ringkasan artikel yang memenuhi batas minimum.",
  content: ["Isi artikel uji."],
  author: "Editor Uji",
  status: "Draft",
  publishedAt: "2026-11-05T05:00:00.000Z",
};
check("post input includes publication timestamp", "PostInput", validPost, true);
const postWithoutPublishedAt = { ...validPost };
delete postWithoutPublishedAt.publishedAt;
check("post input requires publishedAt", "PostInput", postWithoutPublishedAt, false);
check("post response includes separate update timestamp", "Post", {
  ...validPost,
  id: "7e6b79d5-ae9b-4a9f-88d2-2e7f8c88b3b1",
  updatedAt: "2026-11-05T05:30:00.000Z",
}, true);

const student = {
  studentName: "Siswa Uji",
  nisn: "0000000000",
  originSchool: "SD Contoh",
  birthPlace: "Kota Contoh",
  birthDate: "2013-01-02",
  gender: "Perempuan",
  address: "Alamat fiktif untuk pengujian",
  parentName: "Wali Uji",
  phone: "080000000000",
  email: "wali@example.test",
  extracurriculars: [],
};
check("empty extracurricular selections", "ApplicationCreate", student, true);
check(
  "multiple optional selections",
  "ApplicationCreate",
  { ...student, extracurriculars: ["Pramuka", "PMR"] },
  true,
);
check(
  "duplicate selections rejected",
  "ApplicationCreate",
  { ...student, extracurriculars: ["PMR", "PMR"] },
  false,
);
check(
  "old single choice rejected",
  "ApplicationCreate",
  { ...student, extracurricular: "PMR" },
  false,
);
check(
  "legacy program rejected",
  "ApplicationCreate",
  { ...student, program: "STEM" },
  false,
);
const missingChoice = { ...student };
delete missingChoice.extracurriculars;
check("choice omitted is allowed", "ApplicationCreate", missingChoice, true);
check("invalid NISN", "ApplicationCreate", { ...student, nisn: "123" }, false);
check(
  "invalid email",
  "ApplicationCreate",
  { ...student, email: "invalid" },
  false,
);
check(
  "client cannot set status",
  "ApplicationCreate",
  { ...student, status: "Diterima" },
  false,
);

const multipart = {
  data: student,
  kk: "binary fixture",
  ktp: "binary fixture",
  akta: "binary fixture",
  skl: "binary fixture",
};
check("SKL sufficient", "ApplicationMultipart", multipart, true);
const ijazah = { ...multipart, ijazah: "binary fixture" };
delete ijazah.skl;
check("ijazah sufficient", "ApplicationMultipart", ijazah, true);
check(
  "both graduation documents",
  "ApplicationMultipart",
  { ...multipart, ijazah: "binary fixture" },
  true,
);
check(
  "KIP optional",
  "ApplicationMultipart",
  { ...multipart, kip: "binary fixture" },
  true,
);
for (const key of ["kk", "ktp", "akta", "skl"]) {
  const incomplete = { ...multipart };
  delete incomplete[key];
  check(
    "required kinds evaluated by server policy: " + key,
    "ApplicationMultipart",
    incomplete,
    true,
  );
}
check(
  "empty file placeholder",
  "ApplicationMultipart",
  { ...multipart, kk: "" },
  false,
);
check(
  "legacy photo not accepted in form",
  "ApplicationMultipart",
  { ...multipart, photo: "binary fixture" },
  false,
);
for (const kind of ["skl", "ijazah", "kk", "ktp", "kip", "akta"])
  check("upload " + kind, "UploadDocumentKind", kind, true);
check("photo upload rejected", "UploadDocumentKind", "photo", false);
check(
  "dynamic requirements may be empty",
  "DocumentRequirements",
  { requiredKinds: [], requireOneGraduationDocument: false },
  true,
);
check(
  "admin may require KK",
  "DocumentRequirements",
  { requiredKinds: ["kk"], requireOneGraduationDocument: false },
  true,
);
check(
  "KIP can never be required",
  "DocumentRequirements",
  { requiredKinds: ["kip"], requireOneGraduationDocument: false },
  false,
);
check(
  "legacy photo cannot be required",
  "DocumentRequirements",
  { requiredKinds: ["photo"], requireOneGraduationDocument: false },
  false,
);
check(
  "requirements are unique",
  "DocumentRequirements",
  { requiredKinds: ["kk", "kk"], requireOneGraduationDocument: false },
  false,
);
check("legacy photo metadata", "DocumentKind", "photo", true);

const file = {
  id: "doc-demo",
  kind: "kk",
  label: "Kartu Keluarga",
  status: "Menunggu pemeriksaan",
  hasFile: true,
  receivedPhysically: false,
  fileName: "dummy.pdf",
  mimeType: "application/pdf",
  size: 5242880,
  uploadedAt: "2026-10-15T01:00:00Z",
};
check("maximum file metadata", "StudentDocument", file, true);
check(
  "oversized file metadata",
  "StudentDocument",
  { ...file, size: 5242881 },
  false,
);
check("empty file metadata", "StudentDocument", { ...file, size: 0 }, false);
check(
  "wrong MIME",
  "StudentDocument",
  { ...file, mimeType: "text/html" },
  false,
);
const absent = {
  id: "doc-empty",
  kind: "kk",
  label: "KK",
  status: "Belum ada",
  hasFile: false,
  receivedPhysically: false,
};
check("empty slot", "StudentDocument", absent, true);
check(
  "fake verified without evidence",
  "StudentDocument",
  { ...absent, status: "Terverifikasi" },
  false,
);
check(
  "physical receipt without digital file",
  "StudentDocument",
  { ...absent, receivedPhysically: true, status: "Menunggu pemeriksaan" },
  true,
);
check(
  "hasFile requires metadata",
  "StudentDocument",
  { ...absent, hasFile: true, status: "Menunggu pemeriksaan" },
  false,
);
check(
  "no file must not expose filename",
  "StudentDocument",
  { ...absent, fileName: "fake.pdf" },
  false,
);
check(
  "correction requires note",
  "DocumentReviewInput",
  { status: "Perlu perbaikan", reviewNote: "" },
  false,
);
check(
  "blank note rejected",
  "DocumentReviewInput",
  { status: "Perlu perbaikan", reviewNote: "   " },
  false,
);
check(
  "correction with note",
  "DocumentReviewInput",
  { status: "Perlu perbaikan", reviewNote: "Gunakan berkas yang terbaca." },
  true,
);
check(
  "client cannot choose reviewer",
  "DocumentReviewInput",
  { status: "Terverifikasi", reviewNote: "", reviewedBy: "forged" },
  false,
);

check(
  "offline may be incomplete",
  "ApplicationOfflineCreate",
  { ...student, receivedDocumentKinds: ["kk"] },
  true,
);
check(
  "offline kinds unique",
  "ApplicationOfflineCreate",
  { ...student, receivedDocumentKinds: ["kk", "kk"] },
  false,
);
check(
  "response accepts server fields",
  "Application",
  {
    ...student,
    id: "NH-2026-DEMO",
    source: "Website",
    status: "Verifikasi",
    submittedAt: "2026-10-15T01:00:00Z",
    documents: [file],
    documentRequirements: {
      requiredKinds: [],
      requireOneGraduationDocument: false,
    },
  },
  true,
);
check("applicant metadata", "ApplicantDocument", absent, true);
check(
  "applicant cannot receive reviewer identity",
  "ApplicantDocument",
  { ...absent, reviewedBy: "admin-demo" },
  false,
);
check(
  "replacement accepts file",
  "ApplicantDocumentReplacement",
  { file: "binary-test" },
  true,
);
check(
  "replacement rejects empty file",
  "ApplicantDocumentReplacement",
  { file: "" },
  false,
);
check(
  "replacement cannot verify itself",
  "ApplicantDocumentReplacement",
  { file: "binary-test", status: "Terverifikasi" },
  false,
);
check(
  "replacement cannot target another applicant",
  "ApplicantDocumentReplacement",
  { file: "binary-test", applicationId: "NH-OTHER" },
  false,
);
check(
  "private record",
  "ApplicantRecord",
  {
    id: "NH-DEMO",
    status: "Verifikasi",
    documents: [absent],
    documentRequirements: {
      requiredKinds: [],
      requireOneGraduationDocument: false,
    },
  },
  true,
);

check(
  "message response accepts server fields",
  "ContactMessage",
  {
    id: "message-demo",
    name: "Penguji",
    email: "uji@example.test",
    topic: "Informasi",
    message: "Pesan fiktif untuk test.",
    status: "Baru",
    submittedAt: "2026-10-15T01:00:00Z",
  },
  true,
);
check(
  "empty organization allowed",
  "SchoolDirectory",
  { leaders: [], teachers: [] },
  true,
);
const leader = {
  id: "leader-demo",
  name: "Nama Contoh",
  role: "Kepala sekolah",
  initials: "NC",
  focus: "Pendidikan",
  tone: "green",
  level: "principal",
  portraitIndex: 0,
};
check(
  "one principal",
  "SchoolDirectory",
  { leaders: [leader], teachers: [] },
  true,
);
check(
  "two principals rejected",
  "SchoolDirectory",
  { leaders: [leader, { ...leader, id: "second" }], teachers: [] },
  false,
);
check(
  "other level without principal",
  "SchoolDirectory",
  { leaders: [{ ...leader, level: "support" }], teachers: [] },
  true,
);
check(
  "club inactive record",
  "Club",
  {
    id: "club-demo",
    name: "Pramuka",
    description: "Kegiatan contoh",
    active: false,
  },
  true,
);
check("empty club patch rejected", "ClubUpdate", {}, false);
check("deactivation patch", "ClubUpdate", { active: false }, true);
check(
  "achievement draft",
  "AchievementInput",
  {
    title: "Cerita uji",
    award: "Penghargaan contoh",
    level: "Kota",
    year: "2026",
    category: "Akademik",
    description: "Contoh bukan prestasi nyata",
    image: "/images/science.jpg",
    published: false,
  },
  true,
);
const agenda = {
  title: "Rapat contoh",
  date: "2026-10-15",
  time: "09:00",
  location: "Sekolah",
  type: "Rapat",
  completed: false,
  visibility: "Internal",
};
check("agenda explicit visibility", "AgendaInput", agenda, true);
check(
  "invalid agenda time",
  "AgendaInput",
  { ...agenda, time: "29:00" },
  false,
);
const missingVisibility = { ...agenda };
delete missingVisibility.visibility;
check("agenda visibility required", "AgendaInput", missingVisibility, false);
const settings = {
  schoolName: "SMP Nurul Huda",
  tagline: "Sekolah contoh",
  email: "info@example.test",
  ppdbEmail: "ppdb@example.test",
  phone: "0000000000",
  whatsapp: "0000000000",
  address: "Alamat fiktif pengujian",
  academicYear: "2026/2027",
  registrationOpen: false,
  registrationOpensAt: null,
  registrationClosesAt: null,
  documentRequirements: {
    requiredKinds: ["kk"],
    requireOneGraduationDocument: true,
  },
  dataRetention: "indefinite",
};
check("manual settings without dates", "SchoolSettings", settings, true);
check(
  "manual settings with dates",
  "SchoolSettings",
  {
    ...settings,
    registrationOpensAt: "2026-10-15T00:00:00Z",
    registrationClosesAt: "2026-11-15T00:00:00Z",
  },
  true,
);
check(
  "settings cannot require KIP",
  "SchoolSettings",
  {
    ...settings,
    documentRequirements: {
      ...settings.documentRequirements,
      requiredKinds: ["kip"],
    },
  },
  false,
);
check(
  "retention cannot silently become automatic deletion",
  "SchoolSettings",
  { ...settings, dataRetention: "30days" },
  false,
);
check(
  "settings rejects invalid dates",
  "SchoolSettings",
  { ...settings, registrationOpensAt: "invalid" },
  false,
);
console.log(
  `${count} schema cases passed; ${operationIds.size} operations and all local references checked.`,
);
console.log(
  "Schema tests only: no backend, database, file upload, or access-control execution.",
);
