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

    const userReviewIndex = album.reviews.findIndex(
      (review) => review.username === username
    );

    if (userReviewIndex === -1) {
      console.log("User has not reviewed this album yet");
      return NextResponse.json({ success: false, error: "Review not found" });
    }

    const deletedReview = album.reviews.splice(userReviewIndex, 1);

    await album.save();

    return NextResponse.json({ success: true, data: deletedReview });
  } catch (error) {
    console.error("Error in handleDeleteReview function:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
