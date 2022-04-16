import parser from "cron-parser";
import { env } from "node:process";
import { clanInfo } from "./api";
import Constants from "./Constants";
import CustomClient from "./CustomClient";

const parsed = parser.parseExpression("0 0 0 * * *");
const { CLAN_CHANNEL: clanChannelId } = env;

/**
 * Start a job that runs every day at midnight to update clan info.
 * @param client - The client to use
 */
export const startJob = (client: CustomClient) =>
	setTimeout(() => {
		const channel =
			clanChannelId !== undefined
				? client.bot.channels.cache.get(clanChannelId)
				: undefined;

		if (channel === undefined || !channel.isText() || !("guild" in channel)) {
			void CustomClient.printToStderr(
				`Invalid clan channel with id ${clanChannelId!}`
			);
			return;
		}
		channel
			.bulkDelete(2)
			.then(() => clanInfo(client, Constants.mainClanTag, {}))
			.then((data) =>
				Promise.all([
					clanInfo(client, Constants.secondClanTag, {}),
					channel.send({
						...data,
					}),
				])
			)
			.then(([data]) =>
				channel.send({
					...data,
				})
			)
			.catch(CustomClient.printToStderr);

		startJob(client);
	}, parsed.next().getTime() - Date.now());

export default startJob;
