import type { EventOptions } from "../../util";
import { CustomClient, EventType } from "../../util";

export const requests: {
	[key: `${string} /${string}`]: [number, number] | undefined;
} = {};

export const event: EventOptions<EventType.Rest, "request"> = {
	name: "request",
	type: EventType.Rest,
	on(request) {
		void CustomClient.printToStdout(
			(requests[`${request.method.toUpperCase()} ${request.path}`] = [
				CustomClient.lines,
				Date.now(),
			])
		);
	},
};
