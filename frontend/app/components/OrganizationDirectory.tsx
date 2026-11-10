"use client";

import { Fragment, type CSSProperties } from "react";
import { useDirectory } from "../lib/use-directory";
import {
  chunkDirectoryRows,
  groupSchoolLeaders,
  type SchoolLeader,
} from "../school-directory-data";

const portraitPositions = [
  "0% 0%",
  "33.333% 0%",
  "66.667% 0%",
  "100% 0%",
  "0% 100%",
  "33.333% 100%",
  "66.667% 100%",
  "100% 100%",
];

function rowWidth(rowSize: number, capacity: number) {
  const gap = 18;
  const percentage = (rowSize / capacity) * 100;
  const offset =
    ((rowSize * (capacity - 1)) / capacity) * gap - (rowSize - 1) * gap;
  return `calc(${percentage}% - ${offset}px)`;
}

function LeaderCard({ person }: { person: SchoolLeader }) {
  return (
    <article className={`org-card org-${person.level} tone-${person.tone}`}>
      <div
        className="org-avatar"
        style={{
          backgroundPosition: portraitPositions[person.portraitIndex % 8],
        }}
      >
        <span>{person.initials}</span>
      </div>
      <div className="org-card-copy">
        <small>{person.role}</small>
        <h3>{person.name}</h3>
        <p>{person.focus}</p>
      </div>
    </article>
  );
}

export function OrganizationDirectory() {
  const {
    directory: { leaders },
    loading,
    error,
    refresh,
  } = useDirectory();

  const groups = groupSchoolLeaders(leaders);

  return (
    <div className="org-chart" aria-label="Bagan struktur organisasi sekolah">
      {loading && <p role="status">Memuat struktur organisasi…</p>}
      {error && (
        <p role="alert">
          {error} <button onClick={() => void refresh()}>Coba lagi</button>
        </p>
      )}
      {!loading && !error && leaders.length === 0 && (
        <p>Struktur organisasi belum dipublikasikan.</p>
      )}
      {groups.map((group, groupIndex) => (
        <Fragment key={group.level}>
          {groupIndex > 0 && (
            <span className="org-connector" aria-hidden="true" />
          )}
          <div
            className={`org-level org-level-${group.level}${groupIndex === 0 ? " org-level-first" : ""}`}
          >
            {chunkDirectoryRows(group.people).map((row, rowIndex) => (
              <div
                className="org-row"
                data-count={row.length}
                key={`${group.level}-${rowIndex}`}
                style={
                  {
                    "--org-columns": row.length,
                    "--org-row-width": rowWidth(
                      row.length,
                      Math.min(4, group.people.length),
                    ),
                  } as CSSProperties
                }
              >
                {row.map((person) => (
                  <LeaderCard person={person} key={person.id} />
                ))}
              </div>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
