import { config } from "dotenv";
import { use } from "i18next";
import Backend from "i18next-fs-backend";
import { readdir } from "node:fs/promises";
import { stdin } from "node:process";
import { fileURLToPath, URL } from "node:url";
import Constants, { CustomClient, runEval } from "./util";

config();
console.time(Constants.clientOnlineLabel());

const client = new CustomClient();
const preload = await readdir(`./locales/`).then((files) =>
	files.map((file) => file.replace(".json", ""))
);

stdin.on("data", async (data) => {
	const input = data.toString().trim();

	if (!input) return;
	CustomClient.printToStdout(await runEval.bind(client)(input));
});
await use(Backend).init({
	backend: {
		loadPath: fileURLToPath(
			new URL("../locales/{{lng}}.json", import.meta.url)
		),
	},
	cleanCode: true,
	fallbackLng: "en-US",
	lng: "en-US",
	load: "currentOnly",
	preload,
	returnObjects: true,
	debug: true,
});

await client.login();
