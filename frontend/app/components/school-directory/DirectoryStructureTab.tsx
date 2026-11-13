import { ArrowDown, ArrowUp, Edit3, Plus, Trash2 } from "lucide-react";
import {
  hasOtherPrincipal,
  type SchoolLeader,
} from "../../school-directory-data";
import { levels, type Editor } from "./shared";

export function DirectoryStructureTab({
  leaders,
  moveLeader,
  changeLevel,
  removeLeader,
  openEditor,
  newLeader,
}: {
  leaders: SchoolLeader[];
  moveLeader: (id: string, direction: -1 | 1) => void;
  changeLevel: (id: string, level: SchoolLeader["level"]) => void;
  removeLeader: (id: string, name: string) => void;
  openEditor: (editor: Editor) => void;
  newLeader: () => void;
}) {
  return (
    <section className="directory-levels">
      {levels.map((level) => {
        const people = leaders.filter((person) => person.level === level.value);
        return (
          <article
            className={`directory-level level-${level.value}`}
            key={level.value}
          >
            <header>
              <div>
                <span>
                  {String(levels.indexOf(level) + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2>{level.label}</h2>
                  <p>{people.length} posisi pada kategori ini</p>
                </div>
              </div>
              <button onClick={newLeader}>
                <Plus size={14} /> Tambah
              </button>
            </header>
            <div className="directory-person-list">
              {people.map((person, index) => (
                <div className="directory-person-row" key={person.id}>
                  <span className="directory-mini-portrait organization">
                    {person.initials}
                  </span>
                  <div>
                    <b>{person.name}</b>
                    <small>{person.role}</small>
                    <em>
                      {person.parentId
                        ? `${person.coordination ? "Koordinasi dengan" : "Di bawah"} ${leaders.find((item) => item.id === person.parentId)?.role ?? "jabatan terkait"}`
                        : "Posisi paling atas"}
                    </em>
                  </div>
                  <label>
                    Kategori
                    <select
                      value={person.level}
                      onChange={(event) =>
                        changeLevel(
                          person.id,
                          event.target.value as SchoolLeader["level"],
                        )
                      }
                    >
                      {levels.map((item) => (
                        <option
                          value={item.value}
                          disabled={
                            item.value === "principal" &&
                            hasOtherPrincipal(leaders, person.id)
                          }
                          key={item.value}
                        >
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="directory-row-actions">
                    <button
                      disabled={index === 0}
                      onClick={() => moveLeader(person.id, -1)}
                      title="Naikkan urutan"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      disabled={index === people.length - 1}
                      onClick={() => moveLeader(person.id, 1)}
                      title="Turunkan urutan"
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      onClick={() =>
                        openEditor({
                          kind: "leader",
                          value: { ...person },
                          isNew: false,
                        })
                      }
                      title="Edit profil"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      className="danger"
                      onClick={() => removeLeader(person.id, person.name)}
                      title="Hapus profil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
              {!people.length && (
                <div className="directory-level-empty">
                  Belum ada posisi pada level ini.
                </div>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
