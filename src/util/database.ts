import { createReadStream, createWriteStream } from "node:fs";
import { Variables } from "./types";
import Constants from "./Constants";

const folder = Constants.variablesFolderName();

/**
 * Parse the JSON contents of a file.
 * @param name - The name of the file to read, without the extension
 * @returns The parsed JSON file
 */
export const importJson = <T extends keyof Variables>(
	name: T
): Promise<Variables[T]> =>
	new Promise((resolve, reject) => {
		let data = "";

		createReadStream(`./${folder}/${name}.json`)
			.setEncoding("utf8")
			.on("data", (chunk) => (data += chunk))
			.on("end", () => {
				try {
					resolve(JSON.parse(data));
				} catch (error) {
					reject(error);
				}
			})
			.on("error", reject);
	});

/**
 * Print a JSON object to a file.
 * @param name - The name of the file to write, without the extension
 * @param data - The data to write
 */
export const writeJson = <T extends keyof Variables>(
	name: T,
	data: Variables[T]
): Promise<void> =>
	new Promise((resolve, reject) => {
		createWriteStream(`./${folder}/${name}.json`)
			.on("error", reject)
			.on("finish", resolve)
			.setDefaultEncoding("utf8")
			.end(JSON.stringify(data, null, 2));
	});
