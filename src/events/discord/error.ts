import { CustomClient, EventOptions, EventType } from "../../util";

export const event: EventOptions<EventType.Discord, "error"> = {
	name: "error",
	type: EventType.Discord,
	on(error) {
		void CustomClient.printToStderr(error, true);
	},
};
