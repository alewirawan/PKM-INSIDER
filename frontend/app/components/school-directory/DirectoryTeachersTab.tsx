import { ArrowDown, ArrowUp, Edit3, Trash2 } from "lucide-react";
import type { Teacher } from "../../school-directory-data";
import { type Editor } from "./shared";

export function DirectoryTeachersTab({
  teachers,
  moveTeacher,
  removeTeacher,
  openEditor,
}: {
  teachers: Teacher[];
  moveTeacher: (id: string, direction: -1 | 1) => void;
  removeTeacher: (id: string, name: string) => void;
  openEditor: (editor: Editor) => void;
}) {
  return (
    <section className="directory-teacher-admin">
      <header>
        <div>
          <p className="admin-eyebrow">Urutan publik</p>
          <h2>Profil tenaga pendidik</h2>
        </div>
        <span>Gunakan tombol panah untuk mengubah urutan kartu.</span>
      </header>
      <div className="directory-teacher-grid">
        {teachers.map((teacher, index) => (
          <article key={teacher.id}>
            <span className="directory-mini-portrait teacher">
              {teacher.initials}
            </span>
            <div>
              <small>{teacher.subject}</small>
              <h3>{teacher.name}</h3>
              <p>
                {teacher.cluster ?? "Mata pelajaran belum ditentukan"}
                {teacher.years !== null
                  ? ` · ${teacher.years} tahun mengajar`
                  : ""}
              </p>
            </div>
            <footer>
              <button
                disabled={index === 0}
                onClick={() => moveTeacher(teacher.id, -1)}
              >
                <ArrowUp size={14} /> Naik
              </button>
              <button
                disabled={index === teachers.length - 1}
                onClick={() => moveTeacher(teacher.id, 1)}
              >
                <ArrowDown size={14} /> Turun
              </button>
              <button
                onClick={() =>
                  openEditor({
                    kind: "teacher",
                    value: { ...teacher },
                    isNew: false,
                  })
                }
              >
                <Edit3 size={14} /> Edit
              </button>
              <button
                className="danger"
                onClick={() => removeTeacher(teacher.id, teacher.name)}
              >
                <Trash2 size={14} />
              </button>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
