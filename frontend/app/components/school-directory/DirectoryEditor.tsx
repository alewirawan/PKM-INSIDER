"use client";

import { Save, X } from "lucide-react";
import type { FormEventHandler } from "react";
import {
  hasOtherPrincipal,
  isDescendant,
  type SchoolLeader,
  type Teacher,
} from "../../school-directory-data";
import { DialogPortal } from "../DialogPortal";
import { clusters, levels, tones, type Editor } from "./shared";

export function DirectoryEditor({
  editor,
  leaders,
  setEditor,
  onClose,
  onSubmit,
}: {
  editor: NonNullable<Editor>;
  leaders: SchoolLeader[];
  setEditor: (editor: Editor) => void;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}) {
  return (
    <DialogPortal
      className="directory-editor-backdrop"
      dialogClassName="directory-editor-shell"
      labelledBy="directory-editor-title"
      onClose={() => onClose()}
    >
      <form className="directory-editor" onSubmit={onSubmit}>
        <header>
          <div>
            <p className="admin-eyebrow">
              {editor.isNew ? "Profil baru" : "Edit profil"}
            </p>
            <h2 id="directory-editor-title">
              {editor.kind === "leader"
                ? "Pengelola sekolah"
                : "Tenaga pendidik"}
            </h2>
          </div>
          <button type="button" onClick={() => onClose()} aria-label="Tutup">
            <X size={18} />
          </button>
        </header>
        <div className="directory-editor-body">
          <p className="field-hint">
            Profil memakai inisial nama agar tidak menampilkan foto orang lain.
          </p>
          <div className="admin-form-grid">
            <label className="span-2">
              Nama lengkap
              <input
                required
                value={editor.value.name}
                onChange={(event) =>
                  setEditor({
                    ...editor,
                    value: { ...editor.value, name: event.target.value },
                  } as Editor)
                }
              />
            </label>
            <label>
              Inisial
              <input
                maxLength={3}
                value={editor.value.initials}
                onChange={(event) =>
                  setEditor({
                    ...editor,
                    value: {
                      ...editor.value,
                      initials: event.target.value.toUpperCase(),
                    },
                  } as Editor)
                }
                placeholder="Otomatis dari nama"
              />
            </label>
            <label>
              Aksen warna
              <select
                value={editor.value.tone}
                onChange={(event) =>
                  setEditor({
                    ...editor,
                    value: { ...editor.value, tone: event.target.value },
                  } as Editor)
                }
              >
                {tones.map((tone) => (
                  <option key={tone}>{tone}</option>
                ))}
              </select>
            </label>
            {editor.kind === "leader" ? (
              <>
                <label>
                  Jabatan
                  <input
                    required
                    value={editor.value.role}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        value: {
                          ...editor.value,
                          role: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Kategori jabatan
                  <select
                    value={editor.value.level}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        value: {
                          ...editor.value,
                          level: event.target.value as SchoolLeader["level"],
                        },
                      })
                    }
                  >
                    {levels.map((level) => (
                      <option
                        value={level.value}
                        disabled={
                          level.value === "principal" &&
                          hasOtherPrincipal(leaders, editor.value.id)
                        }
                        key={level.value}
                      >
                        {level.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="span-2">
                  Terhubung ke jabatan
                  <select
                    value={editor.value.parentId ?? ""}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        value: {
                          ...editor.value,
                          parentId: event.target.value || null,
                          coordination: event.target.value
                            ? editor.value.coordination
                            : false,
                        },
                      })
                    }
                  >
                    <option value="">Posisi paling atas</option>
                    {leaders
                      .filter(
                        (person) =>
                          !isDescendant(leaders, person.id, editor.value.id),
                      )
                      .map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.role} — {person.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="span-2">
                  Jenis hubungan
                  <select
                    value={
                      editor.value.coordination ? "coordination" : "reporting"
                    }
                    disabled={!editor.value.parentId}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        value: {
                          ...editor.value,
                          coordination: event.target.value === "coordination",
                        },
                      })
                    }
                  >
                    <option value="reporting">Di bawah jabatan tersebut</option>
                    <option value="coordination">
                      Koordinasi (garis putus-putus)
                    </option>
                  </select>
                </label>
                <label className="span-2">
                  Fokus kerja
                  <input
                    required
                    value={editor.value.focus}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        value: {
                          ...editor.value,
                          focus: event.target.value,
                        },
                      })
                    }
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  Mata pelajaran
                  <input
                    required
                    value={editor.value.subject}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        value: {
                          ...editor.value,
                          subject: event.target.value,
                        },
                      })
                    }
                  />
                </label>
                <label>
                  Rumpun
                  <select
                    value={editor.value.cluster ?? ""}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        value: {
                          ...editor.value,
                          cluster: (event.target.value ||
                            null) as Teacher["cluster"],
                        },
                      })
                    }
                  >
                    <option value="">Belum ditentukan</option>
                    {clusters.map((cluster) => (
                      <option key={cluster}>{cluster}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Pengalaman (tahun)
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={editor.value.years ?? ""}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        value: {
                          ...editor.value,
                          years:
                            event.target.value === ""
                              ? null
                              : Number(event.target.value),
                        },
                      })
                    }
                  />
                </label>
                <label className="span-2">
                  Catatan profil
                  <textarea
                    required
                    rows={3}
                    value={editor.value.note}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        value: {
                          ...editor.value,
                          note: event.target.value,
                        },
                      })
                    }
                  />
                </label>
              </>
            )}
          </div>
        </div>
        <footer>
          <button
            className="button admin-button-muted"
            type="button"
            onClick={() => onClose()}
          >
            Batal
          </button>
          <button className="button button-accent icon-button" type="submit">
            <Save size={15} /> Simpan perubahan
          </button>
        </footer>
      </form>
    </DialogPortal>
  );
}
