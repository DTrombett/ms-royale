/**
 * Round a number to x decimal places.
 * @param num The number to round
 * @param decimals The number of decimal places to round to
 * @returns The rounded number
 */
export const roundNumber = (num: number, decimals: number) =>
	Number(`${Math.round(Number(`${num}e${decimals}`))}e-${decimals}`);

export default roundNumber;
