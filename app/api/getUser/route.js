import connectMongo from "@/server/mongodb";
import Users from "@/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();
    const { username } = await req.json();

    const user = await Users.findOne({ username });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error in POST function:", error);
  }
}
