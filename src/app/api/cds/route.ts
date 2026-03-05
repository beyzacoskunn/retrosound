import { NextResponse } from "next/server"
import { saveCD } from "@/lib/store"
import { v4 as uuid } from "uuid"

export async function POST(req: Request) {
  const body = await req.json()

  const id = uuid()

  const cd = {
    id,
    color: body.color,
    title: body.title,
    playlistUrl: body.playlistUrl,
  }

  saveCD(cd)

  return NextResponse.json({ id })
}