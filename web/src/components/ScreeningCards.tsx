import { urlFor } from "@/lib/sanity";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

// 1. DEFINES THE SHAPE OF DATA (The Interface)
export interface ScreeningData {
  _id: string;
  date: string;
  price: number;
  movie: {
    title: string;
    poster: object; 
    description: string;
  };
}

interface ScreeningProps {
  data: ScreeningData;
}

export default function ScreeningCard({ data }: ScreeningProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-gray-900 border border-gray-800 hover:border-yellow-500 transition-all duration-300">
      
      {/* 1. MOVIE POSTER */}
      <div className="relative h-64 w-full overflow-hidden">
        {data.movie.poster && (
          <Image
            src={urlFor(data.movie.poster).url()}
            alt={data.movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        <div className="absolute top-4 right-4 bg-yellow-500 text-black font-bold px-3 py-1 rounded-md text-sm">
          {format(new Date(data.date), "MMM d, HH:mm")}
        </div>
      </div>

      {/* 2. DETAILS */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{data.movie.title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
          {data.movie.description || "Join us for an exclusive screening..."}
        </p>

        <div className="flex items-center justify-between mt-4">
            <span className="text-white font-mono">KES {data.price}</span>
            <Link 
              href={`/book/${data._id}`}
              className="px-4 py-2 bg-white text-black text-sm font-bold rounded hover:bg-gray-200 transition-colors"
            >
              Book Seat
            </Link>
        </div>
      </div>
    </div>
  );
}