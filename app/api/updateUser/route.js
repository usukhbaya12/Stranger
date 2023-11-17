import connectMongo from "@/server/mongodb";
import { NextResponse } from "next/server";
import Users from "@/model/user";

export async function POST(req, res) {
  try {
    const { username, name, bio, avatar } = await req.json();
    await connectMongo();

    const user = await Users.findOneAndUpdate(
      { username: username },
      {
        $set: {
          name: name,
          bio: bio,
        },
      },
      { new: true }
    );

    return NextResponse.json(
      { message: "User information updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An error occured while updating the user." },
      { status: 500 }
    );
  }
}
