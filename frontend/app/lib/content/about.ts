import school from "../../../../contracts/school-profile.json";
export const aboutContent = {
  hero: {
    eyebrow: "Profil & sejarah",
    title: "Dari kepedulian, lahir kesempatan.",
    description:
      "Mengenal perjalanan SMP Nurul Huda Cisoka: sekolah yang tumbuh dari wakaf, kepedulian sosial, dan tekad membuka akses pendidikan sejak 2008.",
  },
  story: {
    badge: "Melayani sejak 2008",
    kicker: "Berawal dari sebuah niat",
    heading: "Sebidang kebun. Sebuah harapan yang panjang.",
    paragraphs: [
      "Gagasan mendirikan SMP Nurul Huda muncul pada 2006. Almarhum ketua yayasan pertama, yang berprofesi sebagai pedagang, melihat banyak anak di lingkungan sekitar tidak melanjutkan pendidikan setelah lulus SD karena biaya sekolah yang masih mahal.",
      "Tanpa latar belakang di dunia pendidikan, beliau mewakafkan kebun pribadi seluas 4.000 m². Pembangunan pada 2006–2007 dibiayai dari dana pribadi, dengan bantuan pemerintah berupa tiga ruang kelas tambahan. Sekolah resmi menerima siswa pada 2008.",
      "Tujuannya adalah beramal dan membantu sesama. Sejak awal berdiri, sekolah tidak memungut SPP bulanan. Alumni yang masih menghadapi kendala administrasi pun tetap dilayani dan memperoleh hak-haknya dengan baik.",
      "Dalam perjalanan 18 tahun, dari 2008 hingga 2026, SMP Nurul Huda memperoleh Akreditasi B dan menjadi sekolah swasta terbesar ketiga di Gugus 5 wilayah Cisoka, Jayanti, dan Solear, setelah SMP Al-Badar dan SMP Darul El-Qolam.",
    ],
  },
  timeline: [
    {
      year: "2006",
      title: "Gagasan untuk lingkungan",
      text: "Kepedulian terhadap anak yang putus sekolah menjadi awal pendirian Nurul Huda.",
    },
    {
      year: "2006–2007",
      title: "Wakaf menjadi ruang belajar",
      text: "Pembangunan gedung di lahan kebun pribadi seluas 4.000 m² yang diwakafkan untuk sekolah.",
    },
    {
      year: "2008",
      title: "Pintu sekolah dibuka",
      text: "Mulai menerima peserta didik dengan komitmen tanpa SPP bulanan.",
    },
    {
      year: "Hari ini",
      title: "Melanjutkan amanah pendidikan",
      text: "Sekolah terakreditasi B yang mengutamakan kedisiplinan, ilmu pengetahuan, dan akhlak.",
    },
  ],
  vision: school.vision,
  missions: school.missions,
  values: [
    {
      number: "01",
      title: "Berprestasi",
      text: "Mengembangkan prestasi akademik maupun nonakademik sesuai potensi siswa.",
    },
    {
      number: "02",
      title: "Berdaya saing",
      text: "Mempersiapkan lulusan untuk melanjutkan pendidikan ke jenjang berikutnya.",
    },
    {
      number: "03",
      title: "IPTEK & IMTAK",
      text: "Menguasai ilmu pengetahuan dan teknologi dengan landasan iman serta takwa.",
    },
    {
      number: "04",
      title: "Berakhlak mulia",
      text: "Membentuk pribadi yang berbudi pekerti luhur dan berperilaku baik.",
    },
  ],
} as const;
