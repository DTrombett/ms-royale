import { exit, memoryUsage } from "node:process";
import Constants, { CustomClient, EventOptions, EventType } from "../../util";

export const event: EventOptions<EventType.Discord, "invalidated"> = {
	name: "invalidated",
	type: EventType.Discord,
	once() {
		const memory = memoryUsage();

		CustomClient.printToStderr(
			`Bot client session became invalidated.\nClosing the process gracefully\n${(
				memory.heapUsed /
				1024 /
				1024
			).toFixed(Constants.percentageDigits())} MB used\n${(
				memory.heapTotal /
				1024 /
				1024
			).toFixed(Constants.percentageDigits())} MB total\n${(
				memory.external /
				1024 /
				1024
			).toFixed(Constants.percentageDigits())} MB external\n${(
				memory.rss /
				1024 /
				1024
			).toFixed(Constants.percentageDigits())} MB rss`
		);
		this.client.discord.destroy();
		exit(0);
	},
};
