"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const check = process.argv.slice(2).includes("--check");
assert(process.argv.slice(2).every(arg => arg === "--check"), "Usage: node tools/build-variants.cjs [--check]");

const begin = "// BEGIN GENERATED MAPPING CONFIG";
const end = "// END GENERATED MAPPING CONFIG";
const engine = fs.readFileSync(path.join(root, "lib/mapping-config.js"), "utf8").trimEnd();
const block = begin + "\n" + engine + "\n" + end;

function withMappingConfig(content, filename) {
  const start = content.indexOf(begin);
  const finish = content.indexOf(end);
  assert(start !== -1 && finish > start, filename + " harus memuat marker konfigurasi pemetaan");
  assert(content.indexOf(begin, start + begin.length) === -1 && content.indexOf(end, finish + end.length) === -1,
    filename + " hanya boleh memuat satu blok konfigurasi pemetaan");
  return content.slice(0, start) + block + content.slice(finish + end.length);
}

// Bangun kedua blok kanonik terlebih dahulu sebelum menurunkan alias skrip diskon yang dipertahankan.
const variants = [
  { source: "g1-acq.js", output: "g1-acq-discount.js" },
  { source: "g1-sku-report.js", output: "g1-sku-report-discount.js" }
];
const canonical = variants.map(variant => {
  const original = fs.readFileSync(path.join(root, variant.source), "utf8");
  return { filename: variant.source, original, content: withMappingConfig(original, variant.source) };
});
const aliases = variants.map((variant, index) => ({
  filename: variant.output,
  content: "/* Generated from " + variant.source + " by tools/build-variants.cjs. */\n" + canonical[index].content
}));

for (const file of canonical.concat(aliases)) {
  const destination = path.join(root, file.filename);
  if (check) {
    assert(fs.existsSync(destination), file.filename + " tidak ditemukan; jalankan node tools/build-variants.cjs");
    const actual = file.original === undefined ? fs.readFileSync(destination, "utf8") : file.original;
    assert.equal(actual, file.content, file.filename + " belum sinkron; jalankan node tools/build-variants.cjs");
  } else if (file.original !== file.content) {
    fs.writeFileSync(destination, file.content);
  }
  console.log((check ? "Terverifikasi " : "Dibuat ") + file.filename);
}
