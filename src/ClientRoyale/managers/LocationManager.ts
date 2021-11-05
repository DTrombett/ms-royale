import type { ClientRoyale } from "..";
import type { APILocation } from "../APITypes";
import { Location } from "../structures";
import { FetchableManager } from "./FetchableManager";

/**
 * A manager for locations.
 */
export class LocationManager extends FetchableManager<typeof Location> {
	constructor(client: ClientRoyale, data?: APILocation[]) {
		super(client, Location, data);
	}
}
