"use client";
import { useId } from "react";
import { useClubs } from "../lib/use-clubs";

export function ExtracurricularPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string[];
  onChange: (names: string[]) => void;
  disabled?: boolean;
}) {
  const { clubs, loading, error, refresh } = useClubs();
  const hintId = useId();
  const activeNames = clubs.map((club) => club.name);
  const names = [...new Set([...activeNames, ...value])];
  return (
    <fieldset
      className="extracurricular-picker"
      disabled={disabled}
      aria-describedby={hintId}
    >
      <legend>Ekstrakurikuler (opsional)</legend>
      <p id={hintId}>
        Pilih kegiatan yang kamu sukai. Boleh lebih dari satu, atau lewati dulu.
      </p>
      {loading && <p role="status">Memuat pilihan…</p>}
      {error && <p role="alert">{error}</p>}
      {error && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => void refresh()}
        >
          Coba lagi
        </button>
      )}
      {!loading && !error && !names.length && <p>Belum ada kegiatan aktif.</p>}
      <div className="extracurricular-options">
        {names.map((name) => (
          <label
            key={name}
            className={value.includes(name) ? "is-selected" : ""}
          >
            <input
              type="checkbox"
              disabled={loading || Boolean(error)}
              checked={value.includes(name)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...new Set([...value, name])]
                    : value.filter((item) => item !== name),
                )
              }
            />
            <span>
              {name}
              {!activeNames.includes(name) && <small>Pilihan sebelumnya</small>}
            </span>
          </label>
        ))}
      </div>
      <p className="extracurricular-count" role="status">
        {value.length
          ? `${value.length} kegiatan dipilih`
          : "Belum ada pilihan — kamu tetap bisa melanjutkan."}
      </p>
    </fieldset>
  );
}
