"use client";

import { ArrowUpRight, Inbox, MailOpen } from "lucide-react";
import { useState } from "react";
import { hasBackendApi, requestApi } from "../../lib/api-client";
import {
  saveMessages,
  type ContactMessage,
  type MessageStatus,
} from "../../lib/local-cms";
import { AdminEmptyState, AdminPageHeader } from "./AdminUi";

export function MessagesModule({
  messages,
  setMessages,
  notify,
}: {
  messages: ContactMessage[];
  setMessages: (value: ContactMessage[]) => void;
  notify: (message: string, tone?: "success" | "warning") => void;
}) {
  const [selected, setSelected] = useState<ContactMessage | null>(
    messages[0] ?? null,
  );
  const [filter, setFilter] = useState("Semua");
  const visible =
    filter === "Semua"
      ? messages
      : messages.filter((item) => item.status === filter);
  async function updateStatus(id: string, status: MessageStatus) {
    try {
      if (hasBackendApi())
        await requestApi(`/messages/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
      const next = messages.map((item) =>
        item.id === id ? { ...item, status } : item,
      );
      setMessages(next);
      if (!hasBackendApi()) saveMessages(next);
      setSelected((item) => (item?.id === id ? { ...item, status } : item));
      notify("Status pesan diperbarui.");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Pesan gagal diperbarui.",
        "warning",
      );
    }
  }
  async function remove(id: string) {
    if (!window.confirm("Hapus pesan ini?")) return;
    try {
      if (hasBackendApi())
        await requestApi(`/messages/${id}`, { method: "DELETE" });
      const next = messages.filter((item) => item.id !== id);
      setMessages(next);
      if (!hasBackendApi()) saveMessages(next);
      if (selected?.id === id) setSelected(next[0] ?? null);
      notify("Pesan dihapus.", "warning");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Pesan gagal dihapus.",
        "warning",
      );
    }
  }
  return (
    <div className="admin-view">
      <AdminPageHeader
        eyebrow="Komunikasi"
        title="Pesan masuk"
        description="Tindak lanjuti pertanyaan dari formulir kontak website."
      />
      <section className="message-workspace">
        <aside className="message-list">
          <div className="filter-row">
            {["Semua", "Baru", "Dibaca", "Selesai"].map((item) => (
              <button
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
          {visible.map((message) => (
            <button
              className={`${selected?.id === message.id ? "active" : ""} ${message.status === "Baru" ? "unread" : ""}`}
              onClick={() => {
                setSelected(message);
                if (message.status === "Baru")
                  updateStatus(message.id, "Dibaca");
              }}
              key={message.id}
            >
              <span>{message.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <b>{message.name}</b>
                <strong>{message.topic}</strong>
                <small>{message.message}</small>
              </div>
              <time>
                {new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "short",
                }).format(new Date(message.submittedAt))}
              </time>
            </button>
          ))}
          {!visible.length && (
            <AdminEmptyState
              icon={Inbox}
              title="Inbox masih tenang"
              description="Pesan baru dari halaman kontak akan muncul otomatis di sini."
            />
          )}
        </aside>
        <article className="message-detail">
          {selected ? (
            <>
              <header>
                <div>
                  <p className="admin-eyebrow">{selected.topic}</p>
                  <h2>{selected.name}</h2>
                  <a href={`mailto:${selected.email}`}>{selected.email}</a>
                </div>
                <span
                  className={`status status-${selected.status.toLowerCase()}`}
                >
                  {selected.status}
                </span>
              </header>
              <div className="message-body">
                <p>{selected.message}</p>
              </div>
              <footer>
                <button
                  className="button button-dark icon-button"
                  onClick={() =>
                    (window.location.href = `mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.topic)}`)
                  }
                >
                  Balas via email <ArrowUpRight size={15} />
                </button>
                <button
                  className="button admin-button-muted"
                  onClick={() => updateStatus(selected.id, "Selesai")}
                >
                  Tandai selesai
                </button>
                <button
                  className="text-danger"
                  onClick={() => remove(selected.id)}
                >
                  Hapus pesan
                </button>
              </footer>
            </>
          ) : (
            <AdminEmptyState
              icon={MailOpen}
              title="Pilih sebuah pesan"
              description="Detail percakapan akan tampil di area ini setelah pesan dipilih."
            />
          )}
        </article>
      </section>
    </div>
  );
}
