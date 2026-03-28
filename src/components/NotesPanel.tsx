"use client";

import React from "react";
import { ButtonIcon, Spinner, Icon } from "@applicator/sdk/components";
import { Note } from "../types/Note";
import { Label } from "../types/Label";
import NoteRow from "./NoteRow";

interface Props {
  notes: Note[];
  labels: Label[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCreateNote: () => void;
  onOpenNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onToggleFavorite: (noteId: string) => void;
  onToggleArchive: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  openNoteId: string | null;
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: "8px 16px 4px",
        fontSize: 10,
        fontWeight: 700,
        color: "#475569",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );
}

export default function NotesPanel({
  notes,
  labels,
  loading,
  searchQuery,
  onSearchChange,
  onCreateNote,
  onOpenNote,
  onDeleteNote,
  onToggleFavorite,
  onToggleArchive,
  onTogglePin,
  openNoteId,
}: Props) {
  const pinnedNotes = notes.filter((n) => n.isPinned);
  const unpinnedNotes = notes.filter((n) => !n.isPinned);
  const hasSections = pinnedNotes.length > 0;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {/* Sticky header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderBottom: "1px solid #1e293b",
          backgroundColor: "#0f172a",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Search bar */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 6,
            padding: "6px 10px",
          }}
        >
          <span style={{ color: "#64748b", flexShrink: 0, lineHeight: 0 }}>
            <Icon name="search" size={14} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#f1f5f9",
              fontSize: 13,
              minWidth: 0,
            }}
          />
          {searchQuery && (
            <span
              style={{ cursor: "pointer", color: "#64748b", lineHeight: 0 }}
              onClick={() => onSearchChange("")}
            >
              <Icon name="close" size={12} />
            </span>
          )}
        </div>

        {/* Create note */}
        <ButtonIcon
          name="plus"
          label="Create note"
          onClick={onCreateNote}
          variant="bordered"
          subvariant="info"
          placement="left"
        />
      </div>

      {/* Notes list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Spinner />
          </div>
        )}

        {!loading && notes.length === 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: 56,
              gap: 10,
              color: "#334155",
            }}
          >
            <Icon name="sticky-note" size={36} />
            <p style={{ margin: 0, fontSize: 14, color: "#475569" }}>
              {searchQuery ? "No matching notes" : "No notes yet — click + to create one"}
            </p>
          </div>
        )}

        {!loading && notes.length > 0 && (
          <>
            {pinnedNotes.length > 0 && (
              <>
                <SectionLabel text="Pinned" />
                {pinnedNotes.map((note) => (
                  <NoteRow
                    key={note.id}
                    note={note}
                    labels={labels}
                    isOpen={note.id === openNoteId}
                    onClick={() => onOpenNote(note)}
                    onDelete={() => onDeleteNote(note.id)}
                    onToggleFavorite={() => onToggleFavorite(note.id)}
                    onToggleArchive={() => onToggleArchive(note.id)}
                    onTogglePin={() => onTogglePin(note.id)}
                  />
                ))}
              </>
            )}

            {unpinnedNotes.length > 0 && (
              <>
                {hasSections && <SectionLabel text="Notes" />}
                {unpinnedNotes.map((note) => (
                  <NoteRow
                    key={note.id}
                    note={note}
                    labels={labels}
                    isOpen={note.id === openNoteId}
                    onClick={() => onOpenNote(note)}
                    onDelete={() => onDeleteNote(note.id)}
                    onToggleFavorite={() => onToggleFavorite(note.id)}
                    onToggleArchive={() => onToggleArchive(note.id)}
                    onTogglePin={() => onTogglePin(note.id)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
