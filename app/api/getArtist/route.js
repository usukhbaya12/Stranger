import connectMongo from "@/server/mongodb";
import Artists from "@/model/artist";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();
    const { artistId } = await req.json();

    const artist = await Artists.findById(artistId);

    return NextResponse.json({ success: true, data: artist });
  } catch (error) {
    console.error("Error in POST function:", error);
  }
}
