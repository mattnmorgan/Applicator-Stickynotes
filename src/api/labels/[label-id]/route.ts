import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@applicator/sdk/context";

// PATCH /api/stickies/labels/:labelId — rename or recolor a label
export async function PATCH(
  req: NextRequest,
  context: ApiContext,
  params: { labelId: string }
) {
  try {
    const user = await context.user();
    const labels = context.recordManager("stickies", "label");
    const record = await labels.readRecord(params.labelId);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (record.data.ownerId !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.color !== undefined) updates.color = body.color;

    const table = await labels.getTable();
    const updated = await labels.updateRecord(table, params.labelId, updates);
    return NextResponse.json({ id: updated.id, ...updated.data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/stickies/labels/:labelId
export async function DELETE(
  _req: NextRequest,
  context: ApiContext,
  params: { labelId: string }
) {
  try {
    const user = await context.user();
    const labels = context.recordManager("stickies", "label");
    const record = await labels.readRecord(params.labelId);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (record.data.ownerId !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await labels.deleteRecord(params.labelId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
