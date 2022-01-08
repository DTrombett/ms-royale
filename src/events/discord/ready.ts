import Constants, { CustomClient, EventOptions, EventType } from "../../util";

export const event: EventOptions<EventType.Discord, "ready"> = {
	name: "ready",
	type: EventType.Discord,
	async once(discordClient) {
		setInterval(() => {
			this.client.clans
				.fetch(Constants.mainClanTag())
				.catch(CustomClient.printToStderr);
		}, Constants.mainClanFetchInterval());
		await Promise.all([
			discordClient.application.fetch(),
			this.client.clans.fetch(Constants.mainClanTag()),
		]);
		console.timeEnd(Constants.clientOnlineLabel());
	},
};
