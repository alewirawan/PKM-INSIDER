"use client";

import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { hasBackendApi, requestApi } from "../../lib/api-client";
import { BrandMark } from "../BrandMark";

export function AdminLogin({
  onLogin,
}: {
  onLogin: (mode: "demo" | "backend") => void | Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const backendAvailable = hasBackendApi();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!backendAvailable) return;
    setSubmitting(true);
    setError("");
    try {
      await requestApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await onLogin("backend");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login gagal. Silakan coba kembali.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-top">
          <div className="admin-logo large">
            <BrandMark />
            <div>
              <b>Nurul Huda</b>
              <small>Admin Sekolah</small>
            </div>
          </div>
          <span className="mockup-badge">
            {backendAvailable ? "Administrasi" : "Prototype"}
          </span>
        </div>
        <p className="section-kicker">Portal administrasi sekolah</p>
        <h1>Selamat datang kembali.</h1>
        <p>
          Masuk untuk mengelola konten, PPDB, data siswa, agenda, dan pesan
          sekolah dalam satu ruang kerja.
        </p>
        {backendAvailable ? (
          <form onSubmit={submit}>
            <label>
              Email admin
              <input
                required
                autoComplete="username"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="nama@sekolah.sch.id"
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  required
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  <span>{showPassword ? "Sembunyikan" : "Lihat"}</span>
                </button>
              </div>
            </label>
            <div className="login-options">
              <span>Gunakan akun yang diberikan pengelola sekolah.</span>
              <button
                type="button"
                onClick={() =>
                  setError(
                    "Hubungi pengelola sistem sekolah untuk memulihkan password.",
                  )
                }
              >
                Lupa password?
              </button>
            </div>
            {error && (
              <span className="admin-form-error" role="alert">
                {error}
              </span>
            )}
            <button
              className="button button-accent"
              type="submit"
              disabled={submitting}
            >
              <LogIn size={16} />{" "}
              {submitting ? "Memeriksa akun…" : "Masuk ke dashboard"}
            </button>
          </form>
        ) : (
          <div className="demo-credentials demo-mode">
            <div>
              <b>Mode simulasi lokal</b>
              <span>
                Backend belum dikonfigurasi. Data pribadi hanya disimpan selama
                tab ini terbuka dan akses ini bukan autentikasi produksi.
              </span>
            </div>
            <button type="button" onClick={() => onLogin("demo")}>
              <ShieldCheck size={14} /> Masuk ke mode demo
            </button>
          </div>
        )}
        <Link href="/">
          <ArrowLeft size={14} /> Kembali ke website publik
        </Link>
      </section>
      <aside>
        <div className="login-aside-top">
          <span>Administrasi SMP Nurul Huda</span>
          <em>
            {backendAvailable
              ? "Informasi dan layanan sekolah"
              : "Mockup interaktif lokal"}
          </em>
        </div>
        <blockquote>
          “Satu ruang kerja untuk menjaga cerita dan layanan sekolah tetap
          terhubung.”
        </blockquote>
        <div className="login-feature-list">
          <span>
            <b>01</b> Kelola penerimaan siswa
          </span>
          <span>
            <b>02</b> Cari profil & dokumen siswa
          </span>
          <span>
            <b>03</b> Pantau agenda & pesan
          </span>
        </div>
      </aside>
    </main>
  );
}
