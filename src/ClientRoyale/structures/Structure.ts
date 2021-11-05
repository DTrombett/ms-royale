/* eslint-disable class-methods-use-this */
import type { ClientRoyale } from "..";
import type { Json } from "../util";

export type JsonObject = {
	[property: string]: Json;
};

/**
 * Base class for all structures.
 */
export class Structure<T extends JsonObject = JsonObject> {
	/**
	 * The id's key of the structure.
	 */
	static id = "tag";

	/**
	 * When this structure was last updated.
	 */
	updatedAt = new Date();

	/**
	 * The client that instantiated this structure.
	 */
	client: ClientRoyale;

	/**
	 * An unique identifier for the structure.
	 */
	id: string;

	/**
	 * @param client The client that instantiated this structure.
	 * @param _data The data of the structure.
	 */
	constructor(client: ClientRoyale, _data: T) {
		this.client = client;
		this.id = _data[(this.constructor as typeof Structure).id].toString();
	}

	/**
	 * The JSON data of the structure.
	 */
	toJson(): T {
		throw new Error("Not implemented");
	}

	/**
	 * Converts the structure to a string.
	 * @returns The string representation of the structure.
	 */
	toString(): string {
		return JSON.stringify(this);
	}

	/**
	 * Patches the structure with new data.
	 * @param _data The data to patch.
	 * @returns The patched structure.
	 */
	patch(_data: Partial<T>): this {
		this.updatedAt = new Date();

		return this;
	}

	/**
	 * Checks whether the structure is equal to another structure.
	 * @param other The structure to compare to.
	 * @returns Whether the structures are equal.
	 */
	equals(other: this): boolean {
		return this.id === other.id;
	}
}
