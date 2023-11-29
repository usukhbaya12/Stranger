import connectMongo from "@/server/mongodb";
import Artists from "@/model/artist";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { artistId, username } = await req.json();

    const artist = await Artists.findOne({ _id: artistId });

    if (!artist) {
      return NextResponse.json(
        { success: false, error: "Artist not found" },
        { status: 404 }
      );
    }

    if (!artist.starred) {
      artist.starred = [];
    }

    const usernameIndex = artist.starred.indexOf(username);

    if (usernameIndex === -1) {
      artist.starred.push(username);
    } else {
      artist.starred.splice(usernameIndex, 1);
    }

    await artist.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in starArtist POST function:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
