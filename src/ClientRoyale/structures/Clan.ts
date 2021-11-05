import type { ClientRoyale } from "..";
import type { Path, FetchOptions } from "../util";
import type { APIClan, APIMember, APITag } from "../APITypes";
import { getEnumString } from "../util";
import { FetchableStructure } from "./FetchableStructure";
import { Location } from "./Location";

/**
 * Represents the type of a clan.
 */
export enum ClanType {
	/**
	 * Clan is closed.
	 */
	closed,
	/**
	 * The clan is invite only.
	 */
	inviteOnly,
	/**
	 * The clan is open.
	 */
	open,
}

/**
 * Represents a clan.
 */
export class Clan extends FetchableStructure<APIClan> {
	static route: Path = "/clans/:id";

	/**
	 * The tag of the clan.
	 */
	tag: APITag;

	/**
	 * The name of the clan.
	 */
	name: string;

	/**
	 * The type of the clan.
	 */
	type: ClanType;

	/**
	 * The description of the clan.
	 */
	description: string;

	/**
	 * The badge ID of the clan.
	 */
	badge: number;

	/**
	 * The clan's score.
	 */
	score: number;

	/**
	 * The clan's trophies in the war.
	 */
	warTrophies: number;

	/**
	 * The location of the clan.
	 */
	location: Location;

	/**
	 * The required trophies to join the clan.
	 */
	requiredTrophies: number;

	/**
	 * The clan's donations per week.
	 */
	donationsPerWeek: number;

	/**
	 * The members of the clan.
	 */
	members: APIMember[];

	/**
	 * @param data The data of this structure.
	 */
	constructor(client: ClientRoyale, data: APIClan) {
		super(client, data);

		this.tag = data.tag;
		this.name = data.name;
		this.type = ClanType[data.type];
		this.description = data.description;
		this.badge = data.badgeId;
		this.score = data.clanScore;
		this.warTrophies = data.clanWarTrophies;
		this.location = new Location(client, data.location);
		this.requiredTrophies = data.requiredTrophies;
		this.donationsPerWeek = data.donationsPerWeek;
		// TODO: Create a ClanMember manager
		this.members = data.memberList;
	}

	/**
	 * The clan's member count.
	 */
	get memberCount(): number {
		return this.members.length;
	}

	/**
	 * Gets the API data of this structure.
	 * @returns The JSON representation of this structure.
	 */
	toJson(): APIClan {
		return {
			badgeId: this.badge,
			clanScore: this.score,
			clanWarTrophies: this.warTrophies,
			description: this.description,
			donationsPerWeek: this.donationsPerWeek,
			location: this.location.toJson(),
			name: this.name,
			requiredTrophies: this.requiredTrophies,
			tag: this.tag,
			type: getEnumString(ClanType, this.type),
			memberList: this.members,
			clanChestLevel: 1,
			clanChestMaxLevel: 0,
			clanChestStatus: "inactive",
			members: this.members.length,
		};
	}

	/**
	 * Gets the string representation of this structure.
	 * @returns A string representation of this structure.
	 */
	toString(): string {
		return this.name;
	}

	/**
	 * Patches this structure.
	 * @param data The new data of this structure.
	 * @returns The new instance of this structure.
	 */
	patch(data: Partial<APIClan>): this {
		super.patch(data);

		if (data.name != null) this.name = data.name;
		if (data.type) this.type = ClanType[data.type];
		if (data.description != null) this.description = data.description;
		if (data.badgeId != null) this.badge = data.badgeId;
		if (data.clanScore != null) this.score = data.clanScore;
		if (data.clanWarTrophies != null) this.warTrophies = data.clanWarTrophies;
		if (data.location) this.location = new Location(this.client, data.location);
		if (data.requiredTrophies != null)
			this.requiredTrophies = data.requiredTrophies;
		if (data.donationsPerWeek != null)
			this.donationsPerWeek = data.donationsPerWeek;
		if (data.memberList) this.members = data.memberList;

		return this;
	}

	/**
	 * Fetches this structure.
	 * @returns A promise that resolves with this structure.
	 */
	fetch(options?: FetchOptions): Promise<this> {
		return this.client.clans.fetch(this.tag, options) as Promise<this>;
	}
}
