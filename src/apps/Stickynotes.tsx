"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { UiContext } from "@applicator/sdk/context";
import { ButtonIcon, Icon, Spinner, ToastStack } from "@applicator/sdk/components";
import type { ToastItem } from "@applicator/sdk/components";
import { Note } from "../types/Note";
import { Label } from "../types/Label";
import NoteFlyout from "../components/NoteFlyout";

interface Props {
  context?: UiContext;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<\/div>/gi, " ")
    .replace(/<\/li>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

interface NoteRowProps {
  note: Note;
  labels: Label[];
  onClick: () => void;
}

function NoteRow({ note, labels, onClick }: NoteRowProps) {
  const [hovered, setHovered] = useState(false);
  const noteLabels = labels.filter((l) => note.labelIds.includes(l.id));
  const contentPreview = stripHtml(note.content);

  const checklistTotal = note.lists.reduce((acc, l) => acc + l.items.length, 0);
  const checklistDone = note.lists.reduce(
    (acc, l) => acc + l.items.filter((i) => i.completed).length,
    0,
  );

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "9px 12px",
        borderBottom: "1px solid #1e293b",
        cursor: "pointer",
        backgroundColor: hovered ? "rgba(30,41,59,0.6)" : "transparent",
        transition: "background-color 0.1s",
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginBottom: contentPreview ? 3 : 0,
        }}
      >
        {note.isPinned && (
          <span style={{ color: "#3b82f6", flexShrink: 0, display: "flex" }}>
            <Icon name="pin" size={11} />
          </span>
        )}
        <span
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: "#f1f5f9",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
          }}
        >
          {note.name}
        </span>
        {note.isFavorite && (
          <span style={{ color: "#f59e0b", flexShrink: 0, display: "flex" }}>
            <Icon name="star" size={11} />
          </span>
        )}
        {checklistTotal > 0 && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontSize: 10,
              color: "#64748b",
              flexShrink: 0,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <Icon name="list-view" size={10} />
            {checklistDone}/{checklistTotal}
          </span>
        )}
        {noteLabels.length > 0 && (
          <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
            {noteLabels.slice(0, 4).map((l) => (
              <span
                key={l.id}
                title={l.name}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: l.color,
                  flexShrink: 0,
                }}
              />
            ))}
            {noteLabels.length > 4 && (
              <span style={{ fontSize: 10, color: "#64748b" }}>+{noteLabels.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Content preview */}
      {contentPreview && (
        <div
          style={{
            fontSize: 11,
            color: "#64748b",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.5,
          }}
        >
          {contentPreview}
        </div>
      )}
    </div>
  );
}

