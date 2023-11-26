import connectMongo from "@/server/mongodb";
import Users from "@/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();

    const { usernameToUnfollow, currentUser } = await req.json();

    const userToUnfollow = await Users.findOne({
      username: usernameToUnfollow,
    });
    const userUnfollowing = await Users.findOne({ username: currentUser });

    await Users.updateOne(
      { username: currentUser },
      {
        $pull: { following: userToUnfollow._id },
      }
    );

    await Users.updateOne(
      { username: usernameToUnfollow },
      {
        $pull: { followers: userUnfollowing._id },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in unfollowUser POST function:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
