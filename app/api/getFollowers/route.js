import connectMongo from "@/server/mongodb";
import Users from "@/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();
    const { userIds } = await req.json();

    const followers = await Users.find({ _id: { $in: userIds } });

    return NextResponse.json({ followers });
  } catch (error) {
    console.error("Error in getFollowers API route:", error);
    return NextResponse.error(error);
  }
}
