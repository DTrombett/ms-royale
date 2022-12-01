import type { SearchClanOptions } from "apiroyale";
import type { ButtonInteraction } from "discord.js";

export const getSearchOptions = (
	{ message: { content } }: ButtonInteraction,
	{
		after,
		before,
	}: {
		after?: string;
		before?: string;
	}
): SearchClanOptions => {
	const [name, location, minMembers, maxMembers, minScore] = content
		.split("\n")
		.slice(2)
		.map((arg) => arg.split("**").slice(2)[0].slice(2)) as [
		string,
		"-" | `${number}`,
		string,
		string,
		string
	];

	return {
		after,
		before,
		limit: 25,
		name: name === "-" ? undefined : name.replaceAll("\\", ""),
		location: location === "-" ? undefined : Number(location),
		maxMembers: maxMembers === "-" ? undefined : parseInt(maxMembers),
		minMembers: minMembers === "-" ? undefined : parseInt(minMembers),
		minScore: minScore === "-" ? undefined : parseInt(minScore),
	};
};
