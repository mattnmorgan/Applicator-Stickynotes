"use client";

import React, { useState } from "react";
import { ButtonIcon, Icon, Tooltip } from "@applicator/sdk/components";
import { Note } from "../types/Note";
import { Label } from "../types/Label";

interface Props {
  note: Note;
  labels: Label[];
  isOpen: boolean;
  onClick: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
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

function getChecklistProgress(note: Note): { completed: number; total: number } | null {
  if (!note.lists || note.lists.length === 0) return null;
  let completed = 0;
  let total = 0;
  for (const list of note.lists) {
    for (const item of list.items) {
      total++;
      if (item.completed) completed++;
    }
  }
  if (total === 0) return null;
  return { completed, total };
}

export default function NoteRow({ note, labels, isOpen, onClick, onDelete, onToggleFavorite }: Props) {
  const [hovered, setHovered] = useState(false);

  const noteLabels = labels.filter((l) => note.labelIds.includes(l.id));
  const progress = getChecklistProgress(note);
  const contentPreview = stripHtml(note.content);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "10px 16px",
        borderBottom: "1px solid #1e293b",
        cursor: "pointer",
        backgroundColor: isOpen
          ? "rgba(59,130,246,0.1)"
          : hovered
          ? "rgba(30,41,59,0.6)"
          : "transparent",
        borderLeft: isOpen ? "2px solid #3b82f6" : "2px solid transparent",
        transition: "background-color 0.1s",
      }}
    >
      {/* Top row: name + labels + progress + delete */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: contentPreview ? 3 : 0 }}>
        <span
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: "#f1f5f9",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flexShrink: 0,
            maxWidth: "40%",
          }}
        >
          {note.name}
        </span>
        {noteLabels.length > 0 && (
          <div style={{ display: "flex", flexWrap: "nowrap", gap: 4, overflow: "hidden", flex: 1, minWidth: 0 }}>
            {noteLabels.slice(0, 3).map((label) => (
              <span
                key={label.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "1px 6px",
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 500,
                  backgroundColor: label.color + "26",
                  color: label.color,
                  border: `1px solid ${label.color}44`,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {label.name}
              </span>
            ))}
            {noteLabels.length > 3 && (
              <Tooltip
                text={noteLabels.slice(3).map((l) => l.name).join(", ")}
                placement="bottom"
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "1px 6px",
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 500,
                    backgroundColor: "rgba(100,116,139,0.15)",
                    color: "#64748b",
                    border: "1px solid rgba(100,116,139,0.3)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    cursor: "default",
                  }}
                >
                  +{noteLabels.length - 3}
                </span>
              </Tooltip>
            )}
          </div>
        )}
        <span style={{ flex: 1 }} />
        {progress && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 11,
              color: "#64748b",
              whiteSpace: "nowrap",
              flexShrink: 0,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <Icon name="list-view" size={11} />
            {progress.completed}/{progress.total}
          </span>
        )}
        {/* Trash — always mounted, visible on hover/open */}
        <span
          onClick={(e) => e.stopPropagation()}
          style={{
            flexShrink: 0,
            visibility: hovered || isOpen ? "visible" : "hidden",
            opacity: hovered || isOpen ? 1 : 0,
          }}
        >
          <ButtonIcon
            name="trash"
            label="Delete note"
            onClick={onDelete}
            size="sm"
            subvariant="danger"
            placement="left"
          />
        </span>
        {/* Star — always mounted; visible on hover/open or when favorited */}
        <span
          onClick={(e) => e.stopPropagation()}
          style={{
            flexShrink: 0,
            visibility: hovered || isOpen || note.isFavorite ? "visible" : "hidden",
            opacity: hovered || isOpen || note.isFavorite ? 1 : 0,
          }}
        >
          <ButtonIcon
            name="star"
            label={note.isFavorite ? "Unfavorite" : "Favorite"}
            onClick={onToggleFavorite}
            size="sm"
            subvariant="warning"
            active={note.isFavorite}
            placement="left"
          />
        </span>
      </div>


      {/* Content preview — 2 lines max */}
      {contentPreview && (
        <div
          style={{
            fontSize: 12,
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
