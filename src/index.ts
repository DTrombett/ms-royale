import type { Client } from "discord.js";
import { config } from "dotenv";
import express from "express";
import { env } from "node:process";
import { start } from "node:repl";
import Constants, {
	CustomClient,
	normalizeTag,
	RoyaleUrls,
	startJob,
	validateTag,
} from "./util";

await CustomClient.logToFile("\n");
if (!("DISCORD_TOKEN" in env)) config({ debug: true });
console.time(Constants.clientOnlineLabel);

const client = new CustomClient();
const app = express();

(
	global as typeof globalThis & {
		client: CustomClient;
	}
).client = client;
(
	global as typeof globalThis & {
		bot: Client;
	}
).bot = client.bot;
(
	global as typeof globalThis & {
		app: express.Application;
	}
).app = app;

app.get(`/${RoyaleUrls.clanInfoPath}`, (req, res) => {
	let { tag } = req.query;
	tag = normalizeTag(typeof tag === "string" ? tag : "");

	if (typeof tag !== "string" || !validateTag(tag))
		return res.status(400).send("Invalid tag");
	res.redirect(RoyaleUrls.clanInfo(tag));
	return undefined;
});
app.get(`/${RoyaleUrls.playerInfoPath}`, (req, res) => {
	let { tag } = req.query;
	tag = normalizeTag(typeof tag === "string" ? tag : "");

	if (typeof tag !== "string" || !validateTag(tag))
		return res.status(400).send("Invalid tag");
	res.redirect(RoyaleUrls.playerInfo(tag));
	return undefined;
});
app.use((_, res) => {
	if (client.bot.application)
		res.redirect(Constants.inviteUrl(client.bot.application));
	else res.sendStatus(404);
});

app.listen(3000);
await client.login();
startJob(client);
start();
