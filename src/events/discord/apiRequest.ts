import type { EventOptions } from "../../util";
import { CustomClient, EventType } from "../../util";

export const event: EventOptions<EventType.Discord, "apiRequest"> = {
	name: "apiRequest",
	type: EventType.Discord,
	on(request) {
		void CustomClient.printToStdout(
			`${request.method.toUpperCase()} ${request.path}`
		);
	},
};
