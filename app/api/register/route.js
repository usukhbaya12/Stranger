import Users from "@/model/user";
import connectMongo from "@/server/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    await connectMongo();
    await Users.create({ username, email, password: hashedPassword });

    return NextResponse.json(
      { message: "User created successfully!" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "An error occured while creating the user." },
      { status: 500 }
    );
  }
}
