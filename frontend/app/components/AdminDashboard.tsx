"use client";

import Link from "next/link";
import {
  Bell,
  Trophy,
  Sparkles,
  CalendarDays,
  Check,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu as MenuIcon,
  Network,
  Newspaper,
  RotateCcw,
  Settings2,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  getApplications,
  getMessages,
  getNewsletterSubscriptions,
  getSchoolSettings,
  listenCmsUpdates,
  resetLocalDemoData,
  seedApplications,
  type Application,
  type CmsPost,
  type ContactMessage,
  type SchoolSettings,
} from "../lib/local-cms";
import { hasBackendApi, requestApi } from "../lib/api-client";
import { useAgenda } from "../lib/use-agenda";
import { listAdminPosts } from "../lib/cms/posts";
import { BrandMark } from "./BrandMark";
import { SchoolDirectoryModule } from "./SchoolDirectoryModule";
import { StudentRecordsModule } from "./StudentRecordsModule";
import { AdminLogin } from "./admin/AdminLogin";
import { AgendaModule } from "./admin/AgendaModule";
import { ApplicationsModule } from "./admin/ApplicationsModule";
import { DashboardModule } from "./admin/DashboardModule";
import { MessagesModule } from "./admin/MessagesModule";
import { PostsModule } from "./admin/PostsModule";
import { SettingsModule } from "./admin/SettingsModule";
import type { AdminToast as Toast, AdminView as View } from "./admin/types";

import { AchievementsModule } from "./admin/AchievementsModule";
import { ClubsModule } from "./admin/ClubsModule";

const menu: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "applications", label: "Pendaftar", icon: UsersRound },
  { id: "students", label: "Data siswa", icon: GraduationCap },
  { id: "directory", label: "Struktur & guru", icon: Network },
  { id: "achievements", label: "Prestasi sekolah", icon: Trophy },
  { id: "clubs", label: "Ekstrakurikuler", icon: Sparkles },
  { id: "posts", label: "Artikel & berita", icon: Newspaper },
  { id: "agenda", label: "Agenda sekolah", icon: CalendarDays },
  { id: "messages", label: "Pesan masuk", icon: Mail },
  { id: "settings", label: "Pengaturan", icon: Settings2 },
];

const mobilePrimaryViews: View[] = [
  "dashboard",
  "applications",
  "students",
  "messages",
];
const DEMO_SESSION_KEY = "nurul_huda_admin_demo";

