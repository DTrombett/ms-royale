import type { ButtonActions, MenuActions } from "./types";

/**
 * Create an action id.
 * @param action - The action to do
 * @param args - The arguments to pass to the action
 * @returns The id of the action
 */
export const createActionId: {
	<T extends keyof ButtonActions>(action: T, ...args: ButtonActions[T]): string;
	<T extends keyof MenuActions>(action: T, ...args: MenuActions[T]): string;
	<_ extends keyof (ButtonActions | MenuActions)>(
		action: never,
		...args: string[]
	): string;
} = (action: string, ...args: string[]) => `${action}-${args.join("-")}`;

/**
 * Parse an action id.
 * @param id - The id to parse
 * @returns The action and arguments of the action
 */
export const parseActionId: {
	<T extends keyof ButtonActions>(id: string): {
		action: T;
		args: ButtonActions[T];
	};
	<T extends keyof MenuActions>(id: string): {
		action: T;
		args: MenuActions[T];
	};
	<_ extends keyof (ButtonActions | MenuActions)>(id: never): {
		action: string;
		args: string[];
	};
} = (id: string) => {
	const args = id.split("-");

	return {
		action: args[0],
		args: args.slice(1),
	};
};
