import { spawn } from "node:child_process";
import type CustomClient from "../CustomClient";

/**
 * Restarts the process.
 * @param client The client to restart
 */
export const restart = (client: CustomClient) => {
	process.once("exit", () => {
		spawn(process.argv[0], process.argv.slice(1), {
			cwd: process.cwd(),
			detached: true,
			stdio: "inherit",
		}).unref();
	});
	client.discord.destroy();
	// eslint-disable-next-line no-process-exit
	process.exit(0);
};

export default restart;
