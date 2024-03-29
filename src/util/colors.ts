/**
 * Color ANSI codes
 */
export enum Color {
	Black = 30,
	Red = 31,
	Green = 32,
	Brown = 33,
	Blue = 34,
	Magenta = 35,
	Cyan = 36,
	Gray = 37,
}

/**
 * Colors a text in the console.
 * @param text - The text to color
 * @param code - The color to use
 * @returns The colored text
 */
export const color = (text: string, code: Color): string =>
	`\x1b[${code}m${text}\x1b[m`;

export default color;
