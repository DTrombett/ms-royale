import { CustomClient, EventOptions, EventType } from "../../util";

export const event: EventOptions<EventType.Discord, "warn"> = {
	name: "warn",
	type: EventType.Discord,
	on(warn) {
		CustomClient.printToStderr(warn);
	},
};