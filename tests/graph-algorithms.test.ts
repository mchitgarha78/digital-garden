import test from "node:test";
import assert from "node:assert/strict";
import { findShortestPath } from "../src/lib/graph-algorithms";

type TestNode = { id: string; slug: string; title: string };
const makeNodes = (count: number): TestNode[] =>
  Array.from({ length: count }, (_, index) => ({ id: String(index), slug: `n${index}`, title: `Note ${index}` }));
const edge = (sourceId: string, targetId: string) => ({ sourceId, targetId });

test("finds a shortest path instead of a longer available route", () => {
  const result = findShortestPath(makeNodes(5), [
    edge("0", "1"), edge("1", "2"), edge("2", "4"), edge("0", "3"), edge("3", "4"),
  ], "n0", "n4");
  assert.deepEqual(result?.path.map((node) => node.id), ["0", "3", "4"]);
  assert.equal(result?.distance, 2);
});
test("treats note links as traversable in both directions", () => {
  const result = findShortestPath(makeNodes(2), [edge("1", "0")], "n0", "n1");
  assert.deepEqual(result?.path.map((node) => node.id), ["0", "1"]);
});
test("returns a zero-distance path when source equals target", () => {
  const nodes = makeNodes(1);
  assert.deepEqual(findShortestPath(nodes, [], "n0", "n0"), { path: [nodes[0]], distance: 0 });
});
test("returns null for missing source or target", () => {
  const nodes = makeNodes(2);
  assert.equal(findShortestPath(nodes, [], "missing", "n1"), null);
  assert.equal(findShortestPath(nodes, [], "n0", "missing"), null);
});
test("returns null for disconnected notes", () => {
  assert.equal(findShortestPath(makeNodes(3), [edge("0", "1")], "n0", "n2"), null);
});
test("cycles do not cause infinite traversal or repeated path nodes", () => {
  const result = findShortestPath(makeNodes(4), [
    edge("0", "1"), edge("1", "2"), edge("2", "0"), edge("2", "3"),
  ], "n0", "n3");
  assert.deepEqual(result?.path.map((node) => node.id), ["0", "2", "3"]);
  assert.equal(new Set(result?.path.map((node) => node.id)).size, result?.path.length);
});
test("finds paths longer than the former 15-edge CTE limit", () => {
  const nodes = makeNodes(22);
  const edges = nodes.slice(1).map((node, index) => edge(String(index), node.id));
  const result = findShortestPath(nodes, edges, "n0", "n21");
  assert.equal(result?.distance, 21);
  assert.equal(result?.path.length, 22);
});
test("ignores edges with endpoints outside the user's note set", () => {
  const result = findShortestPath(makeNodes(3), [edge("0", "outside"), edge("outside", "2")], "n0", "n2");
  assert.equal(result, null);
});
