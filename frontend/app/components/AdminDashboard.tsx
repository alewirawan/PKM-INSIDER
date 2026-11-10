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
import { StudentWorkspace } from "./student-records/StudentWorkspace";
import { LiveDashboard } from "./admin/LiveDashboard";
import { LiveMessagesModule } from "./admin/LiveMessagesModule";

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

type AdminUser = {
  name: string;
  role: "super_admin" | "editor" | "admin_ppdb";
};
export function AdminDashboard() {
  const [user, setUser] = useState<AdminUser>({
    name: "Admin",
    role: "super_admin",
  });
  const [checking, setChecking] = useState(hasBackendApi());
  const visibleMenu = menu.filter(
    (item) =>
      !hasBackendApi() ||
      user.role === "super_admin" ||
      (user.role === "admin_ppdb"
        ? ["applications", "students"].includes(item.id)
        : [
            "directory",
            "achievements",
            "clubs",
            "posts",
            "agenda",
            "messages",
          ].includes(item.id)),
  );
  const [view, setView] = useState<View>("dashboard");
  const [applications, setApplications] = useState<Application[]>(
    hasBackendApi() ? [] : seedApplications,
  );
  const [posts, setPosts] = useState<CmsPost[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<SchoolSettings>(() =>
    getSchoolSettings(),
  );
  const [newsletterCount, setNewsletterCount] = useState(0);
  const [toast, setToast] = useState<Toast>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const { agenda, error: agendaError } = useAgenda(
    true,
    authenticated && user.role !== "admin_ppdb",
  );
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [postPreset, setPostPreset] = useState<string | null>(null);

  function reload() {
    if (hasBackendApi()) return;
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
        requestApi<{ user: AdminUser }>("/auth/session")
          .then(({ user }) => {
            setUser(user);
            setAuthenticated(true);
            setView(
              user.role === "admin_ppdb"
                ? "students"
                : user.role === "editor"
                  ? "posts"
                  : "dashboard",
            );
            if (user.role !== "admin_ppdb")
              void listAdminPosts()
                .then(setPosts)
                .catch(() => setPosts([]));
          })
          .catch(() => setAuthenticated(false))
          .finally(() => setChecking(false));
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
    if (
      !hasBackendApi() ||
      !authenticated ||
      user.role !== "super_admin" ||
      view !== "settings"
    )
      return;
    let active = true;
    requestApi<{ newsletterCount: number }>("/dashboard/summary")
      .then((v) => {
        if (active) setNewsletterCount(v.newsletterCount);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [authenticated, user.role, view]);

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
      try {
        await requestApi("/auth/logout", { method: "POST" });
      } catch {
        notify("Keluar gagal. Coba lagi.", "warning");
        return;
      }
    window.sessionStorage.removeItem(DEMO_SESSION_KEY);
    setAuthenticated(false);
    setView("dashboard");
  }
  async function login(mode: "demo" | "backend") {
    if (mode === "demo") {
      window.sessionStorage.setItem(DEMO_SESSION_KEY, "true");
    } else {
      const { user } = await requestApi<{ user: AdminUser }>("/auth/session");
      setUser(user);
      setView(
        user.role === "admin_ppdb"
          ? "students"
          : user.role === "editor"
            ? "posts"
            : "dashboard",
      );
      if (user.role !== "admin_ppdb")
        void listAdminPosts()
          .then(setPosts)
          .catch(() => setPosts([]));
    }
    setAuthenticated(true);
  }

  if (checking)
    return (
      <main className="portal-section" role="status">
        Memeriksa sesi admin…
      </main>
    );
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
          {visibleMenu.map((item) => {
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
          <span className="admin-avatar">
            {user.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <b>{user.name}</b>
            <small>
              {user.role === "admin_ppdb"
                ? "Panitia PPDB"
                : user.role === "editor"
                  ? "Editor"
                  : "Super Admin"}
            </small>
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
            <span className="domain-dot" /> Panel sekolah{" "}
            <em>{hasBackendApi() ? "Terhubung ke server" : "Mode demo"}</em>
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
          {visibleMenu
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
              {visibleMenu
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
        {view === "dashboard" && agendaError && (
          <p role="alert" className="admin-form-error">
            {agendaError}
          </p>
        )}
        {view === "dashboard" &&
          (hasBackendApi() ? (
            <LiveDashboard name={user.name} navigate={navigate} />
          ) : (
            <DashboardModule
              applications={applications}
              posts={posts}
              agenda={agenda}
              messages={messages}
              onNavigate={navigate}
              onCreatePost={() => startPost("Pengumuman")}
            />
          ))}
        {view === "applications" &&
          (hasBackendApi() ? (
            <StudentWorkspace title="Pendaftar" />
          ) : (
            <ApplicationsModule
              applications={applications}
              setApplications={setApplications}
              notify={notify}
            />
          ))}
        {view === "students" &&
          (hasBackendApi() ? (
            <StudentWorkspace />
          ) : (
            <StudentRecordsModule
              applications={applications}
              setApplications={setApplications}
              notify={notify}
            />
          ))}
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
        {view === "agenda" && <AgendaModule notify={notify} />}
        {view === "messages" &&
          (hasBackendApi() ? (
            <LiveMessagesModule notify={notify} />
          ) : (
            <MessagesModule
              messages={messages}
              setMessages={setMessages}
              notify={notify}
            />
          ))}
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
