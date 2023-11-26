import connectMongo from "@/server/mongodb";
import Albums from "@/model/album";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { albumId, name, artist, released, image, label, total_tracks } =
      await req.json();

    const existingAlbum = await Albums.findOne({ _id: albumId });

    if (existingAlbum) {
      console.log("Album already exists:", existingAlbum);
      return NextResponse.json({ existingAlbum });
    } else {
      const newAlbum = new Albums({
        _id: albumId,
        name: name,
        artist: artist,
        released: released,
        image: image,
        label: label,
        total_tracks: total_tracks,
      });

      const savedAlbum = await newAlbum.save();

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error in saveClickedAlbum function:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
