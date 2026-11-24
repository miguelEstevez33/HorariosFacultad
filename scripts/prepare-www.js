const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const wwwDir = path.join(rootDir, "www");

// Limpiar carpeta www/ antes de copiar para evitar archivos obsoletos
if (fs.existsSync(wwwDir)) {
  fs.rmSync(wwwDir, { recursive: true, force: true });
}
fs.mkdirSync(wwwDir, { recursive: true });

let copiedCount = 0;

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
    copiedCount++;
  }
}

const indexSrc = path.join(rootDir, "index.html");
if (fs.existsSync(indexSrc)) {
  fs.copyFileSync(indexSrc, path.join(wwwDir, "index.html"));
  copiedCount++;
}

const srcDir = path.join(rootDir, "src");
if (fs.existsSync(srcDir)) {
  copyRecursive(srcDir, path.join(wwwDir, "src"));
}

console.log(`Carpeta www/ actualizada con ${copiedCount} archivos (index.html + src/).`);
