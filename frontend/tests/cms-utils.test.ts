import assert from "node:assert/strict";
import {
  createStudentDocuments,
  documentLabels,
  normalizeDocuments,
  requiredDocumentsComplete,
} from "../app/lib/cms/student-documents";
import {
  getAchievements,
  saveAchievements,
  getClubs,
  saveClubs,
} from "../app/lib/cms/catalog";
import {
  validateDemoFile,
  MAX_DOCUMENT_BYTES,
  retainDemoFiles,
  getDemoFile,
  clearDemoFiles,
} from "../app/lib/registration-files";
import { beforeEach, test } from "node:test";
import {
  addApplication,
  articleContentToText,
  estimateReadTime,
  formatIndonesianDate,
  getApplications,
  getSchoolDirectory,
  parseArticleContent,
  saveApplications,
  saveSchoolDirectory,
  slugify,
  type Application,
} from "../app/lib/local-cms";
import {
  chunkDirectoryRows,
  groupSchoolLeaders,
  hasOtherPrincipal,
  seedSchoolDirectory,
} from "../app/school-directory-data";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  clear() {
    this.values.clear();
  }
  has(key: string) {
    return this.values.has(key);
  }
}

const localStorage = new MemoryStorage();
const sessionStorage = new MemoryStorage();
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    localStorage,
    sessionStorage,
    dispatchEvent() {
      return true;
    },
    addEventListener() {},
    removeEventListener() {},
  },
});
if (!("CustomEvent" in globalThis))
  Object.defineProperty(globalThis, "CustomEvent", {
    value: class CustomEvent {
      constructor(
        public type: string,
        public init?: unknown,
      ) {}
    },
  });

beforeEach(() => {
  clearDemoFiles();
  localStorage.clear();
  sessionStorage.clear();
});

test("PPDB exposes six document types and preserves legacy photo metadata", () => {
  assert.deepEqual(
    documentLabels.map((d) => d.key),
    ["skl", "ijazah", "kk", "ktp", "kip", "akta"],
  );
  const normalized = normalizeDocuments([
    {
      key: "photo",
      label: "Pas foto",
      status: "Diunggah",
      fileName: "old.jpg",
    },
    { key: "kk", label: "KK", status: "Diunggah", fileName: "kk.pdf" },
  ]);
  assert.equal(normalized.length, 7);
  assert.equal(
    normalized.find((d) => d.key === "kk")?.status,
    "Menunggu pemeriksaan",
  );
  assert.equal(normalized.find((d) => d.key === "photo")?.fileName, "old.jpg");
});

test("document completeness requires core documents and either graduation document", () => {
  const docs = createStudentDocuments(
    "Website",
    [],
    ["kk", "ktp", "akta", "skl"],
  );
  assert.equal(requiredDocumentsComplete(docs), true);
  assert.equal(
    requiredDocumentsComplete(
      createStudentDocuments("Website", [], ["kk", "ktp", "akta", "ijazah"]),
    ),
    true,
  );
  assert.equal(
    requiredDocumentsComplete(
      createStudentDocuments("Website", [], ["kk", "akta", "skl", "kip"]),
    ),
    false,
  );
  assert.equal(
    requiredDocumentsComplete(
      docs.map((d) =>
        d.key === "kk" ? { ...d, status: "Perlu perbaikan" } : d,
      ),
    ),
    false,
  );
  assert.equal(
    requiredDocumentsComplete(docs.map((d) => ({ ...d, fileName: undefined }))),
    false,
  );
});

test("file validation rejects empty, oversized and mismatched files", () => {
  assert.equal(
    validateDemoFile({ name: "demo.PDF", size: 40, type: "application/pdf" }),
    "",
  );
  assert.equal(validateDemoFile({ name: "demo.jpg", size: 40, type: "" }), "");
  assert.ok(
    validateDemoFile({ name: "demo.pdf", size: 0, type: "application/pdf" }),
  );
  assert.ok(
    validateDemoFile({
      name: "demo.pdf",
      size: MAX_DOCUMENT_BYTES + 1,
      type: "application/pdf",
    }),
  );
  assert.ok(
    validateDemoFile({ name: "demo.jpg", size: 40, type: "text/html" }),
  );
  assert.ok(validateDemoFile({ name: "demo.exe", size: 40, type: "" }));
});

