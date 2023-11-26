import connectMongo from "@/server/mongodb";
import Users from "@/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();
    const { username } = await req.json();
    console.log("Received query:", username);

    const users = await Users.find({
      $or: [
        { username: { $regex: username, $options: "i" } },
        { name: { $regex: username, $options: "i" } },
      ],
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error in POST function:", error);
  }
}
