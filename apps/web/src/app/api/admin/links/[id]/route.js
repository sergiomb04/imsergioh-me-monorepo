import { NextResponse } from "next/server";
import { getAdminSessionToken } from "@/lib/adminSession";
import {
  deleteShortLink,
  getShortLinkById,
  updateShortLink,
} from "@/lib/shortLinksService";

export async function GET(request, { params }) {
  const token = await getAdminSessionToken();

  if (!token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const shortId = decodeURIComponent(resolvedParams?.id || "");
  const item = await getShortLinkById(shortId, token);

  if (!item) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item });
}

export async function PATCH(request, { params }) {
  const token = await getAdminSessionToken();

  if (!token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const shortId = decodeURIComponent(resolvedParams?.id || "");

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
    const item = await updateShortLink(shortId, payload, token);

    if (!item) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item });
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

export async function DELETE(request, { params }) {
  const token = await getAdminSessionToken();

  if (!token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const shortId = decodeURIComponent(resolvedParams?.id || "");

  try {
    const item = await deleteShortLink(shortId, token);

    if (!item) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}
