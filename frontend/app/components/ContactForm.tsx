"use client";

import { FormEvent, useState } from "react";
import { addMessage } from "../lib/local-cms";
import { hasBackendApi, requestApi } from "../lib/api-client";

const initial = { name: "", email: "", topic: "Informasi PPDB", message: "" };

export function ContactForm() {
  const [form, setForm] = useState(initial);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(key: keyof typeof initial, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (hasBackendApi())
        await requestApi("/messages", {
          method: "POST",
          body: JSON.stringify(form),
        });
      else
        addMessage({
          id: crypto.randomUUID(),
          ...form,
          status: "Baru",
          submittedAt: new Date().toISOString(),
        });
      setForm(initial);
      setDone(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Pesan gagal dikirim.");
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="contact-success" role="status">
        <span>✓</span>
        <h3>Pesan sudah diterima.</h3>
        <p>
          Terima kasih telah menghubungi sekolah. Panitia akan meninjau pesan
          Anda.
        </p>
        <button className="button button-dark" onClick={() => setDone(false)}>
          Kirim pesan lain
        </button>
      </div>
    );

  return (
    <form onSubmit={submit}>
      {error && <p role="alert">{error}</p>}
      <label>
        Nama lengkap
        <input
          required
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="Nama Anda"
        />
      </label>
      <label>
        Email
        <input
          required
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
          type="email"
          placeholder="nama@email.com"
        />
      </label>
      <label>
        Topik
        <select
          value={form.topic}
          onChange={(event) => update("topic", event.target.value)}
        >
          <option>Informasi PPDB</option>
          <option>Kunjungan sekolah</option>
          <option>Program akademik</option>
          <option>Lainnya</option>
        </select>
      </label>
      <label>
        Pesan
        <textarea
          required
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          minLength={10}
          maxLength={3000}
          rows={5}
          placeholder="Tuliskan pertanyaan Anda..."
        />
      </label>
      <button className="button button-dark" type="submit" disabled={busy}>
        Kirim pesan →
      </button>
      <small>Pesan hanya dapat dibaca oleh pengelola sekolah.</small>
    </form>
  );
}
