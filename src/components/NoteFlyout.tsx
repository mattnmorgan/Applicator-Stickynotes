"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { ButtonIcon, SearchableCombobox, RichTextEditor } from "@applicator/sdk/components";
import { Note } from "../types/Note";
import { Label } from "../types/Label";
import { Checklist } from "../types/Checklist";
import ChecklistSection from "./ChecklistSection";

interface Props {
  note: Note;
  labels: Label[];
  onClose: () => void;
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (noteId: string) => void;
  onDuplicate: (note: Note) => void;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NoteFlyout({ note, labels, onClose, onUpdate, onDelete, onToggleFavorite, onDuplicate }: Props) {
  const [localNote, setLocalNote] = useState<Note>(note);
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync when a different note is selected
  useEffect(() => {
    setLocalNote(note);
    setEditingName(false);
  }, [note.id]);

  // Sync dates when server responds (updatedAt changes)
  useEffect(() => {
    setLocalNote((prev) => ({
      ...prev,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));
  }, [note.updatedAt]);

  // Sync isFavorite from optimistic updates in parent
  useEffect(() => {
    setLocalNote((prev) => ({ ...prev, isFavorite: note.isFavorite }));
  }, [note.isFavorite]);

  const save = useCallback(
    (updated: Note) => {
      onUpdate(updated);
    },
    [onUpdate]
  );

  const handleNameBlur = useCallback(() => {
    setEditingName(false);
    const name = localNote.name.trim() || "New Note";
    const updated = { ...localNote, name };
    setLocalNote(updated);
    save(updated);
  }, [localNote, save]);

  const handleContentBlur = useCallback(() => {
    save(localNote);
  }, [localNote, save]);

  const handleAddList = useCallback(() => {
    const newList: Checklist = {
      id: crypto.randomUUID(),
      name: "New list",
      items: [],
    };
    const updated = { ...localNote, lists: [...localNote.lists, newList] };
    setLocalNote(updated);
    save(updated);
  }, [localNote, save]);

  const handleUpdateList = useCallback(
    (updatedList: Checklist) => {
      const updated = {
        ...localNote,
        lists: localNote.lists.map((l) => (l.id === updatedList.id ? updatedList : l)),
      };
      setLocalNote(updated);
      save(updated);
    },
    [localNote, save]
  );

  const handleDeleteList = useCallback(
    (listId: string) => {
      const updated = { ...localNote, lists: localNote.lists.filter((l) => l.id !== listId) };
      setLocalNote(updated);
      save(updated);
    },
    [localNote, save]
  );

  const handleLabelChange = useCallback(
    (selected: Label[]) => {
      const updated = { ...localNote, labelIds: selected.map((l) => l.id) };
      setLocalNote(updated);
      save(updated);
    },
    [localNote, save]
  );

  const handleDelete = useCallback(() => {
    onClose();
    onDelete(note.id);
  }, [note.id, onClose, onDelete]);

  const selectedLabels = labels.filter((l) => localNote.labelIds.includes(l.id));

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
          zIndex: 100,
        }}
      />

      {/* Flyout panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          backgroundColor: "#0f172a",
          borderLeft: "1px solid #1e293b",
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
          animation: "stickiesFlyoutIn 0.2s ease-out",
        }}
      >
        <style>{`
          @keyframes stickiesFlyoutIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 12px",
            borderBottom: "1px solid #1e293b",
            flexShrink: 0,
          }}
        >
          <ButtonIcon
            name="close"
            label="Close"
            onClick={onClose}
            size="sm"
            placement="right"
          />

          {/* Editable note title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {editingName ? (
              <input
                ref={nameInputRef}
                value={localNote.name}
                onChange={(e) =>
                  setLocalNote((prev) => ({ ...prev, name: e.target.value }))
                }
                onBlur={handleNameBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") nameInputRef.current?.blur();
                  if (e.key === "Escape") {
                    setEditingName(false);
                    setLocalNote((prev) => ({ ...prev, name: note.name }));
                  }
                }}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "#1e293b",
                  border: "1px solid #3b82f6",
                  borderRadius: 4,
                  padding: "4px 8px",
                  color: "#f1f5f9",
                  fontSize: 15,
                  fontWeight: 600,
                  outline: "none",
                }}
                autoFocus
              />
            ) : (
              <div
                onClick={() => setEditingName(true)}
                title="Click to edit title"
                style={{
                  cursor: "text",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#f1f5f9",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  padding: "4px 6px",
                  borderRadius: 4,
                  border: "1px solid transparent",
                  transition: "border-color 0.1s",
                }}
              >
                {localNote.name}
              </div>
            )}
          </div>

          <ButtonIcon
            name="list-view"
            label="Add list"
            onClick={handleAddList}
            size="sm"
            placement="bottom"
          />
          <ButtonIcon
            name="star"
            label={localNote.isFavorite ? "Unfavorite" : "Favorite"}
            onClick={() => onToggleFavorite(note.id)}
            size="sm"
            subvariant="warning"
            active={localNote.isFavorite}
            placement="bottom"
          />
          <ButtonIcon
            name="copy"
            label="Duplicate"
            onClick={() => onDuplicate(localNote)}
            size="sm"
            placement="bottom"
          />
          <ButtonIcon
            name="trash"
            label="Delete note"
            onClick={handleDelete}
            size="sm"
            subvariant="danger"
            placement="bottom"
          />
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {/* Label selector */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 6,
              }}
            >
              Labels
            </div>
            <SearchableCombobox<Label>
              items={labels}
              selectedItems={selectedLabels}
              onSelectionChange={handleLabelChange}
              getItemKey={(l) => l.id}
              filterItem={(l, term) =>
                l.name.toLowerCase().includes(term.toLowerCase())
              }
              renderItem={(l) => (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 13,
                  }}
                >
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      backgroundColor: l.color,
                      flexShrink: 0,
                    }}
                  />
                  {l.name}
                </span>
              )}
              multiSelect
              placeholder="Add labels..."
            />
          </div>

          {/* Rich text notes */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 6,
              }}
            >
              Notes
            </div>
            <div onBlur={handleContentBlur}>
              <RichTextEditor
                value={localNote.content}
                onChange={(content) =>
                  setLocalNote((prev) => ({ ...prev, content }))
                }
                placeholder="Write something..."
                minHeight={120}
              />
            </div>
          </div>

          {/* Checklists */}
          {localNote.lists.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Lists
              </div>
              {localNote.lists.map((list) => (
                <ChecklistSection
                  key={list.id}
                  list={list}
                  onChange={handleUpdateList}
                  onDelete={() => handleDeleteList(list.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sticky footer — dates */}
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid #1e293b",
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 16px",
            fontSize: 11,
            color: "#475569",
            flexShrink: 0,
          }}
        >
          <span>Created {formatDate(localNote.createdAt)}</span>
          <span>Modified {formatDate(localNote.updatedAt)}</span>
        </div>
      </div>
    </>
  );
}
