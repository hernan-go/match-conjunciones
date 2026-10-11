import sharp, { type OverlayOptions } from "sharp";
import { catalog } from "../src/data/index";
const width = 1400,
  height = Math.ceil(catalog.books.length / 7) * 290;
const composites: OverlayOptions[] = [];
for (const [i, b] of catalog.books.entries()) {
  const cover = await sharp(`assets-private/covers/${b.cover.file}`)
    .resize(150, 220, { fit: "inside" })
    .png()
    .toBuffer();
  const x = (i % 7) * 200,
    y = Math.floor(i / 7) * 290;
  composites.push({ input: cover, left: x + 20, top: y + 5 });
  const label =
    `${i + 1}. ${b.title}`
      .replace(/[<>&]/g, "")
      .match(/.{1,27}(?:\s|$)|.{1,27}/g)
      ?.slice(0, 3) || [];
  const svg = `<svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">${label.map((line, j) => `<text x="8" y="${14 + j * 17}" font-family="Arial" font-size="12">${line}</text>`).join("")}</svg>`;
  composites.push({ input: Buffer.from(svg), left: x, top: y + 227 });
}
await sharp({ create: { width, height, channels: 3, background: "#fff" } })
  .composite(composites)
  .png()
  .toFile("assets-private/cover-review.png");
