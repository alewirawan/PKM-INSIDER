"use client";
import { useSchoolSettings } from "../SchoolSettingsProvider";
import { useContentList } from "../../lib/use-content-list";
import { requestApi } from "../../lib/api-client";
import { AdminPageHeader } from "./AdminUi";
import type { AdminView } from "./types";
type Summary = {
  totalApplications: number;
  websiteApplications: number;
  offlineApplications: number;
  completeApplications: number;
  byStatus: Record<string, number>;
  publishedPosts: number;
  unreadMessages: number;
  weekly: { week: string; count: number }[];
  generatedAt: string;
};
const load = async () => [await requestApi<Summary>("/dashboard/summary")];
export function LiveDashboard({
  name,
  navigate,
}: {
  name: string;
  navigate: (v: AdminView) => void;
}) {
  const { items, loading, error, refresh } = useContentList(load),
    settings = useSchoolSettings(),
    summary = items[0];
  return (
    <div className="admin-view">
      <AdminPageHeader
        eyebrow={new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        title={`Selamat datang, ${name}.`}
        description={`Ringkasan penerimaan dan informasi ${settings.schoolName}.`}
        action={
          <button className="button button-dark" onClick={() => void refresh()}>
            Perbarui ringkasan
          </button>
        }
      />
      {loading && <p role="status">Memuat ringkasan…</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {summary && (
        <>
          <section className="live-metrics">
            {[
              [
                "Total pendaftar",
                summary.totalApplications,
                "Online dan offline",
              ],
              [
                "Berkas lengkap",
                summary.completeApplications,
                "Mengikuti persyaratan saat mendaftar",
              ],
              [
                "Artikel terbit",
                summary.publishedPosts,
                "Tampil di website publik",
              ],
              ["Pesan baru", summary.unreadMessages, "Menunggu dibaca"],
            ].map(([title, value, hint]) => (
              <article key={title}>
                <small>{title}</small>
                <strong>{value}</strong>
                <small>{hint}</small>
              </article>
            ))}
          </section>
          <section className="live-summary-panels">
            <article>
              <p className="admin-eyebrow">Perjalanan pendaftar</p>
              <h2>Status penerimaan</h2>
              <ul>
                {Object.entries(summary.byStatus).map(([status, count]) => (
                  <li key={status}>
                    <span>{status}</span>
                    <b>{count}</b>
                  </li>
                ))}
              </ul>
              <button
                className="panel-link"
                onClick={() => navigate("students")}
              >
                Periksa data siswa →
              </button>
            </article>
            <article>
              <p className="admin-eyebrow">28 hari terakhir</p>
              <h2>Pendaftaran per pekan</h2>
              {summary.weekly.length ? (
                <ul>
                  {summary.weekly.map((w) => (
                    <li key={w.week}>
                      <span>
                        Pekan{" "}
                        {new Date(w.week + "T00:00:00").toLocaleDateString(
                          "id-ID",
                        )}
                      </span>
                      <b>{w.count}</b>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Belum ada pendaftaran pada periode ini.</p>
              )}
              <p>
                {summary.websiteApplications} dari website ·{" "}
                {summary.offlineApplications} melalui sekolah
              </p>
              <small>
                Diperbarui{" "}
                {new Date(summary.generatedAt).toLocaleString("id-ID")}
              </small>
            </article>
          </section>
          <section className="admin-quick-actions">
            <button onClick={() => navigate("applications")}>
              <b>Periksa pendaftaran</b>
              <small>Biodata, berkas, dan status</small>
            </button>
            <button onClick={() => navigate("posts")}>
              <b>Kelola artikel</b>
              <small>Berita terbaru sekolah</small>
            </button>
            <button onClick={() => navigate("settings")}>
              <b>Atur PPDB</b>
              <small>Jadwal dan berkas wajib</small>
            </button>
          </section>
        </>
      )}
    </div>
  );
}
