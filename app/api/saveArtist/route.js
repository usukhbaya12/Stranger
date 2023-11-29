import connectMongo from "@/server/mongodb";
import Artists from "@/model/artist";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { artistID, name, popularity, imageUrl, followers, genres } =
      await req.json();

    const existingArtist = await Artists.findOne({ _id: artistID });

    if (existingArtist) {
      console.log("Artist already exists:", existingArtist);
      return NextResponse.json({ existingArtist });
    } else {
      const newArtist = new Artists({
        _id: artistID,
        name: name,
        popularity: popularity,
        image: imageUrl,
        followers: followers,
        genres: genres,
      });

      const savedArtist = await newArtist.save();

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error in saveClickedArtist function:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
