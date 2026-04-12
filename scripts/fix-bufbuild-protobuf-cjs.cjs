const fs = require("fs");
const path = require("path");

const targetPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "@bufbuild",
  "protobuf",
  "dist",
  "cjs",
  "package.json"
);

try {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, JSON.stringify({ type: "commonjs" }) + "\n", "utf8");
    console.log("[postinstall] Added", targetPath);
  }
} catch (error) {
  console.warn("[postinstall] Failed to patch @bufbuild/protobuf cjs package.json:", error?.message ?? error);
}
