import Image from "next/image";
import school from "../../../contracts/school-profile.json";

export function SchoolEventGallery({ slug }: { slug: string }) {
  if (slug !== school.event.slug) return null;
  return (
    <section className="school-gallery" aria-labelledby="school-gallery-title">
      <p className="section-kicker">Dari halaman sekolah</p>
      <h2 id="school-gallery-title">Potret kebersamaan.</h2>
      <div className="school-gallery-grid">
        {school.event.gallery.map((photo) => (
          <figure key={photo.src}>
            <a
              href={photo.src}
              target="_blank"
              rel="noreferrer"
              aria-label={`Buka foto: ${photo.caption}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 640px) 90vw, 40vw"
              />
            </a>
            <figcaption>{photo.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
