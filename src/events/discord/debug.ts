import { CustomClient, EventOptions, EventType } from "../../util";

export const event: EventOptions<EventType.Discord, "debug"> = {
	name: "debug",
	type: EventType.Discord,
	on(info) {
		CustomClient.printToStdout(info);
	},
};
