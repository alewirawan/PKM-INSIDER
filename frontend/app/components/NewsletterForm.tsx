"use client";

import { FormEvent, useState } from "react";
import { addNewsletterSubscription } from "../lib/local-cms";
import { hasBackendApi, requestApi } from "../lib/api-client";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (hasBackendApi())
        await requestApi("/newsletter-subscriptions", {
          method: "POST",
          body: JSON.stringify({ email, consent: true }),
        });
      else
        addNewsletterSubscription({
          email,
          subscribedAt: new Date().toISOString(),
        });
      setDone(true);
      setEmail("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Pendaftaran gagal.");
    } finally {
      setBusy(false);
    }
  }

  return done ? (
    <div className="inline-success" role="status">
      <span>✓</span>
      <div>
        <b>Berhasil berlangganan</b>
        <small>Alamat email berhasil dicatat.</small>
      </div>
      <button onClick={() => setDone(false)}>Tambah lagi</button>
    </div>
  ) : (
    <form onSubmit={submit}>
      {error && <p role="alert">{error}</p>}
      <label className="sr-only" htmlFor="newsletter-email">
        Alamat email
      </label>
      <input
        id="newsletter-email"
        required
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Alamat email Anda"
      />
      <button className="button button-accent" type="submit" disabled={busy}>
        Setuju berlangganan
      </button>
    </form>
  );
}
