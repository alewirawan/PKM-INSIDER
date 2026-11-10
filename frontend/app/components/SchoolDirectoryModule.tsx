"use client";

import { BookOpenText, Network, Plus, UsersRound } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { storeDirectory } from "../lib/api/school";
import { useDirectory } from "../lib/use-directory";
import {
  hasOtherPrincipal,
  type SchoolDirectory,
  type SchoolLeader,
} from "../school-directory-data";
import { DirectoryEditor } from "./school-directory/DirectoryEditor";
import { DirectoryStructureTab } from "./school-directory/DirectoryStructureTab";
import { DirectoryTeachersTab } from "./school-directory/DirectoryTeachersTab";
import { initialsFrom, type Editor, type Tab } from "./school-directory/shared";

type Props = {
  notify: (message: string, tone?: "success" | "warning") => void;
};

export function SchoolDirectoryModule({ notify }: Props) {
  const resource = useDirectory();
  const directory = resource.directory;
  const saving = useRef(false);
  const [tab, setTab] = useState<Tab>("structure");
  const [editor, setEditor] = useState<Editor>(null);

  async function commit(next: SchoolDirectory, message: string) {
    if (saving.current) return false;
    saving.current = true;
    try {
      const saved = await storeDirectory(next);
      resource.setItems([saved]);
      notify(message);
      return true;
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Direktori gagal disimpan.",
        "warning",
      );
      return false;
    } finally {
      saving.current = false;
    }
  }

  function moveLeader(id: string, direction: -1 | 1) {
    const current = directory.leaders.find((person) => person.id === id);
    if (!current) return;
    const sameLevel = directory.leaders.filter(
      (person) => person.level === current.level,
    );
    const ownIndex = sameLevel.findIndex((person) => person.id === id);
    const target = sameLevel[ownIndex + direction];
    if (!target) return;
    const next = [...directory.leaders];
    const from = next.findIndex((person) => person.id === id);
    const to = next.findIndex((person) => person.id === target.id);
    [next[from], next[to]] = [next[to], next[from]];
    commit(
      { ...directory, leaders: next },
      "Urutan struktur organisasi diperbarui.",
    );
  }

  function moveTeacher(id: string, direction: -1 | 1) {
    const next = [...directory.teachers];
    const from = next.findIndex((person) => person.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= next.length) return;
    [next[from], next[to]] = [next[to], next[from]];
    commit({ ...directory, teachers: next }, "Urutan daftar guru diperbarui.");
  }

  function changeLevel(id: string, level: SchoolLeader["level"]) {
    if (level === "principal" && hasOtherPrincipal(directory.leaders, id)) {
      notify("Kepala sekolah hanya dapat diisi oleh satu orang.", "warning");
      return;
    }
    const next = directory.leaders.map((person) =>
      person.id === id ? { ...person, level } : person,
    );
    commit(
      { ...directory, leaders: next },
      "Posisi hierarki berhasil dipindahkan.",
    );
  }

  function remove(kind: "leader" | "teacher", id: string, name: string) {
    if (!window.confirm(`Hapus ${name} dari direktori?`)) return;
    const next =
      kind === "leader"
        ? {
            ...directory,
            leaders: directory.leaders.filter((person) => person.id !== id),
          }
        : {
            ...directory,
            teachers: directory.teachers.filter((person) => person.id !== id),
          };
    commit(next, "Profil dihapus dari direktori.");
  }

  async function saveEditor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    let saved = false;
    if (editor.kind === "leader") {
      const value = {
        ...editor.value,
        initials: editor.value.initials || initialsFrom(editor.value.name),
      };
      if (
        value.level === "principal" &&
        hasOtherPrincipal(directory.leaders, value.id)
      ) {
        notify("Kepala sekolah hanya dapat diisi oleh satu orang.", "warning");
        return;
      }
      const leaders = editor.isNew
        ? [...directory.leaders, value]
        : directory.leaders.map((item) =>
            item.id === value.id ? value : item,
          );
      saved = await commit(
        { ...directory, leaders },
        editor.isNew
          ? "Jabatan baru ditambahkan."
          : "Profil struktur berhasil diperbarui.",
      );
    } else {
      const value = {
        ...editor.value,
        initials: editor.value.initials || initialsFrom(editor.value.name),
      };
      const teachers = editor.isNew
        ? [...directory.teachers, value]
        : directory.teachers.map((item) =>
            item.id === value.id ? value : item,
          );
      saved = await commit(
        { ...directory, teachers },
        editor.isNew
          ? "Guru baru ditambahkan."
          : "Profil guru berhasil diperbarui.",
      );
    }
    if (saved) setEditor(null);
  }

  function newLeader() {
    setEditor({
      kind: "leader",
      isNew: true,
      value: {
        id: `leader-${Date.now()}`,
        name: "",
        role: "",
        initials: "",
        focus: "",
        tone: "sage",
        level: "support",
        portraitIndex: directory.leaders.length % 8,
      },
    });
  }
  function newTeacher() {
    setEditor({
      kind: "teacher",
      isNew: true,
      value: {
        id: `teacher-${Date.now()}`,
        name: "",
        initials: "",
        subject: "",
        cluster: "Sains",
        years: 1,
        note: "",
        tone: "sage",
        portraitIndex: directory.teachers.length % 8,
      },
    });
  }

  return (
    <div className="admin-view directory-admin-view">
      {resource.error && (
        <p role="alert">
          {resource.error}{" "}
          <button onClick={() => void resource.refresh()}>Coba lagi</button>
        </p>
      )}
      {resource.loading && <p role="status">Memuat direktori…</p>}
      <header className="admin-page-header directory-page-header">
        <div>
          <p className="admin-eyebrow">Direktori sekolah</p>
          <h1>Struktur & guru</h1>
          <span>
            Atur hierarki, pindahkan posisi, dan perbarui profil yang tampil di
            website publik.
          </span>
        </div>
        <button
          className="button button-dark icon-button"
          onClick={tab === "structure" ? newLeader : newTeacher}
        >
          <Plus size={16} />{" "}
          {tab === "structure" ? "Tambah jabatan" : "Tambah guru"}
        </button>
      </header>
      <section className="directory-summary">
        <article>
          <Network size={20} />
          <div>
            <strong>{directory.leaders.length}</strong>
            <span>Pengelola sekolah</span>
          </div>
        </article>
        <article>
          <UsersRound size={20} />
          <div>
            <strong>{directory.teachers.length}</strong>
            <span>Profil guru</span>
          </div>
        </article>
        <aside>
          <b>Perubahan langsung tersinkron ke halaman publik</b>
          <span>
            Sementara tersimpan di browser lokal; siap diganti dengan API
            backend.
          </span>
        </aside>
      </section>
      <div className="directory-tabs">
        <button
          className={tab === "structure" ? "active" : ""}
          onClick={() => setTab("structure")}
        >
          <Network size={16} /> Struktur organisasi
        </button>
        <button
          className={tab === "teachers" ? "active" : ""}
          onClick={() => setTab("teachers")}
        >
          <BookOpenText size={16} /> Daftar guru
        </button>
      </div>

      {tab === "structure" ? (
        <DirectoryStructureTab
          leaders={directory.leaders}
          moveLeader={moveLeader}
          changeLevel={changeLevel}
          removeLeader={(id, name) => remove("leader", id, name)}
          openEditor={setEditor}
          newLeader={newLeader}
        />
      ) : (
        <DirectoryTeachersTab
          teachers={directory.teachers}
          moveTeacher={moveTeacher}
          removeTeacher={(id, name) => remove("teacher", id, name)}
          openEditor={setEditor}
        />
      )}

      {editor && (
        <DirectoryEditor
          editor={editor}
          leaders={directory.leaders}
          setEditor={setEditor}
          onClose={() => setEditor(null)}
          onSubmit={saveEditor}
        />
      )}
    </div>
  );
}
