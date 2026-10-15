import test from "node:test";
import assert from "node:assert/strict";
import { decodeSlug, extractWikiLinks, resolveLabelsToTargets, renderWikiLinks, slugify } from "../src/lib/links";

test("extracts wiki links, trims labels, and removes duplicates", () => {
  assert.deepEqual(extractWikiLinks("See [[ Alpha ]] and [[Beta]] then [[Alpha]] and [[]]."), ["Alpha", "Beta"]);
});
test("returns an empty list when content has no wiki links", () => {
  assert.deepEqual(extractWikiLinks("Plain text only"), []);
  assert.deepEqual(extractWikiLinks(""), []);
});
test("resolves labels case-insensitively by slug or title and excludes self-links", () => {
  const notes = [
    { id: "1", title: "Home Page", slug: "home-page" },
    { id: "2", title: "Research", slug: "research" },
    { id: "3", title: "Research Notes", slug: "research-notes" },
  ];
  assert.deepEqual(resolveLabelsToTargets(["HOME-PAGE", "research", "RESEARCH", "unknown"], notes, "1"), ["2"]);
});
test("slugifies Persian and Latin titles and removes repeated separators", () => {
  assert.equal(slugify("  Hello   World! "), "hello-world");
  assert.equal(slugify("یادداشت باغ"), "یادداشت-باغ");
  assert.match(slugify("!!!"), /^note-\d+$/);
});
test("decodeSlug leaves malformed percent sequences unchanged", () => {
  assert.equal(decodeSlug("hello%20world"), "hello world");
  assert.equal(decodeSlug("%E0%A4%A"), "%E0%A4%A");
});
test("renders wiki-link syntax into note anchors", () => {
  assert.equal(renderWikiLinks("Read [[home-page]]"), 'Read <a href="/notes/home-page" class="wiki-link">[[home-page]]</a>');
});
