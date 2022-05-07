/**
 * Asserts that a tag is valid.
 * @param tag - The tag to validate
 */
export const validateTag = (tag: string): boolean =>
	/^#(0|2|8|9|P|Y|L|Q|G|R|J|C|U|V)+$/.test(tag);

export default validateTag;
