import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create token
    const token = createToken(user._id.toString(), user.email);

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    const debug = process.env.DEBUG_API === "true";
    const message = debug
      ? error instanceof Error
        ? error.message
        : String(error)
      : "Failed to login";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
