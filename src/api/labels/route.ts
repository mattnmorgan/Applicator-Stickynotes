import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@applicator/sdk/context";

// GET /api/stickies/labels — list all labels for the current user (alphabetical)
export async function GET(_req: NextRequest, context: ApiContext) {
  try {
    const user = await context.user();
    const labels = context.recordManager("stickies", "label");
    const result = await labels.readRecords({
      filters: [{ field: "ownerId", operator: "=", value: user.id }],
      limit: 500,
    });
    const sorted = result.records
      .map((r) => ({ id: r.id, ...r.data }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
    return NextResponse.json({ labels: sorted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/stickies/labels — create a new label
export async function POST(req: NextRequest, context: ApiContext) {
  try {
    const user = await context.user();
    const body = await req.json();
    if (!body.name?.trim())
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const labels = context.recordManager("stickies", "label");
    const table = await labels.getTable();
    const record = await labels.createRecord(table, {
      name: body.name.trim(),
      color: body.color || "#3b82f6",
      ownerId: user.id,
    });
    return NextResponse.json({ id: record.id, ...record.data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
