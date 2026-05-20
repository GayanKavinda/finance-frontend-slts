"use client";

import React from "react";
import "@/components/dotmatrix-loader.css";
import { useDotMatrixPhases, usePrefersReducedMotion } from "@/components/ui/dotmatrix-hooks";

export const MATRIX_SIZE = 5;
const CENTER = Math.floor(MATRIX_SIZE / 2);
const RANGE = Array.from({ length: MATRIX_SIZE }, (_, index) => index);

export function rowMajorIndex(row, col) {
  return row * MATRIX_SIZE + col;
}

export function indexToCoord(index) {
  return {
    row: Math.floor(index / MATRIX_SIZE),
    col: index % MATRIX_SIZE
  };
}

export function distanceFromCenter(index) {
  const { row, col } = indexToCoord(index);
  return Math.hypot(row - CENTER, col - CENTER);
}

export function polarAngle(index) {
  const { row, col } = indexToCoord(index);
  return Math.atan2(row - CENTER, col - CENTER);
}

export function normalizedRadius(index) {
  const { row, col } = indexToCoord(index);
  return Math.hypot(row - CENTER, col - CENTER) / Math.hypot(CENTER, CENTER);
}

export function manhattanDistance(index) {
  const { row, col } = indexToCoord(index);
  return Math.abs(row - CENTER) + Math.abs(col - CENTER);
}

export function cx(...values) {
  return values.filter(Boolean).join(" ");
}

const FULL_INDEXES = Array.from({ length: MATRIX_SIZE * MATRIX_SIZE }, (_, i) => i);

export function getPatternIndexes(pattern = "full") {
  if (pattern === "full") return FULL_INDEXES;
  return FULL_INDEXES; // Default to full for now as DotmSquare12 handles its own math
}

export function DotMatrixBase({
  size = 24,
  dotSize = 3,
  color = "currentColor",
  speed = 1,
  ariaLabel = "Loading",
  className,
  pattern = "full",
  dotShape = "circle",
  muted = false,
  bloom = false,
  halo = 0,
  dotClassName,
  phase,
  reducedMotion = false,
  onMouseEnter,
  onMouseLeave,
  animationResolver,
  cellPadding
}) {
  const patternIndexes = new Set(getPatternIndexes(pattern));
  const safeSpeed = speed > 0 ? speed : 1;
  const speedScale = 1 / safeSpeed;
  
  const g = cellPadding ?? Math.max(1, Math.floor((size - dotSize * MATRIX_SIZE) / (MATRIX_SIZE - 1)));
  const matrixSpan = size;

  const unit = dotSize + g;

  const dmxVarStyle = {
    width: matrixSpan,
    height: matrixSpan,
    "--dmx-speed": speedScale,
    "--dmx-dot-size": `${dotSize}px`,
    "--dmx-halo-level": halo,
    "--dmx-dot-fill": color,
    color: color
  };

  const dots = Array.from({ length: MATRIX_SIZE * MATRIX_SIZE }).map((_, index) => {
    const { row, col } = indexToCoord(index);
    const isActive = patternIndexes.has(index);
    const distance = distanceFromCenter(index);
    const angle = polarAngle(index);
    const radiusNormalizedValue = normalizedRadius(index);
    const manhattan = manhattanDistance(index);
    const deltaX = (col - CENTER) * unit;
    const deltaY = (row - CENTER) * unit;

    const animationState = animationResolver
      ? animationResolver({
        index,
        row,
        col,
        distanceFromCenter: distance,
        angleFromCenter: angle,
        radiusNormalized: radiusNormalizedValue,
        manhattanDistance: manhattan,
        phase,
        isActive,
        reducedMotion
      })
      : {};

    const dotStyle = {
      width: dotSize,
      height: dotSize,
      "--dmx-distance": distance,
      "--dmx-row": row,
      "--dmx-col": col,
      "--dmx-x": `${deltaX}px`,
      "--dmx-y": `${deltaY}px`,
      "--dmx-angle": angle,
      "--dmx-radius": radiusNormalizedValue,
      "--dmx-manhattan": manhattan,
      ...animationState.style
    };

    return (
      <span
        key={index}
        aria-hidden="true"
        className={cx(
          "dmx-dot",
          dotClassName,
          animationState.className
        )}
        style={dotStyle}
      />
    );
  });

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={cx(
        "dmx-root",
        `dmx-dot-shape-${dotShape}`,
        muted && "dmx-muted",
        bloom && "dmx-bloom",
        className
      )}
      style={dmxVarStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="dmx-grid" style={{ gap: g }}>{dots}</div>
    </div>
  );
}
