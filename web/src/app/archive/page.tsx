import { client, urlFor } from "@/lib/sanity";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock, Film, ArrowRight } from "lucide-react";

// --- 1. DEFINES THE TYPE ---
interface ArchivedScreening {
  _id: string;
  date: string;
  price: number;
  movie: {
    title: string;
    poster: object; 
    description: string;
    themes?: string[];
  };
}

// --- 2. DATA FETCHING ---
async function getArchivedScreenings(): Promise<ArchivedScreening[]> {
  const query = `
    *[_type == "screening" && date < now()] | order(date desc) {
      _id,
      date,
      price,
      movie->{
        title,
        poster,
        description,
        themes
      }
    }
  `;
  return await client.fetch(query, {}, { next: { revalidate: 60 } });
}

export default async function ArchivePage() {
  const screenings = await getArchivedScreenings();

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="mb-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter">
                The <span className="text-yellow-500">Archives</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                A hall of fame for the cinematic journeys we&apos;ve taken together. 
                These screenings have concluded.
            </p>
        </div>

        {screenings.length === 0 && (
            <div className="text-center py-20 border border-white/10 rounded-3xl bg-neutral-900/50">
                <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-xl">No past screenings found.</p>
            </div>
        )}

        {/* --- LIST LAYOUT (Horizontal Rows) --- */}
        <div className="flex flex-col gap-6">
            {screenings.map((screening: ArchivedScreening) => (
                <Link 
                    href={`/archive/${screening._id}`}
                    key={screening._id} 
                    className="group relative flex flex-col md:flex-row bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden hover:border-yellow-500/50 hover:bg-neutral-800/50 transition-all duration-300"
                >
                    {/* POSTER IMAGE (Left Side / Top on Mobile) */}
                    <div className="relative w-full md:w-72 aspect-video md:aspect-4/3 shrink-0 overflow-hidden">
                        {screening.movie.poster ? (
                            <Image
                                src={urlFor(screening.movie.poster).url()}
                                alt={screening.movie.title}
                                fill
                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                                <Film className="w-12 h-12 text-white/20" />
                            </div>
                        )}
                        
                        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full z-10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Archived</span>
                        </div>
                    </div>

                    {/* CONTENT (Right Side / Bottom on Mobile) */}
                    <div className="p-6 md:p-8 flex flex-col justify-center flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-3 group-hover:text-yellow-500 transition-colors truncate">
                                    {screening.movie.title}
                                </h2>
                                
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400 font-mono uppercase tracking-wider mb-4">
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-yellow-500" />
                                        {format(new Date(screening.date), "MMM d, yyyy")}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-yellow-500" />
                                        {format(new Date(screening.date), "h:mm a")}
                                    </span>
                                </div>
                            </div>

                            {/* Arrow Icon for Desktop */}
                            <ArrowRight className="hidden md:block w-6 h-6 text-neutral-600 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
                        </div>

                        {/* Themes */}
                        {screening.movie.themes && (
                            <div className="flex flex-wrap gap-2 mt-auto">
                                {screening.movie.themes.map((theme: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-gray-300 border border-white/5 group-hover:border-white/20 transition-colors">
                                        {theme}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </Link>
            ))}
        </div>

      </div>
    </div>
  );
}