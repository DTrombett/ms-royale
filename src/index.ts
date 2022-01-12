import { config } from "dotenv";
import { use } from "i18next";
import Backend from "i18next-fs-backend";
import { exec } from "node:child_process";
import { readdir } from "node:fs/promises";
import { cwd, env, stderr, stdin, stdout } from "node:process";
import { fileURLToPath, URL } from "node:url";
import Constants, { CustomClient, importJson } from "./util";

config();
console.time(Constants.clientOnlineLabel());

const client = new CustomClient();

void readdir("./database/").then((files) => {
	for (const file of files) void importJson<any>(file.replace(".json", ""));
});
stdin.on("data", (data) => {
	const child = exec(data.toString().trim(), {
		cwd: cwd(),
		env,
	});

	child.stderr?.pipe(stderr);
	child.stdout?.pipe(stdout);
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
	preload: await readdir("./locales/").then((files) =>
		files.map((file) => file.replace(".json", ""))
	),
	returnObjects: true,
	debug: true,
});

await client.login();
