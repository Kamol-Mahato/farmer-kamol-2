import fs from "fs";
import path from "path";

const EXTS = ["jpg", "jpeg", "png", "webp"];

export function investImage(names: string | string[]): string | null {
  const list = Array.isArray(names) ? names : [names];
  for (const name of list) {
    for (const ext of EXTS) {
      const file = path.join(process.cwd(), "public", "uploads", `${name}.${ext}`);
      try {
        if (fs.existsSync(file)) {
          return `/uploads/${name}.${ext}?v=${Math.floor(fs.statSync(file).mtimeMs)}`;
        }
      } catch {
        // ignore
      }
    }
  }
  return null;
}