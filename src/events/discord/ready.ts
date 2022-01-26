import type { EventOptions } from "../../util";
import Constants, { CustomClient, EventType } from "../../util";

const tag = Constants.mainClanTag();
const interval = Constants.mainClanFetchInterval();
const label = Constants.clientOnlineLabel();

export const event: EventOptions<EventType.Discord, "ready"> = {
	name: "ready",
	type: EventType.Discord,
	async once(discordClient) {
		setInterval(() => {
			this.client.clans
				.fetch(tag, { force: true })
				.catch(CustomClient.printToStderr);
		}, interval);
		await Promise.all([
			discordClient.application.fetch(),
			this.client.clans.fetch(tag, { force: true }),
		]);
		console.timeEnd(label);
	},
};
