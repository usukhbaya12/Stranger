import connectMongo from "@/server/mongodb";
import Album from "@/model/album";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { albumId } = await req.json();

    console.log("received id: ", albumId);

    const album = await Album.findOne({ _id: albumId });

    if (!album) {
      return NextResponse.json({ success: false, error: "Album not found" });
    }

    const sortedReviews = album.reviews.sort((a, b) => {
      const scoreA = a.liked.length - a.disliked.length;
      const scoreB = b.liked.length - b.disliked.length;

      return scoreB - scoreA;
    });

    return NextResponse.json({ success: true, data: sortedReviews });
  } catch (error) {
    console.error("Error in getPopularReviews function:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
