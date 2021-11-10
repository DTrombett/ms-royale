import { promises } from "node:fs";
import { join } from "node:path";
import Event from "./Event";
import type { EventOptions } from "../types";
import Constants from "./Constants";
import type CustomClient from "../CustomClient";

/**
 * Load events listeners for the client.
 * @param client - The client to load the events for
 */
export const loadEvents = (client: CustomClient) =>
	promises
		.readdir(join(__dirname, "..", Constants.eventsFolderName()))
		.then((fileNames) =>
			Promise.all(
				fileNames
					.filter((fileName) => fileName.endsWith(".js"))
					.map(
						(fileName) =>
							import(
								join(__dirname, "..", Constants.eventsFolderName(), fileName)
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
