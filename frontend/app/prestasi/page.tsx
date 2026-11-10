import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PageHero } from "../components/PageHero";
import { Achievements } from "../components/Achievements";
export const metadata: Metadata = {
  title: "Prestasi Sekolah",
  description: "Galeri simulasi prestasi dan pencapaian SMP Nurul Huda.",
};
export default function AchievementPage() {
  return (
    <>
      <SiteHeader active="/prestasi" />
      <main>
        <PageHero
          eyebrow="Prestasi sekolah"
          title="Bukan sekadar piala. Ini cerita tentang usaha."
          description="Kenali perjalanan belajar, keberanian mencoba, dan kerja sama di balik pencapaian siswa."
        />
        <Achievements />
      </main>
      <SiteFooter />
    </>
  );
}
