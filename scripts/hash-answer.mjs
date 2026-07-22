import { createHash } from "node:crypto";

const answer = process.argv.slice(2).join(" ");

if (!answer) {
  console.error("使い方: npm run hash-answer -- 正解の文字列");
  process.exit(1);
}

const normalized = answer
  .normalize("NFKC")
  .trim()
  .toLocaleLowerCase("ja-JP")
  .replace(/[\s　・･.,、。!！?？「」『』（）()\-]/g, "");

console.log(createHash("sha256").update(normalized).digest("hex"));
