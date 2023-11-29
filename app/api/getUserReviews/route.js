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
          "reviews.username": username,
        },
      },
      {
        $sort: {
          "reviews.date": -1,
        },
      },
      {
        $project: {
          _id: 1,
          artist: 1,
          image: 1,
          name: 1,
          released: 1,
          total_tracks: 1,
          reviews: {
            $filter: {
              input: "$reviews",
              as: "review",
              cond: { $eq: ["$$review.username", username] },
            },
          },
        },
      },
    ]);

    return NextResponse.json({ success: true, data: userReviews });
  } catch (error) {
    console.error("Error in getStarredArtists POST function:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
