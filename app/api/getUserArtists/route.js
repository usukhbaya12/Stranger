import connectMongo from "@/server/mongodb";
import Artists from "@/model/artist";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { username } = await req.json();

    const starredArtists = await Artists.find({ starred: username });

    console.log("Received", username);

    return NextResponse.json({ success: true, data: starredArtists });
  } catch (error) {
    console.error("Error in getStarredArtists POST function:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
