import type { ClientRoyale } from "..";
import type { Path } from "../../types";
import type { APILocation } from "../APITypes";
import { FetchableStructure } from "./FetchableStructure";

/**
 * Represents a Clash Royale location.
 */
export class Location extends FetchableStructure<APILocation> {
	static id = "id";
	static route: Path = "/locations/:id";

	/**
	 * The location's name.
	 */
	name: string;

	/**
	 * The location's country code.
	 */
	countryCode?: string;

	/**
	 * If the location is a country.
	 */
	private _isCountry: boolean;

	/**
	 * @param client The client that instantiated this location
	 * @param data The data of this location
	 */
	constructor(client: ClientRoyale, data: APILocation) {
		super(client, data);

		this.name = data.name;
		this.countryCode = data.countryCode;
		this._isCountry = data.isCountry;
	}

	/**
	 * Checks if the location is a country.
	 * @returns Whether this location is a country
	 */
	isCountry(): this is this & { countryCode: string } {
		return this._isCountry;
	}

	/**
	 * Gets the JSON of this location.
	 * @returns The JSON representation of this location
	 */
	toJson(): APILocation {
		return {
			id: Number(this.id),
			name: this.name,
			countryCode: this.countryCode,
			isCountry: this._isCountry,
		};
	}

	patch(data: Partial<APILocation>) {
		if (data.name != null) this.name = data.name;
		if (data.countryCode != null) this.countryCode = data.countryCode;
		if (data.isCountry != null) this._isCountry = data.isCountry;

		return this;
	}
}
