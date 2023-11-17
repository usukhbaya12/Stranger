import connectMongo from "@/server/mongodb";
import Users from "@/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();
    const { id } = await req.json();
    const user = await Users.findById(id);
    return NextResponse.json({ user });
  } catch (error) {
    console.log(error);
  }
}
