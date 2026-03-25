"use client";

import React, { useState } from "react";
import { ButtonIcon, Icon, Tooltip } from "@applicator/sdk/components";
import { Label } from "../types/Label";

interface Props {
  labels: Label[];
  selectedLabelId: string | null;
  showFavorites: boolean;
  onSelectLabel: (id: string) => void;
  onSelectAll: () => void;
  onShowFavorites: () => void;
  onCreateLabel: () => void;
  onEditLabel: (label: Label) => void;
  onDeleteLabel: (label: Label) => void;
}

export default function LeftNav({
  labels,
  selectedLabelId,
  showFavorites,
  onSelectLabel,
  onSelectAll,
  onShowFavorites,
  onCreateLabel,
  onEditLabel,
  onDeleteLabel,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredLabelId, setHoveredLabelId] = useState<string | null>(null);
  const [hoveredNav, setHoveredNav] = useState<"all" | "favorites" | null>(null);
  const [hoveredCollapsed, setHoveredCollapsed] = useState<"expand" | "all" | "favorites" | null>(null);

  const allNotesActive = !showFavorites && selectedLabelId === null;

  if (collapsed) {
    return (
      <div
        style={{
          width: 40,
          flexShrink: 0,
          backgroundColor: "#080f1c",
          borderRight: "1px solid #1e293b",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 8,
          gap: 4,
          overflow: "hidden",
        }}
      >
        {/* Expand button */}
        <Tooltip text="Expand panel" placement="right">
          <span
            onClick={() => setCollapsed(false)}
            onMouseEnter={() => setHoveredCollapsed("expand")}
            onMouseLeave={() => setHoveredCollapsed(null)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 5,
              cursor: "pointer",
              color: hoveredCollapsed === "expand" ? "#94a3b8" : "#475569",
              backgroundColor: hoveredCollapsed === "expand" ? "rgba(30,41,59,0.7)" : "transparent",
              transition: "background-color 0.1s, color 0.1s",
            }}
          >
            <Icon name="chevron-right" size={16} />
          </span>
        </Tooltip>

        {/* All Notes icon */}
        <Tooltip text="All Notes" placement="right">
          <span
            onClick={onSelectAll}
            onMouseEnter={() => setHoveredCollapsed("all")}
            onMouseLeave={() => setHoveredCollapsed(null)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 5,
              cursor: "pointer",
              color: allNotesActive ? "#3b82f6" : hoveredCollapsed === "all" ? "#94a3b8" : "#475569",
              backgroundColor: allNotesActive
                ? "rgba(59,130,246,0.15)"
                : hoveredCollapsed === "all"
                ? "rgba(30,41,59,0.7)"
                : "transparent",
              transition: "background-color 0.1s, color 0.1s",
            }}
          >
            <Icon name="sticky-note" size={16} />
          </span>
        </Tooltip>

        {/* Favorites icon */}
        <Tooltip text="Favorites" placement="right">
          <span
            onClick={onShowFavorites}
            onMouseEnter={() => setHoveredCollapsed("favorites")}
            onMouseLeave={() => setHoveredCollapsed(null)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 5,
              cursor: "pointer",
              color: showFavorites ? "#eab308" : hoveredCollapsed === "favorites" ? "#94a3b8" : "#475569",
              backgroundColor: showFavorites
                ? "rgba(234,179,8,0.12)"
                : hoveredCollapsed === "favorites"
                ? "rgba(30,41,59,0.7)"
                : "transparent",
              transition: "background-color 0.1s, color 0.1s",
            }}
          >
            <Icon name="star" size={16} />
          </span>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        backgroundColor: "#080f1c",
        borderRight: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Top bar with collapse button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "6px 8px 0",
        }}
      >
        <Tooltip text="Collapse panel" placement="right">
          <span style={{ display: "flex" }}>
            <ButtonIcon
              name="chevron-left"
              label="Collapse panel"
              onClick={() => setCollapsed(true)}
              size="sm"
              iconSize={13}
              placement="right"
            />
          </span>
        </Tooltip>
      </div>

      {/* All Notes */}
      <div
        onClick={onSelectAll}
        onMouseEnter={() => setHoveredNav("all")}
        onMouseLeave={() => setHoveredNav(null)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
          margin: "4px 8px 0",
          borderRadius: 6,
          cursor: "pointer",
          color: allNotesActive ? "#f8fafc" : "#94a3b8",
          fontWeight: allNotesActive ? 600 : 500,
          fontSize: 14,
          backgroundColor: allNotesActive
            ? "rgba(59,130,246,0.15)"
            : hoveredNav === "all"
            ? "rgba(30,41,59,0.7)"
            : "transparent",
          userSelect: "none",
          transition: "background-color 0.1s",
        }}
      >
        <span
          style={{
            color: allNotesActive ? "#3b82f6" : "#475569",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Icon name="sticky-note" size={16} />
        </span>
        All Notes
      </div>

      {/* Favorites */}
      <div
        onClick={onShowFavorites}
        onMouseEnter={() => setHoveredNav("favorites")}
        onMouseLeave={() => setHoveredNav(null)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
          margin: "4px 8px 0",
          borderRadius: 6,
          cursor: "pointer",
          color: showFavorites ? "#f8fafc" : "#94a3b8",
          fontWeight: showFavorites ? 600 : 500,
          fontSize: 14,
          backgroundColor: showFavorites
            ? "rgba(234,179,8,0.12)"
            : hoveredNav === "favorites"
            ? "rgba(30,41,59,0.7)"
            : "transparent",
          userSelect: "none",
          transition: "background-color 0.1s",
        }}
      >
        <span style={{ color: showFavorites ? "#eab308" : "#475569", flexShrink: 0, display: "flex", alignItems: "center" }}>
          <Icon name="star" size={16} />
        </span>
        Favorites
      </div>

      {/* LABELS section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 14px 6px",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#475569",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Labels
        </span>
        <ButtonIcon
          name="plus"
          label="Create label"
          onClick={onCreateLabel}
          size="sm"
          iconSize={13}
          placement="right"
        />
      </div>

      {/* Label list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "2px 8px 8px" }}>
        {labels.length === 0 && (
          <div
            style={{
              padding: "4px 8px",
              fontSize: 12,
              color: "#334155",
              fontStyle: "italic",
            }}
          >
            No labels yet
          </div>
        )}

        {labels.map((label) => {
          const isSelected = !showFavorites && selectedLabelId === label.id;
          const isHovered = hoveredLabelId === label.id;
          return (
            <div
              key={label.id}
              onClick={() => onSelectLabel(label.id)}
              onMouseEnter={() => setHoveredLabelId(label.id)}
              onMouseLeave={() => setHoveredLabelId(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                borderRadius: 5,
                cursor: "pointer",
                backgroundColor: isSelected
                  ? "rgba(59,130,246,0.15)"
                  : isHovered
                  ? "rgba(30,41,59,0.7)"
                  : "transparent",
                color: isSelected ? "#f8fafc" : "#94a3b8",
                fontSize: 13,
                userSelect: "none",
                transition: "background-color 0.1s",
              }}
            >
              {/* Color dot */}
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: label.color,
                  flexShrink: 0,
                }}
              />

              {/* Label name */}
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {label.name}
              </span>

              {/* Edit + Delete buttons — shown on hover */}
              {isHovered && (
                <>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditLabel(label);
                    }}
                  >
                    <ButtonIcon
                      name="edit"
                      label="Edit label"
                      onClick={() => onEditLabel(label)}
                      size="sm"
                      iconSize={12}
                      placement="right"
                    />
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLabel(label);
                    }}
                  >
                    <ButtonIcon
                      name="trash"
                      label="Delete label"
                      onClick={() => onDeleteLabel(label)}
                      size="sm"
                      iconSize={12}
                      subvariant="danger"
                      placement="right"
                    />
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
