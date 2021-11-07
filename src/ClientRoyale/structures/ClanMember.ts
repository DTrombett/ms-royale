import type { ClientRoyale } from "..";
import type { APILastSeen, APIMember, APITag } from "../APITypes";
import { ClanMemberRole, getEnumString } from "../util";
import type { Arena } from "./Arena";
import type { Clan } from "./Clan";
import { Structure } from "./Structure";

/**
 * A class representing a clan member
 */
export class ClanMember extends Structure<APIMember> {
	/**
	 * The arena this member is currently in
	 */
	arena: Arena;

	/**
	 * The clan of this member
	 */
	clan: Clan;

	/**
	 * The number of donations this member has made
	 */
	donationsPerWeek: number;

	/**
	 * The number of donations this member has received
	 */
	donationsReceived: number;

	/**
	 * The experience level of this member
	 */
	expLevel: number;

	/**
	 * The last time this member was online
	 */
	lastSeen: Date;

	/**
	 * The name of this member
	 */
	name: string;

	/**
	 * The previous rank of this member
	 */
	previousRank: number;

	/**
	 * The rank of this member in the clan
	 */
	rank: number;

	/**
	 * The role of this member
	 */
	role: ClanMemberRole;

	/**
	 * The tag of this member
	 */
	readonly tag: APITag;

	/**
	 * The number of trophies this member has
	 */
	trophies: number;

	/**
	 * @param client - The client that instantiated this clan member
	 * @param data - The data of the clan member
	 * @param clan - The clan of the member
	 */
	constructor(client: ClientRoyale, data: APIMember, clan: Clan) {
		super(client, data);

		this.clan = clan;
		this.tag = data.tag;
		this.name = data.name;
		this.role = ClanMemberRole[data.role];
		this.lastSeen = new Date(0);
		this.lastSeen.setFullYear(
			Number(data.lastSeen.slice(0, 4)),
			Number(data.lastSeen.slice(4, 6)) - 1,
			Number(data.lastSeen.slice(6, 8))
		);
		this.lastSeen.setHours(
			Number(data.lastSeen.slice(9, 11)),
			Number(data.lastSeen.slice(11, 13)),
			Number(data.lastSeen.slice(14, 15))
		);
		this.expLevel = data.expLevel;
		this.trophies = data.trophies;
		this.arena = client.arenas.add(data.arena);
		this.rank = data.clanRank;
		this.previousRank = data.previousClanRank;
		this.donationsPerWeek = data.donations;
		this.donationsReceived = data.donationsReceived;
	}

	/**
	 * The difference between the old and the new rank of this member
	 */
	get rankDifference(): number {
		return this.rank - this.previousRank;
	}

	/**
	 * The contribution to the total donations of this member
	 */
	get donationPercentage(): number {
		return (this.donationsPerWeek / this.clan.donationsPerWeek) * 100;
	}

	/**
	 * Patches this clan member.
	 * @param data - The data to update this clan member with
	 * @returns The updated clan member
	 */
	patch(data: Partial<APIMember>): this {
		super.patch(data);

		if (data.name !== undefined) this.name = data.name;
		if (data.role !== undefined) this.role = ClanMemberRole[data.role];
		if (data.clanRank !== undefined) this.rank = data.clanRank;
		if (data.previousClanRank !== undefined)
			this.previousRank = data.previousClanRank;
		if (data.donations !== undefined) this.donationsPerWeek = data.donations;
		if (data.donationsReceived !== undefined)
			this.donationsReceived = data.donationsReceived;
		if (data.expLevel !== undefined) this.expLevel = data.expLevel;
		if (data.lastSeen !== undefined) {
			this.lastSeen = new Date(0);
			this.lastSeen.setFullYear(
				Number(data.lastSeen.slice(0, 4)),
				Number(data.lastSeen.slice(4, 6)) - 1,
				Number(data.lastSeen.slice(6, 8))
			);
			this.lastSeen.setHours(
				Number(data.lastSeen.slice(9, 11)),
				Number(data.lastSeen.slice(11, 13)),
				Number(data.lastSeen.slice(14, 15))
			);
		}
		if (data.trophies !== undefined) this.trophies = data.trophies;
		if (data.arena !== undefined)
			this.arena = this.client.arenas.add(data.arena);

		return this;
	}

	/**
	 * Gets a JSON representation of this member.
	 */
	toJson(): APIMember {
		return {
			...super.toJson(),
			arena: this.arena.toJson(),
			clanChestPoints: 0,
			clanRank: this.rank,
			donations: this.donationsPerWeek,
			donationsReceived: this.donationsReceived,
			expLevel: this.expLevel,
			lastSeen: `${this.lastSeen.getFullYear()}${(this.lastSeen.getMonth() + 1)
				.toString()
				.padStart(2, "0")}${this.lastSeen
				.getDate()
				.toString()
				.padStart(2, "0")}T${this.lastSeen
				.getHours()
				.toString()
				.padStart(2, "0")}${this.lastSeen
				.getMinutes()
				.toString()
				.padStart(2, "0")}${this.lastSeen
				.getSeconds()
				.toString()
				.padStart(2, "0")}.000Z` as APILastSeen,
			name: this.name,
			previousClanRank: this.previousRank,
			role: getEnumString(ClanMemberRole, this.role),
			tag: this.tag,
			trophies: this.trophies,
		};
	}

	/**
	 * Gets the string representation of this member.
	 * @returns The name of this member
	 */
	toString(): string {
		return this.name;
	}
}
