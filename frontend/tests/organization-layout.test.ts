import assert from "node:assert/strict";
import { test } from "node:test";
import { seedSchoolDirectory } from "../app/school-directory-data";
import {
  layoutOrganization,
  cardHeight,
  cardWidth,
} from "../app/components/school-directory/organization-layout";

test("layout keeps all roles and coordination peers distinct after additions and removals", () => {
  const original = seedSchoolDirectory.leaders;
  const samples = [
    original,
    original.filter((p) => p.id !== "org-wakil"),
    [...original, { ...original[0], id: "new-unit", parentId: "org-kepala" }],
  ];
  for (const sample of samples) {
    const layout = layoutOrganization(sample);
    assert.equal(layout.nodes.length, sample.length);
    for (const a of layout.nodes) {
      assert.ok(
        a.x - cardWidth / 2 >= 0 && a.x + cardWidth / 2 <= layout.width,
      );
      assert.ok(
        a.y - cardHeight / 2 >= 0 && a.y + cardHeight / 2 <= layout.height,
      );
      for (const b of layout.nodes) {
        if (a === b) continue;
        assert.ok(
          Math.abs(a.x - b.x) >= cardWidth || Math.abs(a.y - b.y) >= cardHeight,
          `${a.person.id} overlaps ${b.person.id}`,
        );
      }
    }
  }
  const { nodes } = layoutOrganization(original);
  assert.equal(
    nodes.find((p) => p.person.id === "org-komite")?.y,
    nodes.find((p) => p.person.id === "org-kepala")?.y,
  );
});

test("empty and circular legacy charts do not recurse forever or hide records", () => {
  assert.deepEqual(layoutOrganization([]).nodes, []);
  const source = seedSchoolDirectory.leaders[0];
  const nodes = [
    { ...source, id: "a", parentId: "b" },
    { ...source, id: "b", parentId: "a" },
  ];
  assert.equal(layoutOrganization(nodes).nodes.length, 2);
});
