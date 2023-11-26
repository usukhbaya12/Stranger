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

    const allReviews = album.reviews || [];

    return NextResponse.json({ success: true, data: allReviews });
  } catch (error) {
    console.error("Error in getPopularReviews function:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
