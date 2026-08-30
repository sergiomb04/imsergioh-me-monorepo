import { NextResponse } from "next/server";
import { getAdminSessionToken } from "@/lib/adminSession";
import { createShortLink, listShortLinks } from "@/lib/shortLinksService";

export async function GET() {
  const token = await getAdminSessionToken();

  if (!token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const items = await listShortLinks(token);
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "failed_to_list_links" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const token = await getAdminSessionToken();

  if (!token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json_payload" },
      { status: 400 },
    );
  }

  try {
    const item = await createShortLink(payload, token);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    if (error?.code === 11000 || error?.message === "short_id_already_exists") {
      return NextResponse.json(
        { ok: false, error: "short_id_already_exists" },
        { status: 409 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}
