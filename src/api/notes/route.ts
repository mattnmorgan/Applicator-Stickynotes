import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@applicator/sdk/context";

// GET /api/stickies/notes — list all notes for the current user
export async function GET(_req: NextRequest, context: ApiContext) {
  try {
    const user = await context.user();
    const notes = context.recordManager("stickies", "note");
    const result = await notes.readRecords({
      filters: [{ field: "ownerId", operator: "=", value: user.id }],
      limit: 2000,
    });
    return NextResponse.json({
      notes: result.records.map((r) => ({
        id: r.id,
        ...r.data,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/stickies/notes — create a new note
export async function POST(req: NextRequest, context: ApiContext) {
  try {
    const user = await context.user();
    const body = await req.json();
    const notes = context.recordManager("stickies", "note");
    const table = await notes.getTable();
    const record = await notes.createRecord(table, {
      name: body.name || "New Note",
      content: body.content || "",
      labelIds: body.labelIds || [],
      lists: body.lists || [],
      isFavorite: false,
      isArchived: false,
      isPinned: false,
      ownerId: user.id,
    });
    return NextResponse.json(
      {
        id: record.id,
        ...record.data,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
