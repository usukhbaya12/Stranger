import connectMongo from "@/server/mongodb";
import Album from "@/model/album";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { albumId, username } = await req.json();

    const album = await Album.findOne({ _id: albumId });

    if (!album) {
      return NextResponse.json({ success: false, error: "Album not found" });
    }

    const userReview = album.reviews.find(
      (review) => review.username === username
    );

    if (!userReview) {
      console.log("User has not reviewed this album yet");
      return NextResponse.json({ success: false });
    }

    return NextResponse.json({ success: true, data: userReview });
  } catch (error) {
    console.error("Error in getUserReview function:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
