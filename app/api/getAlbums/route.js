import connectMongo from "@/server/mongodb";
import Albums from "@/model/album";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();
    const { albumIds } = await req.json();

    const albumsData = await Albums.find({ _id: { $in: albumIds } });

    const albumsWithAvgRating = albumsData.map((album) => {
      const reviews = album.reviews || [];
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const avgRating = totalRating / Math.max(reviews.length, 1);
      return {
        ...album.toObject(),
        avgRating,
      };
    });

    return NextResponse.json({ albumsData: albumsWithAvgRating });
  } catch (error) {
    console.error("Error in POST function:", error);
    return NextResponse.error({ status: 500, body: "Internal Server Error" });
  }
}
