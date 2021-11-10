import type { ConstantsEvents } from "discord.js";
import type { EventOptions } from "../types";
import Constants, { time } from "../util";

export const event: EventOptions<ConstantsEvents["CLIENT_READY"]> = {
	name: "ready",
	async once(client) {
		setInterval(() => {
			this.client.clans
				.fetch(Constants.mainClanTag(), { maxAge: time.millisecondsPerMinute })
				.catch(console.error);
		}, Constants.mainClanFetchInterval());
		await Promise.all([
			client.application.fetch(),
			this.client.clans.fetch(Constants.mainClanTag()),
		]);
		console.timeEnd(Constants.clientOnlineLabel());
	},
};
