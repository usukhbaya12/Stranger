import connectMongo from "@/server/mongodb";
import Users from "@/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();
    const { email } = await req.json();
    const usermail = await Users.findOne({ email }).select("_id");
    console.log("user: ", usermail);
    return NextResponse.json({ usermail });
  } catch (error) {
    console.log(error);
  }
}
