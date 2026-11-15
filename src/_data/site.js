import { readFileSync } from "node:fs";
const base = JSON.parse(readFileSync(new URL("../_settings/site.json", import.meta.url)));
export default { ...base, year: new Date().getFullYear() };
