const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const wwwDir = path.join(rootDir, "www");
const filesToCopy = ["index.html", "styles.css", "app.js", "schedules.js"];

if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

for (const file of filesToCopy) {
  const src = path.join(rootDir, file);
  const dest = path.join(wwwDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

console.log(`Carpeta www/ actualizada con ${filesToCopy.length} archivos.`);
