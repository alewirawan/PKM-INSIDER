"use client";
import { useState } from "react";
import { OrganizationDirectory } from "./OrganizationDirectory";
import { TeacherDirectory } from "./TeacherDirectory";
export function DirectoryTabs() {
  const [active, setActive] = useState(0);
  const tabs = ["Struktur Organisasi", "Daftar Guru"];
  function select(index: number) {
    setActive(index);
    document.getElementById("directory-tab-" + index)?.focus();
  }
  return (
    <div className="public-directory-tabs">
      <div
        className="directory-tabbar"
        role="tablist"
        aria-label="Struktur dan pendidik"
      >
        {tabs.map((label, i) => (
          <button
            key={label}
            id={"directory-tab-" + i}
            type="button"
            role="tab"
            aria-selected={active === i}
            tabIndex={active === i ? 0 : -1}
            aria-controls={"directory-panel-" + i}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
                e.preventDefault();
                select(e.key === "Home" ? 0 : e.key === "End" ? 1 : 1 - active);
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="directory-demo-note">
        Kenali tenaga pendidik dan pengelola SMP Nurul Huda Cisoka.
      </p>
      <div
        role="tabpanel"
        id="directory-panel-0"
        aria-labelledby="directory-tab-0"
        hidden={active !== 0}
      >
        <section className="organization-section">
          <header className="organization-intro">
            <div>
              <p className="section-kicker">Struktur organisasi</p>
              <h2>Kenali peran di sekolah.</h2>
            </div>
            <p>
              Setiap peran mendukung pelayanan pendidikan, kedisiplinan, dan
              pendampingan siswa di SMP Nurul Huda.
            </p>
          </header>
          <OrganizationDirectory />
        </section>
      </div>
      <div
        role="tabpanel"
        id="directory-panel-1"
        aria-labelledby="directory-tab-1"
        hidden={active !== 1}
      >
        <TeacherDirectory />
      </div>
    </div>
  );
}
