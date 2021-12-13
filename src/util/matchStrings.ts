/**
 * Search for a string in a string.
 * @param haystack - The string to search in
 * @param needle - The string to search for
 * @param caseSensitive - Whether or not the search should be case sensitive
 * @returns If the string was found
 */
export const matchStrings = (
	haystack: string,
	needle: string,
	caseSensitive = false
): boolean => {
	if (!caseSensitive) {
		haystack = haystack.toLowerCase();
		needle = needle.toLowerCase();
	}
	return haystack.includes(needle);
};

export default matchStrings;
