import type {
	ButtonActions,
	ButtonActionsTypes,
	MenuActions,
	MenuActionsTypes,
} from ".";

/**
 * Build a custom button id.
 * @param action - The action to perform
 * @param args - The arguments to pass to the action
 * @returns The custom button id
 */
export const buildCustomButtonId = <T extends ButtonActions>(
	action: T,
	...args: ButtonActionsTypes[T]
) => `${action}${args.length > 0 ? `-${args.join("-")}` : ""}`;

/**
 * Build a custom menu id.
 * @param action - The action to perform
 * @param args - The arguments to pass to the action
 * @returns The custom menu id
 */
export const buildCustomMenuId = <T extends MenuActions>(
	action: T,
	...args: MenuActionsTypes[T]
) => `${action}${args.length > 0 ? `-${args.join("-")}` : ""}`;

/**
 * Destructure a custom button id.
 * @param id - The custom button id
 * @returns The action and arguments
 */
export const destructureCustomButtonId = <T extends ButtonActions>(
	id: string
): {
	action: T;
	args: ButtonActionsTypes[T];
} => {
	const args = id.split("-") as ButtonActionsTypes[T];

	return {
		action: args.splice(0, 1)[0] as T,
		args,
	};
};

/**
 * Destructure a custom menu id.
 * @param id - The custom menu id
 * @returns The action and arguments
 */
export const destructureCustomMenuId = <T extends MenuActions>(
	id: string
): {
	action: T;
	args: MenuActionsTypes[T];
} => {
	const args = id.split("-") as MenuActionsTypes[T];

	return {
		action: args.splice(0, 1)[0] as T,
		args,
	};
};
