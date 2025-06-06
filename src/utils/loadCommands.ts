import { importx } from "@discordx/importer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadCommands() {
    await importx(path.resolve(__dirname, "../commands/**/*.{ts,js}"));
}
