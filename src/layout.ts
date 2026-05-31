import { nodes, regions } from "./data";
import type { LegendNode } from "./types";

export const CANVAS_WIDTH = 2100;
export const CANVAS_HEIGHT = 910;
export const LABEL_WIDTH = 170;

const timeStart = -500;
const timeEnd = 2050;
const plotStart = 240;
const plotWidth = 1780;

export const timelineTicks = [
  { year: -500, label: "公元前 500" },
  { year: 0, label: "公元 1" },
  { year: 500, label: "500" },
  { year: 1000, label: "1000" },
  { year: 1500, label: "1500" },
  { year: 1800, label: "1800" },
  { year: 1900, label: "1900" },
  { year: 2000, label: "2000" },
  { year: 2050, label: "2050" },
];

export function yearToX(year: number) {
  return plotStart + ((year - timeStart) / (timeEnd - timeStart)) * plotWidth;
}

export function nodeToPoint(node: LegendNode) {
  const region = regions.find((item) => item.id === node.region);
  if (!region) {
    throw new Error(`Unknown region: ${node.region}`);
  }

  return {
    x: yearToX(node.year),
    y: region.y + 64 + node.row * 48,
  };
}

export const nodeById = new Map(nodes.map((node) => [node.id, node]));
