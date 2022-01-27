import type { EventOptions } from "../../util";
import { CustomClient, EventType } from "../../util";

export const event: EventOptions<EventType.Rest, "request"> = {
	name: "request",
	type: EventType.Rest,
	on(request) {
		void CustomClient.printToStdout(
			`${request.method.toUpperCase()} ${request.path}`
		);
	},
};
