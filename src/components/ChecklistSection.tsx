"use client";

import React, { useState, useRef } from "react";
import { ButtonIcon, Icon } from "@applicator/sdk/components";
import { Checklist } from "../types/Checklist";
import { ChecklistItem } from "../types/ChecklistItem";

interface Props {
  list: Checklist;
  onChange: (list: Checklist) => void;
  onDelete: () => void;
}

export default function ChecklistSection({ list, onChange, onDelete }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const dragItemId = useRef<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const todoItems = list.items
    .filter((i) => !i.completed)
    .sort((a, b) => a.order - b.order);
  const completedItems = list.items.filter((i) => i.completed);

  const updateItems = (items: ChecklistItem[]) => {
    onChange({ ...list, items });
  };

  const handleAddItem = () => {
    const maxOrder = todoItems.length > 0 ? Math.max(...todoItems.map((i) => i.order)) + 1 : 0;
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: "",
      completed: false,
      order: maxOrder,
    };
    updateItems([...list.items, newItem]);
  };

  const handleToggle = (itemId: string) => {
    const updated = list.items.map((i) =>
      i.id === itemId ? { ...i, completed: !i.completed } : i
    );
    updateItems(updated);
  };

  const handleTextChange = (itemId: string, text: string) => {
    const updated = list.items.map((i) => (i.id === itemId ? { ...i, text } : i));
    onChange({ ...list, items: updated });
  };

  const handleTextBlur = () => {
    onChange(list);
  };

  const handleDeleteItem = (itemId: string) => {
    updateItems(list.items.filter((i) => i.id !== itemId));
  };

  // HTML5 drag-and-drop for todo items
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    dragItemId.current = itemId;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(itemId);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    const sourceId = dragItemId.current;
    if (!sourceId || sourceId === targetId) return;

    const reordered = [...todoItems];
    const sourceIdx = reordered.findIndex((i) => i.id === sourceId);
    const targetIdx = reordered.findIndex((i) => i.id === targetId);
    if (sourceIdx < 0 || targetIdx < 0) return;

    const [removed] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, removed);

    const updatedTodo = reordered.map((item, idx) => ({ ...item, order: idx }));
    updateItems([...completedItems, ...updatedTodo]);
    dragItemId.current = null;
  };

  const handleDragEnd = () => {
    setDragOverId(null);
    dragItemId.current = null;
  };

  return (
    <div
      style={{
        marginBottom: 12,
        backgroundColor: "#1e293b",
        borderRadius: 6,
        border: "1px solid #334155",
        overflow: "hidden",
      }}
    >
      {/* List header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 10px",
          borderBottom: expanded ? "1px solid #334155" : "none",
        }}
      >
        <span
          onClick={() => setExpanded(!expanded)}
          style={{ cursor: "pointer", color: "#64748b", flexShrink: 0, fontSize: 10 }}
        >
          <Icon name={expanded ? "chevron-down" : "chevron-right"} size={14} />
        </span>

        {editingName ? (
          <input
            ref={nameInputRef}
            value={list.name}
            onChange={(e) => onChange({ ...list, name: e.target.value })}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") nameInputRef.current?.blur();
            }}
            style={{
              flex: 1,
              background: "#0f172a",
              border: "1px solid #3b82f6",
              borderRadius: 4,
              padding: "2px 6px",
              color: "#f1f5f9",
              fontSize: 13,
              fontWeight: 600,
              outline: "none",
            }}
            autoFocus
          />
        ) : (
          <span
            onClick={() => setEditingName(true)}
            style={{
              flex: 1,
              fontSize: 13,
              fontWeight: 600,
              color: "#cbd5e1",
              cursor: "text",
              userSelect: "none",
            }}
          >
            {list.name}
          </span>
        )}

        <ButtonIcon
          name="plus"
          label="New item"
          onClick={handleAddItem}
          size="sm"
          iconSize={12}
          placement="left"
        />
        {todoItems.length > 0 && (
          <ButtonIcon
            name="check"
            label="Check all items"
            onClick={() => updateItems(list.items.map((i) => ({ ...i, completed: true })))}
            size="sm"
            iconSize={11}
            placement="left"
          />
        )}
        {completedItems.length > 0 && (
          <ButtonIcon
            name="close"
            label="Uncheck all items"
            onClick={() => updateItems(list.items.map((i) => ({ ...i, completed: false })))}
            size="sm"
            iconSize={11}
            placement="left"
          />
        )}
        <ButtonIcon
          name="trash"
          label="Delete list"
          onClick={onDelete}
          size="sm"
          iconSize={12}
          subvariant="danger"
          placement="left"
        />
      </div>

      {/* Items body */}
      {expanded && (
        <div style={{ padding: "4px 0" }}>
          {todoItems.length === 0 && (
            <div
              style={{
                padding: "6px 12px 8px",
                fontSize: 12,
                color: "#475569",
                fontStyle: "italic",
              }}
            >
              No items yet — click + to add one
            </div>
          )}

          {/* Todo items (draggable) */}
          {todoItems.map((item) => (
            <div
              key={item.id}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 6,
                padding: "3px 10px",
                borderTop:
                  dragOverId === item.id ? "2px solid #3b82f6" : "2px solid transparent",
                backgroundColor:
                  dragOverId === item.id ? "rgba(59,130,246,0.07)" : "transparent",
                transition: "background-color 0.1s",
              }}
            >
              <span
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                style={{
                  cursor: "grab",
                  color: "#334155",
                  flexShrink: 0,
                  paddingTop: 4,
                  lineHeight: 1,
                }}
              >
                <Icon name="drag" size={14} />
              </span>
              <input
                type="checkbox"
                checked={false}
                onChange={() => handleToggle(item.id)}
                style={{ flexShrink: 0, cursor: "pointer", marginTop: 4 }}
              />
              <textarea
                ref={(el) => {
                  if (el && el.dataset.text !== item.text) {
                    el.dataset.text = item.text;
                    el.style.height = "auto";
                    el.style.height = `${el.scrollHeight}px`;
                  }
                }}
                value={item.text}
                onChange={(e) => {
                  handleTextChange(item.id, e.target.value);
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
                onBlur={handleTextBlur}
                placeholder="Add item..."
                rows={1}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#f1f5f9",
                  fontSize: 13,
                  padding: 0,
                  minWidth: 0,
                  resize: "none",
                  overflow: "hidden",
                  lineHeight: "1.4",
                  fontFamily: "inherit",
                  wordBreak: "break-word",
                }}
              />
              <span
                style={{
                  flexShrink: 0,
                  visibility: hoveredItemId === item.id ? "visible" : "hidden",
                  opacity: hoveredItemId === item.id ? 1 : 0,
                }}
              >
                <ButtonIcon
                  name="trash"
                  label="Delete item"
                  onClick={() => handleDeleteItem(item.id)}
                  size="sm"
                  iconSize={11}
                  subvariant="danger"
                  placement="left"
                />
              </span>
            </div>
          ))}

          {/* Completed section */}
          {completedItems.length > 0 && (
            <div style={{ borderTop: "1px solid #334155", marginTop: 4, paddingTop: 2 }}>
              <div
                onClick={() => setCompletedExpanded(!completedExpanded)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 10px",
                  cursor: "pointer",
                  fontSize: 11,
                  color: "#64748b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  userSelect: "none",
                }}
              >
                <Icon name={completedExpanded ? "chevron-down" : "chevron-right"} size={12} />
                Completed ({completedItems.length})
              </div>

              {completedExpanded &&
                completedItems.map((item) => (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                      padding: "3px 10px 3px 30px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => handleToggle(item.id)}
                      style={{ flexShrink: 0, cursor: "pointer", marginTop: 4 }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13,
                        color: "#475569",
                        textDecoration: "line-through",
                        wordBreak: "break-word",
                        padding: "2px 0",
                      }}
                    >
                      {item.text || <em>Empty item</em>}
                    </span>
                    <span
                      style={{
                        flexShrink: 0,
                        visibility: hoveredItemId === item.id ? "visible" : "hidden",
                        opacity: hoveredItemId === item.id ? 1 : 0,
                      }}
                    >
                      <ButtonIcon
                        name="trash"
                        label="Delete item"
                        onClick={() => handleDeleteItem(item.id)}
                        size="sm"
                        iconSize={11}
                        subvariant="danger"
                        placement="left"
                      />
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
