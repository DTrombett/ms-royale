import type { APITag } from "apiroyale";

/**
 * Normalize a tag.
 * @param tag - Tag to normalize
 * @returns The normalized tag
 */
export const normalizeTag = (tag: string) => {
	tag = tag.toUpperCase();
	if (!tag.startsWith("#")) tag = `#${tag}`;
	return tag as APITag;
};

export default normalizeTag;
