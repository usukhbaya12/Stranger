import connectMongo from "@/server/mongodb";
import Albums from "@/model/album";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { userIds } = await req.json();

    const userReviews = await Albums.aggregate([
      {
        $match: {
          "reviews.username": { $in: userIds },
        },
      },
      {
        $unwind: "$reviews",
      },
      {
        $sort: {
          "reviews.date": -1,
        },
      },
      {
        $group: {
          _id: {
            albumId: "$_id",
            artist: "$artist",
            image: "$image",
            name: "$name",
            released: "$released",
            total_tracks: "$total_tracks",
          },
          reviews: { $push: "$reviews" },
        },
      },
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          "reviews.username": { $in: userIds },
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
          artist: "$_id.artist",
          image: "$_id.image",
          name: "$_id.name",
          released: "$_id.released",
          total_tracks: "$_id.total_tracks",
          reviews: 1,
        },
      },
    ]);

    return NextResponse.json({ success: true, data: userReviews });
  } catch (error) {
    console.error("Error in getFollowingUsersReviews POST function:", error);
    return NextResponse.json({
      success: false,
      error: "Internal Server Error",
    });
  }
}
