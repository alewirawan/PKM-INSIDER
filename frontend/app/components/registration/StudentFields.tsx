import { useCatalog } from "../../lib/use-catalog";
export const initialRegistration = {
  studentName: "",
  nisn: "",
  originSchool: "",
  birthPlace: "",
  birthDate: "",
  gender: "Laki-laki" as "Laki-laki" | "Perempuan",
  address: "",
  parentName: "",
  parentOccupation: "",
  phone: "",
  email: "",
  extracurricular: "Belum menentukan",
};
export type RegistrationValues = typeof initialRegistration;
type Props = {
  form: RegistrationValues;
  update: (key: keyof RegistrationValues, value: string) => void;
  parent?: boolean;
  hideActivities?: boolean;
};
export function StudentFields({
  form,
  update,
  parent = false,
  hideActivities = false,
}: Props) {
  const { clubs } = useCatalog();
  const fields: Array<{
    key: keyof RegistrationValues;
    label: string;
    type?: string;
  }> = parent
    ? [
        { key: "parentName", label: "Nama orang tua/wali" },
        { key: "parentOccupation", label: "Pekerjaan orang tua/wali" },
        { key: "phone", label: "Nomor WhatsApp", type: "tel" },
        { key: "email", label: "Email", type: "email" },
      ]
    : [
        { key: "studentName", label: "Nama lengkap" },
        { key: "nisn", label: "NISN" },
        { key: "birthPlace", label: "Tempat lahir" },
        { key: "birthDate", label: "Tanggal lahir", type: "date" },
        { key: "originSchool", label: "Asal sekolah" },
      ];
  return (
    <fieldset>
      <legend>
        {parent ? "02 - Data orang tua/wali" : "01 - Data calon siswa"}
      </legend>
      <div className="form-grid">
        {fields.map(({ key, label, type }) => (
          <label key={key}>
            {label}
            <input
              required={key !== "parentOccupation"}
              name={key}
              type={type ?? "text"}
              value={form[key]}
              maxLength={key === "nisn" ? 10 : 180}
              minLength={key === "nisn" ? 10 : undefined}
              inputMode={
                key === "nisn" ? "numeric" : key === "phone" ? "tel" : undefined
              }
              pattern={
                key === "nisn"
                  ? "[0-9]{10}"
                  : key === "phone"
                    ? "[+]?[0-9 ]{8,20}"
                    : undefined
              }
              title={
                key === "nisn" ? "NISN harus terdiri dari 10 angka" : undefined
              }
              max={
                type === "date"
                  ? new Date().toISOString().slice(0, 10)
                  : undefined
              }
              onChange={(e) =>
                update(
                  key,
                  key === "nisn"
                    ? e.target.value.replace(/\D/g, "")
                    : e.target.value,
                )
              }
            />
          </label>
        ))}
        {!parent && (
          <>
            <label>
              Jenis kelamin
              <select
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
              >
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
            </label>
            <label className="span-2">
              Alamat domisili
              <textarea
                required
                rows={3}
                maxLength={600}
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </label>
            {!hideActivities && (
              <label className="span-2">
                Ekstrakurikuler yang diminati
                <select
                  value={form.extracurricular}
                  onChange={(e) => update("extracurricular", e.target.value)}
                >
                  <option>Belum menentukan</option>
                  {clubs
                    .filter((c) => c.active)
                    .map((c) => (
                      <option key={c.id}>{c.name}</option>
                    ))}
                  {form.extracurricular !== "Belum menentukan" &&
                    !clubs.some(
                      (c) => c.active && c.name === form.extracurricular,
                    ) && <option>{form.extracurricular}</option>}
                </select>
                <small>
                  Pilihan awal, bukan penempatan final. Kegiatan masih contoh.
                </small>
              </label>
            )}
          </>
        )}
      </div>
    </fieldset>
  );
}
