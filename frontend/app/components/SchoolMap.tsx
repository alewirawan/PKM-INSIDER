import school from "../../../contracts/school-profile.json";

const point = `${school.latitude},${school.longitude}`;
export function SchoolMap() {
  return (
    <div className="school-map">
      <iframe
        title="Lokasi SMP Nurul Huda Cisoka"
        src={`https://www.google.com/maps?q=${point}&z=17&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="school-map-caption">
        <div>
          <b>SMP Nurul Huda Cisoka</b>
          <span>{school.coordinateLabel}</span>
        </div>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${point}`}
          target="_blank"
          rel="noreferrer"
        >
          Petunjuk arah ↗
        </a>
      </div>
      <p>
        {school.mapLabel}. Jika peta belum termuat, gunakan tautan petunjuk
        arah.
      </p>
    </div>
  );
}
