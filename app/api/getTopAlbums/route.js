import connectMongo from "@/server/mongodb";
import Albums from "@/model/album";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongo();

    const topRatedAlbums = await Albums.aggregate([
      {
        $match: {
          "reviews.0": { $exists: true },
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
        },
      },
      {
        $sort: {
          averageRating: -1,
        },
      },
    ]);

    return NextResponse.json({ success: true, data: topRatedAlbums });
  } catch (error) {
    console.error("Error in top albums function:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
