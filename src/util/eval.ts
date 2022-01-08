import CustomClient from "./CustomClient";

/**
 * Execute some code and return the result.
 * @param code - The code to execute
 * @returns The result of the code
 */
export async function runEval(code: string): Promise<unknown> {
	try {
		return (await eval(code)) as unknown;
	} catch (e) {
		return e;
	}
}

/**
 * Execute some code and return the parsed result.
 * @param code - The code to execute
 * @param thisArg - The value of `this` in the code
 * @returns The result of the code
 */
export const parseEval = async (
	code: string,
	thisArg?: unknown
): Promise<string> => CustomClient.inspect(await runEval.bind(thisArg)(code));