export default function Stickynotes({ context: _context }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: ToastItem) => {
    setToasts((prev) => [...prev, toast]);
  }, []);

  const removeToast = useCallback((index: number) => {
    setToasts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [notesRes, labelsRes] = await Promise.all([
        fetch("/api/stickies/notes"),
        fetch("/api/stickies/labels"),
      ]);
      const [notesData, labelsData] = await Promise.all([
        notesRes.json(),
        labelsRes.json(),
      ]);
      const sorted = (notesData.notes || []).sort(
        (a: Note, b: Note) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime(),
      );
      setNotes(sorted);
      setLabels(labelsData.labels || []);
    } catch {
      addToast({ message: "Failed to load notes", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = useCallback(async () => {
    try {
      const res = await fetch("/api/stickies/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Note", content: "", labelIds: [], lists: [] }),
      });
      if (!res.ok) throw new Error();
      const note: Note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setEditNote(note);
    } catch {
      addToast({ message: "Failed to create note", type: "error" });
    }
  }, [addToast]);

  const handleUpdate = useCallback(
    async (updated: Note) => {
      try {
        const res = await fetch(`/api/stickies/notes/${updated.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: updated.name,
            content: updated.content,
            labelIds: updated.labelIds,
            lists: updated.lists,
          }),
        });
        if (!res.ok) throw new Error();
        const saved: Note = await res.json();
        setNotes((prev) =>
          prev
            .map((n) => (n.id === saved.id ? saved : n))
            .sort(
              (a, b) =>
                new Date(b.updatedAt || b.createdAt).getTime() -
                new Date(a.updatedAt || a.createdAt).getTime(),
            ),
        );
        setEditNote((prev) =>
          prev?.id === saved.id
            ? { ...prev, updatedAt: saved.updatedAt, createdAt: saved.createdAt }
            : prev,
        );
      } catch {
        addToast({ message: "Failed to save note", type: "error" });
      }
    },
    [addToast],
  );

  const handleDuplicate = useCallback(
    async (source: Note) => {
      try {
        const res = await fetch("/api/stickies/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${source.name} (Copy)`,
            content: source.content,
            labelIds: source.labelIds,
            lists: source.lists,
          }),
        });
        if (!res.ok) throw new Error();
        const note: Note = await res.json();
        setNotes((prev) => [note, ...prev]);
        setEditNote(note);
      } catch {
        addToast({ message: "Failed to duplicate note", type: "error" });
      }
    },
    [addToast],
  );

  const filtered = useMemo(() => {
    const active = notes.filter((n) => !n.isArchived);
    if (!search.trim()) return active;
    const q = search.toLowerCase();
    return active.filter((n) => {
      if (n.name.toLowerCase().includes(q)) return true;
      const noteLabels = labels.filter((l) => n.labelIds.includes(l.id));
      if (noteLabels.some((l) => l.name.toLowerCase().includes(q))) return true;
      const text = stripHtml(n.content).toLowerCase();
      if (text.includes(q)) return true;
      return false;
    });
  }, [notes, labels, search]);

  const containerStyle: React.CSSProperties = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "#0f172a",
    color: "#f1f5f9",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
  };

  // Edit view
  if (editNote) {
    return (
      <div style={containerStyle}>
        <NoteFlyout
          note={editNote}
          labels={labels}
          onClose={() => setEditNote(null)}
          onUpdate={handleUpdate}
          onDuplicate={handleDuplicate}
        />
        <ToastStack toasts={toasts} onClose={removeToast} />
      </div>
    );
  }

  // List view
  return (
    <div style={containerStyle}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 12px",
          borderBottom: "1px solid #1e293b",
          flexShrink: 0,
          gap: 6,
        }}
      >
        <span style={{ color: "#64748b", display: "flex", alignItems: "center" }}>
          <Icon name="sticky-note" size={14} />
        </span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: "#f1f5f9" }}>
          Stickies
        </span>
        <ButtonIcon
          name="plus"
          label="New note"
          onClick={handleCreate}
          size="sm"
          placement="left"
        />
      </div>

      {/* Search */}
      <div
        style={{
          padding: "8px 10px",
          flexShrink: 0,
          borderBottom: "1px solid #1e293b",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#1e293b",
            borderRadius: 6,
            padding: "5px 8px",
            border: "1px solid #334155",
          }}
        >
          <span style={{ color: "#475569", display: "flex", alignItems: "center" }}>
            <Icon name="search" size={13} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#f1f5f9",
              fontSize: 13,
              padding: 0,
              fontFamily: "inherit",
            }}
          />
          {search && (
            <span
              onClick={() => setSearch("")}
              style={{
                cursor: "pointer",
                color: "#475569",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Icon name="close" size={13} />
            </span>
          )}
        </div>
      </div>

      {/* Notes list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: "24px 16px",
              textAlign: "center",
              color: "#475569",
              fontSize: 13,
            }}
          >
            {search
              ? "No notes match your search."
              : "No notes yet — click + to create one."}
          </div>
        ) : (
          filtered.map((note) => (
            <NoteRow
              key={note.id}
              note={note}
              labels={labels}
              onClick={() => setEditNote(note)}
            />
          ))
        )}
      </div>

      <ToastStack toasts={toasts} onClose={removeToast} />
    </div>
  );
}
