import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PageHero } from "../components/PageHero";
import { ApplicantPortal } from "../components/registration/ApplicantPortal";
export const metadata: Metadata = {
  title: "Portal Pendaftar",
  robots: { index: false, follow: false },
};
export default function ApplicantPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Ruang pendaftar"
          title="Setiap langkah, lebih jelas."
          description="Pantau pendaftaran dan lengkapi berkas melalui akun pribadimu."
        />
        <section className="portal-section">
          <ApplicantPortal />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
