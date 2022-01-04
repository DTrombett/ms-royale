import { CustomClient, EventOptions, EventType } from "../../util";

export const event: EventOptions<EventType.Discord, "apiRequest"> = {
	name: "apiRequest",
	type: EventType.Discord,
	on(request) {
		CustomClient.printToStdout(
			`${request.method.toUpperCase()} ${request.path}`
		);
	},
};
