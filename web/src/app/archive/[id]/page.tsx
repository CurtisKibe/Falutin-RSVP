import { client, urlFor } from "@/lib/sanity";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Film } from "lucide-react";
import { format } from "date-fns";

// --- 1. TYPE DEFINITIONS ---
interface GalleryImage {
  _key: string;
  asset: object;
  caption?: string;
}

interface ArchivedEvent {
  _id: string;
  date: string;
  locationName?: string;
  movie: {
    title: string;
    poster: object;
    description: string;
    themes?: string[];
  };
  gallery?: GalleryImage[];
}

// --- 2. DATA FETCHING ---
async function getArchivedEvent(id: string): Promise<ArchivedEvent | null> {
  const query = `
    *[_type == "screening" && _id == $id][0] {
      _id,
      date,
      locationName,
      movie->{
        title,
        poster,
        description,
        themes
      },
      gallery
    }
  `;
  return await client.fetch(query, { id }, { next: { revalidate: 60 } });
}

export default async function ArchiveDetailPage({ params }: { params: { id: string } }) {
  const event = await getArchivedEvent(params.id);

  if (!event) return <div className="text-white pt-32 text-center">Event not found.</div>;

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* BACK BUTTON */}
        <Link href="/archive" className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Archives
        </Link>

        {/* HEADER SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Left: Poster */}
            <div className="relative aspect-2/3 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                 {event.movie.poster && (
                    <Image
                        src={urlFor(event.movie.poster).url()}
                        alt={event.movie.title}
                        fill
                        className="object-cover"
                    />
                 )}
            </div>

            {/* Right: Info */}
            <div className="flex flex-col justify-center space-y-6">
                <div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-2">{event.movie.title}</h1>
                    <p className="text-2xl text-yellow-500 font-mono">
                        {format(new Date(event.date), "MMMM do, yyyy")}
                    </p>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>{event.locationName || "Secret Location"}</span>
                </div>

                <p className="text-gray-300 text-lg leading-relaxed border-l-2 border-white/20 pl-6">
                    {event.movie.description}
                </p>

                {event.movie.themes && (
                    <div className="flex flex-wrap gap-2 pt-4">
                        {event.movie.themes.map((theme, i) => (
                            <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm uppercase tracking-wider text-gray-300">
                                {theme}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* --- THE GALLERY --- */}
        <div className="border-t border-white/10 pt-20">
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
                <Film className="w-8 h-8 text-yellow-500" /> Event Gallery
            </h2>

            {!event.gallery || event.gallery.length === 0 ? (
                <p className="text-gray-500 italic">No photos were archived for this event.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {event.gallery.map((image: GalleryImage, i: number) => (
                        <div key={i} className="group relative aspect-square bg-neutral-900 rounded-xl overflow-hidden border border-white/10">
                            <Image
                                src={urlFor(image).url()}
                                alt="Event photo"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {image.caption && (
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <p className="text-sm font-medium text-white">{image.caption}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}