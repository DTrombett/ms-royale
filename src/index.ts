import { config } from "dotenv";
import { use } from "i18next";
import Backend from "i18next-fs-backend";
import { stdin } from "node:process";
import { fileURLToPath, URL } from "node:url";
import Constants, { CustomClient, runEval } from "./util";

config();
console.time(Constants.clientOnlineLabel());

const client = new CustomClient();

stdin.on("data", async (data) => {
	const input = data.toString().trim();

	if (!input) return;
	CustomClient.printToStdout(await runEval.bind(client)(input));
});
await use(Backend).init({
	backend: {
		loadPath: fileURLToPath(
			new URL("../locales/{{lng}}/{{ns}}.json", import.meta.url)
		),
	},
	cleanCode: true,
	fallbackLng: "it",
	defaultNS: "translation",
	lng: "it",
	ns: ["translation"],
	debug: true,
});

await client.login();
