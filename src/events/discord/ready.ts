import type { EventOptions } from "../../util";
import Constants, { CustomClient, EventType } from "../../util";

export const event: EventOptions<EventType.Discord, "ready"> = {
	name: "ready",
	type: EventType.Discord,
	async once(discordClient) {
		setInterval(() => {
			this.client.clans
				.fetch(Constants.mainClanTag, { force: true })
				.catch(CustomClient.printToStderr);
		}, Constants.mainClanFetchInterval);
		await Promise.all([
			discordClient.application.fetch(),
			this.client.clans.fetch(Constants.mainClanTag, { force: true }),
		]);
		console.timeEnd(Constants.clientOnlineLabel);
	},
};
