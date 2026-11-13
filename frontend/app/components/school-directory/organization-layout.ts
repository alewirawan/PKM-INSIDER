import type { SchoolLeader } from "../../school-directory-data";

export const cardWidth = 260;
export const cardHeight = 112;
const gapX = 40;
const gapY = 56;
export type PositionedLeader = { person: SchoolLeader; x: number; y: number };

export function layoutOrganization(leaders: SchoolLeader[]) {
  const ids = new Set(leaders.map((p) => p.id));
  const roots = leaders.filter((p) => !p.parentId || !ids.has(p.parentId));
  const children = (id: string) => leaders.filter((p) => p.parentId === id);
  const sizes = new Map<string, number>();
  function measure(
    person: SchoolLeader,
    path = new Set<string>(),
    depth = 0,
  ): number {
    if (path.has(person.id)) return 1;
    const next = new Set([...path, person.id]);
    const reports = children(person.id).filter((p) => !p.coordination);
    const peers = children(person.id).filter((p) => p.coordination);
    const stacked = depth >= 3 && reports.every((p) => !children(p.id).length);
    const reportWidth = Math.max(
      1,
      stacked
        ? 1
        : reports.reduce((n, p) => n + measure(p, next, depth + 1), 0),
    );
    const peerWidth = peers.reduce((n, p) => n + measure(p, next, depth), 0);
    const size = peers.every((p) => !children(p.id).length)
      ? Math.max(reportWidth, reportWidth / 2 + 0.5 + peerWidth)
      : reportWidth + peerWidth;
    sizes.set(person.id, size);
    return size;
  }
  roots.forEach((root) => measure(root));
  const nodes: PositionedLeader[] = [];
  const visited = new Set<string>();
  function place(person: SchoolLeader, start: number, depth: number) {
    if (visited.has(person.id)) return;
    visited.add(person.id);
    const reports = children(person.id).filter((p) => !p.coordination);
    const peers = children(person.id).filter((p) => p.coordination);
    const stacked = depth >= 3 && reports.every((p) => !children(p.id).length);
    const reportWidth = Math.max(
      1,
      stacked ? 1 : reports.reduce((n, p) => n + (sizes.get(p.id) ?? 1), 0),
    );
    nodes.push({
      person,
      x: (start + reportWidth / 2) * (cardWidth + gapX),
      y: depth * (cardHeight + gapY) + cardHeight / 2 + 32,
    });
    let offset = start;
    reports.forEach((p, index) => {
      place(p, offset, depth + 1 + (stacked ? index : 0));
      if (!stacked) offset += sizes.get(p.id) ?? 1;
    });
    offset = peers.every((p) => !children(p.id).length)
      ? start + reportWidth / 2 + 0.5
      : start + reportWidth;
    peers.forEach((p) => {
      place(p, offset, depth);
      offset += sizes.get(p.id) ?? 1;
    });
  }
  let offset = 0;
  roots.forEach((root) => {
    place(root, offset, 0);
    offset += sizes.get(root.id) ?? 1;
  });
  // Keep malformed legacy records reachable without recursing through cycles.
  leaders
    .filter((p) => !visited.has(p.id))
    .forEach((p) => {
      place(p, offset++, 0);
    });
  return {
    nodes,
    width: Math.max(1, offset) * (cardWidth + gapX),
    height: Math.max(0, ...nodes.map((p) => p.y)) + cardHeight / 2 + 32,
  };
}
