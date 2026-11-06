import type { Post } from "../../data";

export type PostStatus = "Terbit" | "Draft";
export type ApplicationStatus =
  "Verifikasi" | "Terverifikasi" | "Wawancara" | "Diterima" | "Ditolak";
export type MessageStatus = "Baru" | "Dibaca" | "Selesai";
export type RegistrationSource = "Website" | "Offline";
export type StudentDocumentStatus =
  | "Terverifikasi"
  | "Diunggah"
  | "Menunggu pemeriksaan"
  | "Perlu perbaikan"
  | "Belum ada";

export type StudentDocument = {
  key: "kk" | "akta" | "ijazah" | "skl" | "ktp" | "kip" | "photo";
  label: string;
  status: StudentDocumentStatus;
  fileName?: string;
  number?: string;
  size?: number;
  mimeType?: string;
  reviewNote?: string;
};

export type CmsPost = Post & {
  id: string;
  status: PostStatus;
  author: string;
  updatedAt: string;
  publishedAt: string;
};

export type Application = {
  id: string;
  studentName: string;
  nisn?: string;
  originSchool: string;
  birthDate?: string;
  birthPlace?: string;
  gender?: "Laki-laki" | "Perempuan";
  address?: string;
  parentName?: string;
  parentOccupation?: string;
  phone?: string;
  email?: string;
  program: string;
  extracurricular?: string;
  status: ApplicationStatus;
  submittedAt: string;
  registrationSource?: RegistrationSource;
  documents?: StudentDocument[];
  notes?: string;
};

export type Agenda = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "Akademik" | "PPDB" | "Kegiatan" | "Rapat";
  completed: boolean;
  visibility: "Publik" | "Internal";
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: MessageStatus;
  submittedAt: string;
};

export type NewsletterSubscription = { email: string; subscribedAt: string };

export type SchoolSettings = {
  schoolName: string;
  tagline: string;
  email: string;
  ppdbEmail: string;
  phone: string;
  whatsapp: string;
  address: string;
  academicYear: string;
  registrationOpen: boolean;
};
