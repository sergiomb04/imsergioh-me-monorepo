import { NextResponse } from "next/server";
import { getAdminSessionToken } from "@/lib/adminSession";
import {
  deleteAllTraffic,
  deleteTrafficByShortId,
  deleteTrafficRecord,
  listShortLinkTraffic,
} from "@/lib/shortLinksService";

export async function GET(request) {
  const token = await getAdminSessionToken();

  if (!token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const shortId = searchParams.get("shortId") || undefined;
  const limit = Number(searchParams.get("limit") || "200");

  try {
    const items = await listShortLinkTraffic({ shortId, limit }, token);
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "failed_to_list_traffic" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const token = await getAdminSessionToken();

  if (!token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let payload = {};

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const id = typeof payload.id === "string" ? payload.id : "";
  const shortId = typeof payload.shortId === "string" ? payload.shortId : "";
  const deleteAll = Boolean(payload.deleteAll);

  try {
    if (id) {
      const deleted = await deleteTrafficRecord(id, token);

      if (!deleted) {
        return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, mode: "single", deleted });
    }

    if (shortId) {
      const deletedCount = await deleteTrafficByShortId(shortId, token);
      return NextResponse.json({ ok: true, mode: "shortId", deletedCount });
    }

    if (deleteAll) {
      const deletedCount = await deleteAllTraffic(token);
      return NextResponse.json({ ok: true, mode: "all", deletedCount });
    }

    return NextResponse.json(
      { ok: false, error: "missing_delete_selector" },
      { status: 400 },
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: "unknown_error" }, { status: 500 });
  }
}
