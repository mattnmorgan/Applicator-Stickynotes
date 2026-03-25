import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@applicator/sdk/context";

// GET /api/stickies/notes/:noteId
export async function GET(
  _req: NextRequest,
  context: ApiContext,
  params: { noteId: string }
) {
  try {
    const user = await context.user();
    const notes = context.recordManager("stickies", "note");
    const record = await notes.readRecord(params.noteId);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (record.data.ownerId !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({
      id: record.id,
      ...record.data,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/stickies/notes/:noteId
export async function PATCH(
  req: NextRequest,
  context: ApiContext,
  params: { noteId: string }
) {
  try {
    const user = await context.user();
    const notes = context.recordManager("stickies", "note");
    const record = await notes.readRecord(params.noteId);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (record.data.ownerId !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.content !== undefined) updates.content = body.content;
    if (body.labelIds !== undefined) updates.labelIds = body.labelIds;
    if (body.lists !== undefined) updates.lists = body.lists;
    if (body.isFavorite !== undefined) updates.isFavorite = body.isFavorite;

    const table = await notes.getTable();
    const updated = await notes.updateRecord(table, params.noteId, updates);
    return NextResponse.json({
      id: updated.id,
      ...updated.data,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/stickies/notes/:noteId
export async function DELETE(
  _req: NextRequest,
  context: ApiContext,
  params: { noteId: string }
) {
  try {
    const user = await context.user();
    const notes = context.recordManager("stickies", "note");
    const record = await notes.readRecord(params.noteId);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (record.data.ownerId !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await notes.deleteRecord(params.noteId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