test("selected files stay in memory and clear without persistent file storage", () => {
  const file = new File(["demo"], "dummy.pdf", { type: "application/pdf" });
  retainDemoFiles("QA-1", { kk: file });
  assert.equal(getDemoFile("QA-1", "kk"), file);
  assert.equal(localStorage.getItem("QA-1"), null);
  assert.equal(sessionStorage.getItem("QA-1"), null);
  clearDemoFiles();
  assert.equal(getDemoFile("QA-1", "kk"), undefined);
});

test("catalog respects empty collections, drafts and inactive clubs", () => {
  const achievement = { ...getAchievements()[0], published: false };
  saveAchievements([achievement]);
  assert.equal(getAchievements()[0].published, false);
  const club = { ...getClubs()[0], active: false };
  saveClubs([club]);
  assert.equal(getClubs()[0].active, false);
  saveAchievements([]);
  saveClubs([]);
  assert.deepEqual(getAchievements(), []);
  assert.deepEqual(getClubs(), []);
});

test("creates stable blog slugs and formatted paragraphs", () => {
  assert.equal(
    slugify("Festival Sains & Inovasi 2027!"),
    "festival-sains-inovasi-2027",
  );
  const paragraphs = parseArticleContent(
    "Paragraf pertama.\n\nParagraf kedua\nmasih berlanjut.\n\n  Paragraf ketiga.  ",
  );
  assert.deepEqual(paragraphs, [
    "Paragraf pertama.",
    "Paragraf kedua masih berlanjut.",
    "Paragraf ketiga.",
  ]);
  assert.equal(articleContentToText(paragraphs), paragraphs.join("\n\n"));
  assert.equal(estimateReadTime(paragraphs), "1 menit");
});

test("formats article publication dates from the backend timestamp", () => {
  assert.equal(
    formatIndonesianDate("2026-09-12T01:00:00.000Z"),
    "12 September 2026",
  );
});

test("new PPDB records become available to the admin data source", () => {
  const application: Application = {
    id: "NH-TEST-1",
    studentName: "Siswa Demo",
    originSchool: "SD Demo",
    program: "",
    extracurricular: "Pramuka",
    status: "Verifikasi",
    submittedAt: "2026-09-18T12:00:00.000Z",
  };
  addApplication(application);
  assert.ok(getApplications().some((item) => item.id === application.id));
  assert.equal(
    getApplications().find((item) => item.id === application.id)
      ?.extracurricular,
    "Pramuka",
  );
  assert.equal(localStorage.has("arunika_applications"), false);
  assert.equal(sessionStorage.has("arunika_applications"), true);
});

test("empty collections stay empty instead of restoring demo records", () => {
  saveApplications([]);
  assert.deepEqual(getApplications(), []);

  saveSchoolDirectory({ leaders: [], teachers: [] });
  assert.deepEqual(getSchoolDirectory(), { leaders: [], teachers: [] });
});

test("school hierarchy and teacher order can be persisted for the public directory", () => {
  const directory = getSchoolDirectory();
  const moved = { ...directory.leaders[1], level: "support" as const };
  saveSchoolDirectory({
    ...directory,
    leaders: [directory.leaders[0], ...directory.leaders.slice(2), moved],
  });
  const stored = getSchoolDirectory();
  assert.equal(stored.leaders.at(-1)?.id, moved.id);
  assert.equal(stored.leaders.at(-1)?.level, "support");
  assert.equal(stored.teachers.length, directory.teachers.length);
});

test("organization rows stay balanced and skip hierarchy levels without members", () => {
  assert.deepEqual(
    chunkDirectoryRows([1, 2, 3, 4, 5]).map((row) => row.length),
    [4, 1],
  );
  assert.deepEqual(chunkDirectoryRows<number>([]), []);

  const withoutLeadership = seedSchoolDirectory.leaders.filter(
    (person) => person.level !== "leadership",
  );
  assert.deepEqual(
    groupSchoolLeaders(withoutLeadership).map((group) => group.level),
    ["principal", "support"],
  );
});

test("only one principal can be assigned while the current principal remains editable", () => {
  assert.equal(
    hasOtherPrincipal(seedSchoolDirectory.leaders, "leader-principal"),
    false,
  );
  assert.equal(
    hasOtherPrincipal(seedSchoolDirectory.leaders, "leader-academic"),
    true,
  );
  assert.equal(
    hasOtherPrincipal(seedSchoolDirectory.leaders, "leader-new"),
    true,
  );
});
