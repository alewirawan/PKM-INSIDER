"use client";
import { requestApi } from "../../lib/api-client";
import { useContentList } from "../../lib/use-content-list";
import type { ContactMessage } from "../../lib/cms/types";
import type { AdminNotify } from "./types";
import { MessagesModule } from "./MessagesModule";
const load = () => requestApi<ContactMessage[]>("/messages");
export function LiveMessagesModule({ notify }: { notify: AdminNotify }) {
  const state = useContentList(load);
  return (
    <>
      {state.loading && <p role="status">Memuat pesan…</p>}
      {state.error && (
        <p role="alert">
          {state.error}
          <button onClick={() => void state.refresh()}>Coba lagi</button>
        </p>
      )}
      <MessagesModule
        messages={state.items}
        setMessages={state.setItems}
        notify={notify}
      />
    </>
  );
}
