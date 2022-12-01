/**
 * Convert an API date to a JS date.
 * @param date - The date to convert, like "20220507T125327.000Z"
 * @returns The converted date
 */
export const convertDate = (date: string) =>
	new Date(
		`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(
			9,
			11
		)}:${date.slice(11, 13)}:${date.slice(13, 15)}.${date.slice(16, 19)}Z`
	);

/**
 * Transform an API date to a human readable date.
 * @param date - The date to transform, like "20220507T125327.000Z"
 * @returns The transformed date, like "07/05/2022, 12:53:27"
 */
export const transformDate = (date: string) =>
	`${date.slice(6, 8)}/${date.slice(4, 6)}/${date.slice(0, 4)}, ${date.slice(
		9,
		11
	)}:${date.slice(11, 13)}:${date.slice(13, 15)}`;
