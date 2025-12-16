import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { hashPassword, createToken, setAuthCookie } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
    });

    // Create token
    const token = createToken(user._id.toString(), user.email);

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    const debug = process.env.DEBUG_API === "true";
    const message = debug
      ? error instanceof Error
        ? error.message
        : String(error)
      : "Failed to register";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
