const letters = "0123456789ABCDEF";

/**
 * Generates a random color.
 */
export const getRandomColor = () => {
	let color = "#";

	for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
	return color;
};

export default getRandomColor;
