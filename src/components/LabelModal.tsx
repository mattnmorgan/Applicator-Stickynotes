"use client";

import React, { useState } from "react";
import { Modal, Button } from "@applicator/sdk/components";
import { Label } from "../types/Label";

interface Props {
  editingLabel: Label | null;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
  onUpdate: (id: string, name: string, color: string) => void;
}

const PRESET_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#64748b",
];

export default function LabelModal({ editingLabel, onClose, onCreate, onUpdate }: Props) {
  const [name, setName] = useState(editingLabel?.name ?? "");
  const [color, setColor] = useState(editingLabel?.color ?? PRESET_COLORS[0]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editingLabel) {
      onUpdate(editingLabel.id, name.trim(), color);
    } else {
      onCreate(name.trim(), color);
    }
  };

  return (
    <Modal
      header={
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>
          {editingLabel ? "Edit Label" : "Create Label"}
        </h3>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!name.trim()}>
            {editingLabel ? "Save" : "Create"}
          </Button>
        </>
      }
      closeable
      onClose={onClose}
      maxWidth={400}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "12px 16px" }}>
        {/* Name field */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            placeholder="Label name"
            autoFocus
            style={{
              width: "100%",
              boxSizing: "border-box",
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 6,
              padding: "8px 12px",
              color: "#f1f5f9",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        {/* Color field */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Color
          </label>
          {/* Preset swatches */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {PRESET_COLORS.map((c) => (
              <div
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: c,
                  cursor: "pointer",
                  border: color === c ? "2px solid #f1f5f9" : "2px solid transparent",
                  outline: color === c ? `2px solid ${c}` : "none",
                  outlineOffset: 2,
                  boxSizing: "border-box",
                  transition: "outline 0.1s",
                }}
              />
            ))}
          </div>
          {/* Custom color picker */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: 36,
                height: 36,
                padding: 2,
                cursor: "pointer",
                borderRadius: 4,
                border: "1px solid #334155",
                backgroundColor: "#0f172a",
              }}
            />
            <span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
              {color}
            </span>
            <span
              style={{
                display: "inline-block",
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
