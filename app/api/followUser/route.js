import connectMongo from "@/server/mongodb";
import Users from "@/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { usernameToFollow, currentUser } = await req.json();

    const userToFollow = await Users.findOne({ username: usernameToFollow });
    const userFollowing = await Users.findOne({ username: currentUser });

    await Users.updateOne(
      { username: currentUser },
      {
        $addToSet: { following: userToFollow._id },
      }
    );

    await Users.updateOne(
      { username: usernameToFollow },
      {
        $addToSet: { followers: userFollowing._id },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in followUser POST function:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
