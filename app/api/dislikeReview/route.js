import connectMongo from "@/server/mongodb";
import Album from "@/model/album";
import { NextResponse } from "next/server";

async function dislikeReview(req) {
  try {
    await connectMongo();

    const { albumId, reviewId, username } = await req.json();

    const album = await Album.findById(albumId);

    if (!album) {
      return NextResponse.json({ success: false, error: "Album not found" });
    }

    const review = album.reviews.id(reviewId);

    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found" });
    }

    const usernameIndex = review.disliked.indexOf(username);

    if (usernameIndex === -1) {
      review.disliked.push(username);
    } else {
      review.disliked.splice(usernameIndex, 1);
    }

    await album.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in dislikeReview function:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}

export async function POST(req) {
  return dislikeReview(req);
}
