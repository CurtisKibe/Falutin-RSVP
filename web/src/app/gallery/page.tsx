import Image from "next/image";
import { getGalleryImages, type GalleryImage, urlFor } from "@/lib/sanity";

export const revalidate = 60;

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 pt-32">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-yellow-500 font-mono text-sm tracking-widest uppercase mb-4">The Vault</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            CAPTURED <br /> MOMENTS
          </h1>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {images.length > 0 ? (
            images.map((img: GalleryImage) => (
              <div key={img._id} className="break-inside-avoid group relative rounded-xl overflow-hidden mb-8">
                {/* Image */}
                {img.image && (
                  <Image
                    src={urlFor(img.image).url()}
                    alt={img.title || "Gallery Image"}
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                )}
                
                {/* Overlay Caption */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                  <p className="text-white font-bold text-center border-b-2 border-yellow-500 pb-2">
                    {img.title}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center col-span-full py-20 text-gray-500">
              No images uploaded to the vault yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}