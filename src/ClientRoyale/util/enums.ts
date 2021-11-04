export enum Enum {}

export const getEnumNumber = <E extends typeof Enum>(
	enumType: E,
	enumValue: E[keyof E]
) =>
	typeof enumValue === "number"
		? enumValue
		: (enumType as unknown as Record<string, number>)[enumValue as string];

export type EnumString<E extends typeof Enum> = Exclude<E[keyof E], number>;
export const getEnumString = <E extends typeof Enum>(
	enumType: E,
	enumValue: E[keyof E]
): EnumString<E> =>
	typeof enumValue === "string"
		? (enumValue as EnumString<E>)
		: (enumType as unknown as Record<number, EnumString<E>>)[
				enumValue as unknown as number
		  ];
