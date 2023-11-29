import connectMongo from "@/server/mongodb";
import Albums from "@/model/album";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { username } = await req.json();

    const userReviews = await Albums.aggregate([
      {
        $match: {
          "reviews.liked": username,
        },
      },
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          "reviews.liked": username,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          artist: 1,
          released: 1,
          image: 1,
          total_tracks: 1,
          likedReview: "$reviews",
        },
      },
    ]);
    console.log("Received", username);

    return NextResponse.json({ success: true, data: userReviews });
  } catch (error) {
    console.error("Error in getStarredArtists POST function:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
