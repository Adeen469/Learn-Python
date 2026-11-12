const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

async function cropLogo() {
  const src = path.resolve(__dirname, "..", "public", "lp-logo.jpg");
  const destPng = path.resolve(__dirname, "..", "public", "lp-logo.png");

  // The original image is 1024x1024. The black rounded squircle sits roughly within [168..856, 168..856].
  // By cropping to the inner square (e.g. 680x680 centered at (172, 172)) and applying a subtle squircle mask,
  // we eliminate 100% of the grey/white outer background.
  const size = 680;
  const left = 172;
  const top = 172;

  // Mask SVG with pure transparent outside and black rounded rectangle inside
  const maskSvg = Buffer.from(`
    <svg width="${size}" height="${size}">
      <rect x="0" y="0" width="${size}" height="${size}" rx="140" ry="140" fill="#ffffff" />
    </svg>
  `);

  await sharp(src)
    .extract({ left, top, width: size, height: size })
    .composite([
      {
        input: maskSvg,
        blend: "dest-in",
      },
    ])
    .png()
    .toFile(destPng);

  console.log("Created transparent cropped logo at", destPng);
}

cropLogo().catch(console.error);
