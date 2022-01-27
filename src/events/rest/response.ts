import { stdout } from "process";
import { moveCursor } from "readline";
import type { EventOptions } from "../../util";
import { CustomClient, EventType } from "../../util";
import { requests } from "./request";

export const event: EventOptions<EventType.Rest, "response"> = {
	name: "response",
	type: EventType.Rest,
	on(request, response) {
		const r = `${request.method.toUpperCase()} ${request.path}` as const;
		const data = requests[r];

		if (!data) return;
		const [lines, time] = data;

		moveCursor(stdout, 0, lines - CustomClient.lines++);
		stdout.write(
			`${r} - ${response.status} ${response.statusText} (${
				Date.now() - time
			}ms)\n`
		);
		moveCursor(stdout, 0, CustomClient.lines - lines);
	},
};
