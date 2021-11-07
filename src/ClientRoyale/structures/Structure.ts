/* eslint-disable class-methods-use-this */
import type { ClientRoyale } from "..";
import type { JsonObject } from "../util";

/**
 * Base class for all structures
 */
export class Structure<T extends JsonObject = JsonObject> {
	/**
	 * The id's key of the structure
	 */
	static id = "tag";

	/**
	 * The client that instantiated this structure
	 */
	readonly client: ClientRoyale;

	/**
	 * An unique identifier for this structure
	 */
	readonly id: string;

	/**
	 * When this structure was last updated
	 */
	updatedAt = new Date();

	/**
	 * @param client - The client that instantiated this structure
	 * @param data - The data of the structure
	 */
	constructor(client: ClientRoyale, data: T) {
		this.client = client;
		this.id = data[(this.constructor as typeof Structure).id].toString();
	}

	/**
	 * Patches this structure.
	 * @param _data - The data to update this structure with
	 * @returns The updated structure
	 */
	patch(_data: Partial<T>): this {
		this.updatedAt = new Date();

		return this;
	}

	/**
	 * Gets a JSON representation of this structure.
	 * @returns The JSON representation of this structure
	 */
	toJson() {
		return {};
	}

	/**
	 * Gets a string representation of this structure.
	 * @returns The stringified JSON representation of this structure
	 */
	toString(): string {
		return JSON.stringify(this);
	}

	/**
	 * Checks whether this structure is equal to another structure.
	 * @param other - The structure to compare to
	 * @returns Whether the structures are equal
	 */
	equals(other: this): boolean {
		return this.id === other.id;
	}
}
