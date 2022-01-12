import { createReadStream, createWriteStream } from "node:fs";
import Constants from "./Constants";
import { Variables } from "./types";

export const databaseCache: Partial<Variables> = {};
const folder = Constants.variablesFolderName();

/**
 * Parse the JSON contents of a file.
 * @param name - The name of the file to read, without the extension
 * @returns The parsed JSON file
 */
export const importJson = <T extends keyof Variables>(
	name: T,
	force = false
): Promise<Variables[T]> =>
	new Promise((resolve, reject) => {
		const existing = databaseCache[name];
		if (existing && !force) {
			resolve(existing!);
			return;
		}

		let data = "";

		createReadStream(`./${folder}/${name}.json`)
			.setEncoding("utf8")
			.on("data", (chunk) => (data += chunk))
			.on("end", () => {
				try {
					const parsed = JSON.parse(data) as Variables[T];

					databaseCache[name] = parsed;
					resolve(parsed);
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
		try {
			const stringified = JSON.stringify(data);

			databaseCache[name] = data;
			createWriteStream(`./${folder}/${name}.json`)
				.on("error", reject)
				.on("finish", resolve)
				.setDefaultEncoding("utf8")
				.end(stringified);
		} catch (error) {
			reject(error);
		}
	});
