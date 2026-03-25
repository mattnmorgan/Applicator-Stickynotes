"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { UiContext } from "@applicator/sdk/context";
import { ToastStack } from "@applicator/sdk/components";
import type { ToastItem } from "@applicator/sdk/components";
import { Note } from "../types/Note";
import { Label } from "../types/Label";
import LeftNav from "../components/LeftNav";
import NotesPanel from "../components/NotesPanel";
import NoteFlyout from "../components/NoteFlyout";
import LabelModal from "../components/LabelModal";

interface Props {
  context?: UiContext;
}

export default function Stickies({ context }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openNote, setOpenNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

  const addToast = useCallback((toast: ToastItem) => {
    setToasts((prev) => [...prev, toast]);
  }, []);

  const removeToast = useCallback((index: number) => {
    setToasts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Load notes and labels on mount
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
      // Sort notes newest first
      const sortedNotes = (notesData.notes || []).sort(
        (a: Note, b: Note) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      );
      setNotes(sortedNotes);
      setLabels(labelsData.labels || []);
    } catch {
      addToast({ message: "Failed to load data", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create a new note
  const handleCreateNote = useCallback(async () => {
    try {
      const res = await fetch("/api/stickies/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Note", content: "", labelIds: [], lists: [] }),
      });
      if (!res.ok) throw new Error();
      const note: Note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setOpenNote(note);
    } catch {
      addToast({ message: "Failed to create note", type: "error" });
    }
  }, [addToast]);

  // Save note updates, keep notes sorted newest-first
  const handleUpdateNote = useCallback(
    async (updatedNote: Note) => {
      try {
        const res = await fetch(`/api/stickies/notes/${updatedNote.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: updatedNote.name,
            content: updatedNote.content,
            labelIds: updatedNote.labelIds,
            lists: updatedNote.lists,
          }),
        });
        if (!res.ok) throw new Error();
        const saved: Note = await res.json();
        setNotes((prev) => {
          const updated = prev.map((n) => (n.id === saved.id ? saved : n));
          return updated.sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt).getTime() -
              new Date(a.updatedAt || a.createdAt).getTime()
          );
        });
        // Propagate server-confirmed dates back to the flyout
        setOpenNote((prev) =>
          prev?.id === saved.id ? { ...prev, updatedAt: saved.updatedAt, createdAt: saved.createdAt } : prev
        );
      } catch {
        addToast({ message: "Failed to save note", type: "error" });
      }
    },
    [addToast]
  );

  // Delete a note
  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      try {
        const res = await fetch(`/api/stickies/notes/${noteId}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        setOpenNote((prev) => (prev?.id === noteId ? null : prev));
      } catch {
        addToast({ message: "Failed to delete note", type: "error" });
      }
    },
    [addToast]
  );

  // Create a label
  const handleCreateLabel = useCallback(
    async (name: string, color: string) => {
      try {
        const res = await fetch("/api/stickies/labels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color }),
        });
        if (!res.ok) throw new Error();
        const label: Label = await res.json();
        setLabels((prev) =>
          [...prev, label].sort((a, b) => a.name.localeCompare(b.name))
        );
        setLabelModalOpen(false);
      } catch {
        addToast({ message: "Failed to create label", type: "error" });
      }
    },
    [addToast]
  );

  // Update a label
  const handleUpdateLabel = useCallback(
    async (id: string, name: string, color: string) => {
      try {
        const res = await fetch(`/api/stickies/labels/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color }),
        });
        if (!res.ok) throw new Error();
        const updated: Label = await res.json();
        setLabels((prev) =>
          prev.map((l) => (l.id === id ? updated : l)).sort((a, b) => a.name.localeCompare(b.name))
        );
        setEditingLabel(null);
        setLabelModalOpen(false);
      } catch {
        addToast({ message: "Failed to update label", type: "error" });
      }
    },
    [addToast]
  );

  // Delete a label
  const handleDeleteLabel = useCallback(
    async (label: Label) => {
      try {
        const res = await fetch(`/api/stickies/labels/${label.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        setLabels((prev) => prev.filter((l) => l.id !== label.id));
        if (selectedLabelId === label.id) setSelectedLabelId(null);
      } catch {
        addToast({ message: "Failed to delete label", type: "error" });
      }
    },
    [addToast, selectedLabelId]
  );

  // Toggle favorite — optimistic update
  const handleToggleFavorite = useCallback(
    async (noteId: string) => {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;
      const newValue = !note.isFavorite;
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, isFavorite: newValue } : n))
      );
      setOpenNote((prev) =>
        prev?.id === noteId ? { ...prev, isFavorite: newValue } : prev
      );
      try {
        const res = await fetch(`/api/stickies/notes/${noteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFavorite: newValue }),
        });
        if (!res.ok) throw new Error();
      } catch {
        // Revert on failure
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? { ...n, isFavorite: !newValue } : n))
        );
        setOpenNote((prev) =>
          prev?.id === noteId ? { ...prev, isFavorite: !newValue } : prev
        );
        addToast({ message: "Failed to update favorite", type: "error" });
      }
    },
    [notes, addToast]
  );

  // Open note from list — sync flyout if different note
  const handleOpenNote = useCallback((note: Note) => {
    setOpenNote(note);
  }, []);

  // Filtered + searched notes
  const filteredNotes = useMemo(() => {
    let result = notes;

    if (showFavorites) {
      result = result.filter((n) => n.isFavorite);
    } else if (selectedLabelId) {
      result = result.filter((n) => n.labelIds.includes(selectedLabelId));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((n) => {
        if (n.name.toLowerCase().includes(q)) return true;
        const noteLabels = labels.filter((l) => n.labelIds.includes(l.id));
        if (noteLabels.some((l) => l.name.toLowerCase().includes(q))) return true;
        const text = n.content
          .replace(/<[^>]+>/g, " ")
          .toLowerCase();
        if (text.includes(q)) return true;
        return false;
      });
    }

    return result.slice().sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );
  }, [notes, labels, selectedLabelId, searchQuery, showFavorites]);

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        backgroundColor: "#0f172a",
        color: "#f1f5f9",
        overflow: "hidden",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 14,
      }}
    >
      <LeftNav
        labels={labels}
        selectedLabelId={selectedLabelId}
        showFavorites={showFavorites}
        onSelectLabel={(id) => { setSelectedLabelId(id); setShowFavorites(false); }}
        onSelectAll={() => { setSelectedLabelId(null); setShowFavorites(false); }}
        onShowFavorites={() => { setSelectedLabelId(null); setShowFavorites(true); }}
        onCreateLabel={() => {
          setEditingLabel(null);
          setLabelModalOpen(true);
        }}
        onEditLabel={(label) => {
          setEditingLabel(label);
          setLabelModalOpen(true);
        }}
        onDeleteLabel={handleDeleteLabel}
      />

      <NotesPanel
        notes={filteredNotes}
        labels={labels}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateNote={handleCreateNote}
        onOpenNote={handleOpenNote}
        onDeleteNote={handleDeleteNote}
        onToggleFavorite={handleToggleFavorite}
        openNoteId={openNote?.id ?? null}
      />

      {openNote && (
        <NoteFlyout
          note={openNote}
          labels={labels}
          onClose={() => setOpenNote(null)}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {labelModalOpen && (
        <LabelModal
          editingLabel={editingLabel}
          onClose={() => {
            setLabelModalOpen(false);
            setEditingLabel(null);
          }}
          onCreate={handleCreateLabel}
          onUpdate={handleUpdateLabel}
        />
      )}

      <ToastStack toasts={toasts} onClose={removeToast} />
    </div>
  );
}
