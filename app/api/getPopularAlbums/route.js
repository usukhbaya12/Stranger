import connectMongo from "@/server/mongodb";
import Albums from "@/model/album";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongo();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const albumsWithReviews = await Albums.aggregate([
      {
        $unwind: "$reviews",
      },
      {
        $match: {
          "reviews.date": { $gte: oneWeekAgo },
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
          reviewCount: { $sum: 1 },
          averageRating: { $avg: "$reviews.rating" },
        },
      },
      {
        $sort: {
          reviewCount: -1,
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
          reviewCount: 1,
          averageRating: 1,
        },
      },
    ]);

    return NextResponse.json({ success: true, data: albumsWithReviews });
  } catch (error) {
    console.error("Error in getAlbumsReviewedTheMost GET function:", error);
    return NextResponse.json({
      success: false,
      error: "Internal Server Error",
    });
  }
}
