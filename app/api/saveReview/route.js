import connectMongo from "@/server/mongodb";
import Album from "@/model/album";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { albumId, username, title, comment, rating } = await req.json();

    const album = await Album.findOne({ _id: albumId });

    if (!album) {
      return NextResponse.json({ success: false, error: "Album not found" });
    }

    const existingReviewIndex = album.reviews.findIndex(
      (review) => review.username === username
    );

    if (existingReviewIndex !== -1) {
      console.error("Review from this username already exists");
      return NextResponse.json({
        success: false,
        error: "Review from this username already exists",
      });
    }

    const review = {
      username,
      title,
      comment,
      rating,
    };

    album.reviews.push(review);

    const savedAlbum = await album.save();
    console.log("Saved review:", savedAlbum);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in saveReview function:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
