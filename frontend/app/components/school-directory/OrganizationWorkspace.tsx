"use client";
import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Maximize,
  Minus,
  Plus,
} from "lucide-react";
import type { SchoolLeader } from "../../school-directory-data";
import type { OrganizationScene } from "./organization-scene";

export function OrganizationWorkspace({
  leaders,
}: {
  leaders: SchoolLeader[];
}) {
  const [mode, setMode] = useState<"2d" | "3d" | "list">("2d");
  const [selected, setSelected] = useState("");
  const [zoomPercent, setZoomPercent] = useState(100);
  const [sceneVersion, setSceneVersion] = useState(0);
  const initialized = useRef(false);
  const [interaction, setInteraction] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<OrganizationScene | null>(null);
  const hintId = useId();
  useEffect(() => {
    let disposed = false;
    import("./organization-scene")
      .then(({ createOrganizationScene }) => {
        if (!disposed && host.current) {
          engine.current = createOrganizationScene(
            host.current,
            leaders,
            setSelected,
            setZoomPercent,
          );
          if (!initialized.current) {
            if (window.matchMedia("(max-width: 620px)").matches)
              setMode("list");
            initialized.current = true;
          }
          setSceneVersion((version) => version + 1);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!disposed) setStatus("error");
      });
    return () => {
      disposed = true;
      engine.current?.dispose();
      engine.current = null;
    };
  }, [leaders]);
  useEffect(() => {
    engine.current?.mode(mode === "3d");
  }, [mode, sceneVersion]);
  useEffect(() => {
    engine.current?.interact(interaction);
  }, [interaction, sceneVersion]);
  useEffect(() => {
    engine.current?.select(selected);
  }, [selected, sceneVersion]);
  const person = leaders.find((p) => p.id === selected);
  const parent = leaders.find((p) => p.id === person?.parentId);
  const children = leaders.filter((p) => p.parentId === selected);
  const listVisible = mode === "list" || status === "error";
  return (
    <section
      className="organization-workspace"
      aria-label="Jelajahi struktur sekolah"
    >
      <div className="workspace-heading">
        <div>
          <p className="section-kicker">Peta organisasi</p>
          <h3>Terhubung dalam satu tujuan.</h3>
        </div>
        <span>{leaders.length} peran sekolah</span>
      </div>
      <header className="workspace-toolbar">
        <div
          className="workspace-modes"
          role="group"
          aria-label="Tampilan struktur"
        >
          {(["2d", "3d", "list"] as const).map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={mode === item}
              onClick={() => {
                setMode(item);
                setInteraction(false);
              }}
            >
              {item === "list" ? "Daftar" : item.toUpperCase()}
            </button>
          ))}
        </div>
        <label className="workspace-find">
          Temukan peran
          <select
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              engine.current?.focus(e.target.value);
            }}
          >
            <option value="">Semua peran ({leaders.length})</option>
            {leaders.map((p) => (
              <option key={p.id} value={p.id}>
                {p.role} · {p.name}
              </option>
            ))}
          </select>
        </label>
      </header>
      <div className="workspace-body">
        <div className="workspace-map" hidden={listVisible}>
          <div className="workspace-caption">
            <span className="workspace-live-dot" /> SMP NURUL HUDA{" "}
            <span> / {leaders.length} peran</span>
          </div>
          {status === "loading" && (
            <p role="status">
              Menyiapkan kanvas… Tampilan daftar tetap dapat dibuka.
            </p>
          )}
          <div
            className="workspace-viewport"
            ref={host}
            aria-label="Kanvas bagan organisasi"
          />
          <div
            className="workspace-controls"
            role="group"
            aria-label="Kontrol kanvas"
          >
            <button
              type="button"
              aria-label="Perbesar bagan"
              onClick={() => engine.current?.zoom(0.8)}
            >
              <Plus size={18} />
            </button>
            <button
              type="button"
              aria-label="Perkecil bagan"
              onClick={() => engine.current?.zoom(1.25)}
            >
              <Minus size={18} />
            </button>
            <button
              type="button"
              aria-label="Tampilkan seluruh bagan"
              onClick={() => engine.current?.fit()}
            >
              <Maximize size={18} />
              <span>Semua</span>
            </button>
            <output className="workspace-zoom" aria-label="Skala bagan">
              {zoomPercent}%
            </output>
            <button
              type="button"
              aria-label="Lihat bagian kiri"
              onClick={() => engine.current?.pan(-1, 0)}
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Lihat bagian kanan"
              onClick={() => engine.current?.pan(1, 0)}
            >
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              aria-label="Lihat bagian atas"
              onClick={() => engine.current?.pan(0, 1)}
            >
              <ArrowUp size={18} />
            </button>
            <button
              type="button"
              aria-label="Lihat bagian bawah"
              onClick={() => engine.current?.pan(0, -1)}
            >
              <ArrowDown size={18} />
            </button>
          </div>
          <div className="workspace-gesture">
            <button
              type="button"
              aria-pressed={interaction}
              aria-describedby={hintId}
              onClick={() => setInteraction(!interaction)}
            >
              {interaction ? "Selesai menggeser" : "Aktifkan geser kanvas"}
            </button>
            <p id={hintId}>
              {interaction
                ? "Seret area bagan. Ctrl + scroll atau tombol + / − untuk zoom."
                : "Klik kartu untuk detail. Pilih peran untuk menemukannya di bagan."}
            </p>
          </div>
        </div>
        {listVisible && (
          <div className="workspace-list">
            {status === "error" && (
              <p role="status">
                Kanvas belum dapat dimuat. Seluruh struktur tersedia di daftar
                ini.
              </p>
            )}
            <ul>
              {leaders.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    aria-pressed={selected === p.id}
                    onClick={() => setSelected(p.id)}
                  >
                    <small>{p.role}</small>
                    <strong>{p.name}</strong>
                    <span>
                      {p.parentId
                        ? `${p.coordination ? "Koordinasi dengan" : "Di bawah"} ${leaders.find((item) => item.id === p.parentId)?.role ?? "—"}`
                        : "Pimpinan yayasan / unit mandiri"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <aside
          className="workspace-details"
          aria-label="Detail peran"
          aria-live="polite"
        >
          <div className="workspace-profile">
            <p className="section-kicker">
              {person ? "Detail peran" : "Kenali tim sekolah"}
            </p>
            <span className="workspace-detail-badge" aria-hidden="true">
              {person?.initials ?? "NH"}
            </span>
            <h3>{person?.role ?? "Setiap peran terhubung."}</h3>
            {person && <strong>{person.name}</strong>}
            <p>
              {person?.focus ||
                "Pilih salah satu kartu untuk melihat nama, peran, dan hubungan dalam struktur sekolah."}
            </p>
          </div>
          <div className="workspace-relations">
            {parent && (
              <div className="workspace-relation">
                <small>
                  {person?.coordination ? "Koordinasi dengan" : "Di bawah"}
                </small>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(parent.id);
                    engine.current?.focus(parent.id);
                  }}
                >
                  {parent.role} →
                </button>
              </div>
            )}
            {children.length > 0 && (
              <div className="workspace-relation">
                <small>Peran terhubung</small>
                {children.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => {
                      setSelected(p.id);
                      engine.current?.focus(p.id);
                    }}
                  >
                    {p.role} →
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
      <footer className="workspace-footer">
        Garis utuh menunjukkan hubungan struktur; garis putus-putus menunjukkan
        koordinasi. Mode Daftar nyaman untuk membaca di layar kecil.
      </footer>
    </section>
  );
}
