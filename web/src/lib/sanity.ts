import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2023-01-01",
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: object) {
  return builder.image(source);
}

export interface Screening {
  _id: string;
  date: string;
  price: number;
  movie: {
    title: string;
    poster: object;
    description: string;
  };
}

export async function getUpcomingScreenings(): Promise<Screening[]> {
  const query = `*[_type == "screening" && date >= now()] | order(date asc) {
    _id,
    date,
    price,
    movie->{
      title,
      poster,
      description
    }
  }`;
  
  return client.fetch<Screening[]>(query);
}

export interface GalleryImage {
  _id: string;
  title: string;
  image: object;
  date: string;
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const query = `*[_type == "gallery"] | order(date desc) {
    _id,
    title,
    image,
    date
  }`;
  return client.fetch<GalleryImage[]>(query);
}