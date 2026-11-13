import school from "../../contracts/school-profile.json";
export type Post = {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  excerpt: string;
  content: string[];
};
export const posts: Post[] = [
  { ...school.event, date: "13 November 2026", readTime: "2 menit" },
];
export const programs = [
  {
    number: "01",
    title: "Musik & Ekspresi",
    description:
      "Minat bermusik mendapat ruang melalui kegiatan akustik dan paduan suara.",
    subjects: ["Nurul Huda Akustik", "Paduan Suara"],
    label: "SENI",
  },
  {
    number: "02",
    title: "Keterampilan & Kreativitas",
    description:
      "Kesempatan mengenal keterampilan praktis dan mengembangkan kreativitas melalui kegiatan bersama.",
    subjects: ["Cooking Class", "Makeup Class"],
    label: "KARYA",
  },
  {
    number: "03",
    title: "Olahraga & Kepedulian",
    description:
      "Mengembangkan kebugaran, sikap sportif, kedisiplinan, dan kepedulian kepada sesama.",
    subjects: ["Taekwondo", "Badminton", "PMR"],
    label: "AKTIF",
  },
];

export const schoolImageOptions = [
  { value: "/images/sekolah/gedung-sekolah.jpeg", label: "Gedung sekolah" },
  { value: "/images/sekolah/halaman-sekolah.jpeg", label: "Halaman sekolah" },
  { value: "/images/sekolah/warga-sekolah.jpeg", label: "Warga sekolah" },
  {
    value: "/images/sekolah/17-agustus-bersama.jpeg",
    label: "Kebersamaan 17 Agustus",
  },
  {
    value: "/images/sekolah/kegiatan-halaman.jpeg",
    label: "Kegiatan di halaman",
  },
];
