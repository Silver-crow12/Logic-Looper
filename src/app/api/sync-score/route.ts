import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { entries } = await req.json();

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: { id: user.id, email: user.emailAddresses[0].emailAddress },
    });

    await prisma.$transaction(
      entries.map((entry) =>
        prisma.score.upsert({
          where: {
            userId_date: {
              userId: dbUser.id,
              date: entry.date,
            },
          },
          update: {
            points: entry.score,
            timeTaken: entry.timeTaken,
            difficulty: entry.difficulty,
          },
          create: {
            userId: dbUser.id,
            date: entry.date,
            points: entry.score,
            timeTaken: entry.timeTaken,
            difficulty: entry.difficulty,
          },
        }),
      ),
    );

    return NextResponse.json({ success: true, count: entries.length });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
