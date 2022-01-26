import type { Client } from "discord.js";
import dotenv from "dotenv";
import { start } from "node:repl";
import Constants, { CustomClient, startJob } from "./util";

await CustomClient.logToFile("\n");
dotenv.config({ debug: true, multiline: true });
console.time(Constants.clientOnlineLabel());

const client = new CustomClient();
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

await client.login();
startJob(client);
start();
