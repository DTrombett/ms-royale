import { promises } from "node:fs";
import { join } from "node:path";
import { URL } from "node:url";
import type { EventOptions } from ".";
import type CustomClient from "../CustomClient";
import Constants from "./Constants";
import Event from "./Event";

/**
 * Load events listeners for the client.
 * @param client - The client to load the events for
 */
export const loadEvents = (client: CustomClient) =>
	promises
		.readdir(new URL(join("..", Constants.eventsFolderName()), import.meta.url))
		.then((fileNames) =>
			Promise.all(
				fileNames
					.filter((fileName) => fileName.endsWith(".js"))
					.map(
						(fileName) =>
							import(
								`../${Constants.eventsFolderName()}/${fileName}`
							) as Promise<{
								event: EventOptions;
							}>
					)
			)
		)
		.then((files) => files.map((file) => file.event))
		.then((events) => {
			for (const event of events)
				client.events.set(event.name, new Event(client, event));
		});

export default loadEvents;