export function AdminDashboard() {
  const [view, setView] = useState<View>("dashboard");
  const [applications, setApplications] =
    useState<Application[]>(seedApplications);
  const [posts, setPosts] = useState<CmsPost[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<SchoolSettings>(() =>
    getSchoolSettings(),
  );
  const [newsletterCount, setNewsletterCount] = useState(0);
  const [toast, setToast] = useState<Toast>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const { agenda, error: agendaError } = useAgenda(true, authenticated);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [postPreset, setPostPreset] = useState<string | null>(null);

  function reload() {
    setApplications(getApplications());
    if (!hasBackendApi()) void listAdminPosts().then(setPosts);
    setMessages(getMessages());
    setSettings(getSchoolSettings());
    setNewsletterCount(getNewsletterSubscriptions().length);
  }

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      reload();
      if (hasBackendApi()) {
        requestApi("/auth/session")
          .then(() => {
            setAuthenticated(true);
            void listAdminPosts().then(setPosts).catch(() => setPosts([]));
          })
          .catch(() => setAuthenticated(false));
      } else {
        setAuthenticated(
          window.sessionStorage.getItem(DEMO_SESSION_KEY) === "true",
        );
      }
    }, 0);
    const stopListening = listenCmsUpdates(reload);
    return () => {
      window.clearTimeout(initialize);
      stopListening();
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function notify(message: string, tone: "success" | "warning" = "success") {
    setToast({ message, tone });
  }
  function navigate(next: View) {
    setView(next);
    setMobileMoreOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function startPost(category = "Pengumuman") {
    setPostPreset(category);
    navigate("posts");
  }
  async function logout() {
    if (hasBackendApi())
      await requestApi("/auth/logout", { method: "POST" }).catch(
        () => undefined,
      );
    window.sessionStorage.removeItem(DEMO_SESSION_KEY);
    setAuthenticated(false);
    setView("dashboard");
  }
  function login(mode: "demo" | "backend") {
    if (mode === "demo") {
      window.sessionStorage.setItem(DEMO_SESSION_KEY, "true");
    } else {
      void listAdminPosts().then(setPosts).catch(() => setPosts([]));
    }
    setAuthenticated(true);
  }

  if (!authenticated) return <AdminLogin onLogin={login} />;

  const unread = messages.filter((message) => message.status === "Baru").length;
  const countFor = (id: View) =>
    id === "applications" || id === "students"
      ? applications.length
      : id === "posts"
        ? posts.length
        : id === "messages"
          ? unread
          : 0;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <button className="admin-logo" onClick={() => navigate("dashboard")}>
          <BrandMark />
          <div>
            <b>Nurul Huda</b>
            <small>Admin Sekolah</small>
          </div>
        </button>
        <nav>
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={view === item.id ? "active" : ""}
                onClick={() => navigate(item.id)}
                key={item.id}
              >
                <Icon size={17} />
                {item.label}
                {countFor(item.id) > 0 && <b>{countFor(item.id)}</b>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <span className="admin-avatar">RA</span>
          <div>
            <b>Rania A.</b>
            <small>Super Admin</small>
          </div>
          <button
            onClick={logout}
            title="Keluar dari panel"
            aria-label="Keluar dari panel"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="domain-dot" /> admin.nurulhuda.sch.id{" "}
            <em>CMS Lokal</em>
          </div>
          <div className="admin-top-actions">
            {unread > 0 && (
              <button
                onClick={() => navigate("messages")}
                aria-label={`${unread} pesan baru`}
              >
                <Bell size={17} />
                <b>{unread}</b>
              </button>
            )}
            <Link href="/">
              Lihat website publik <ExternalLink size={14} />
            </Link>
          </div>
        </header>
        <nav className="admin-mobile-nav" aria-label="Navigasi admin mobile">
          {menu
            .filter((item) => mobilePrimaryViews.includes(item.id))
            .map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={view === item.id ? "active" : ""}
                  onClick={() => navigate(item.id)}
                  key={item.id}
                >
                  <Icon size={18} />
                  <small>
                    {item.label === "Data siswa"
                      ? "Siswa"
                      : item.label === "Pesan masuk"
                        ? "Pesan"
                        : item.label}
                  </small>
                  {countFor(item.id) > 0 && <b>{countFor(item.id)}</b>}
                </button>
              );
            })}
          <button
            className={
              mobileMoreOpen || !mobilePrimaryViews.includes(view)
                ? "active"
                : ""
            }
            onClick={() => setMobileMoreOpen((current) => !current)}
          >
            <MenuIcon size={18} />
            <small>Lainnya</small>
          </button>
        </nav>
        {mobileMoreOpen && (
          <div className="admin-mobile-more-backdrop">
            <button
              className="admin-mobile-more-scrim"
              onClick={() => setMobileMoreOpen(false)}
              aria-label="Tutup menu lainnya"
            />
            <section className="admin-mobile-more">
              <header>
                <div>
                  <p className="admin-eyebrow">Navigasi lainnya</p>
                  <h2>Menu admin</h2>
                </div>
                <button
                  onClick={() => setMobileMoreOpen(false)}
                  aria-label="Tutup menu"
                >
                  <X size={20} />
                </button>
              </header>
              {menu
                .filter((item) => !mobilePrimaryViews.includes(item.id))
                .map((item) => {
                  const Icon = item.icon;
                  const descriptions: Partial<Record<View, string>> = {
                    achievements: "Cerita dan pencapaian sekolah",
                    clubs: "Pilihan kegiatan calon siswa",
                    directory: "Atur hierarki dan profil pendidik",
                    posts: "Tulis dan kelola berita sekolah",
                    agenda: "Kalender dan kegiatan sekolah",
                    settings: "Identitas dan konfigurasi website",
                  };
                  return (
                    <button onClick={() => navigate(item.id)} key={item.id}>
                      <Icon size={20} />
                      <span>
                        <b>{item.label}</b>
                        <small>{descriptions[item.id]}</small>
                      </span>
                    </button>
                  );
                })}
              <Link href="/">
                <ExternalLink size={20} />
                <span>
                  <b>Website publik</b>
                  <small>Lihat tampilan untuk pengunjung</small>
                </span>
              </Link>
              <button className="mobile-logout" onClick={logout}>
                <LogOut size={20} />
                <span>
                  <b>Keluar dari admin</b>
                  <small>Kembali ke halaman login</small>
                </span>
              </button>
            </section>
          </div>
        )}
        {view === "dashboard" && agendaError && <p role="alert" className="admin-form-error">{agendaError}</p>}
        {view === "dashboard" && (
          <DashboardModule
            applications={applications}
            posts={posts}
            agenda={agenda}
            messages={messages}
            onNavigate={navigate}
            onCreatePost={() => startPost("Pengumuman")}
          />
        )}
        {view === "applications" && (
          <ApplicationsModule
            applications={applications}
            setApplications={setApplications}
            notify={notify}
          />
        )}
        {view === "students" && (
          <StudentRecordsModule
            applications={applications}
            setApplications={setApplications}
            notify={notify}
          />
        )}
        {view === "directory" && <SchoolDirectoryModule notify={notify} />}
        {view === "achievements" && <AchievementsModule notify={notify} />}
        {view === "clubs" && <ClubsModule notify={notify} />}
        {view === "posts" && (
          <PostsModule
            posts={posts}
            setPosts={setPosts}
            preset={postPreset}
            clearPreset={() => setPostPreset(null)}
            notify={notify}
          />
        )}
        {view === "agenda" && (
          <AgendaModule notify={notify} />
        )}
        {view === "messages" && (
          <MessagesModule
            messages={messages}
            setMessages={setMessages}
            notify={notify}
          />
        )}
        {view === "settings" && (
          <SettingsModule
            settings={settings}
            setSettings={setSettings}
            newsletterCount={newsletterCount}
            notify={notify}
            onReset={() => {
              resetLocalDemoData();
              reload();
              notify("Data demo dikembalikan ke kondisi awal.", "warning");
            }}
          />
        )}
      </main>
      {toast && (
        <div className={`admin-toast ${toast.tone ?? "success"}`} role="status">
          <span>
            {toast.tone === "warning" ? (
              <RotateCcw size={14} />
            ) : (
              <Check size={14} />
            )}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
}
