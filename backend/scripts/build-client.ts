import { build as viteBuild } from "vite";
import { rm } from "fs/promises";

async function buildClient() {
  console.log("building client...");
  await viteBuild({ root: "frontend" });
}

buildClient().catch((err) => {
  console.error(err);
  process.exit(1);
});
