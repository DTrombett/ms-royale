import { config } from "dotenv";
import ClientRoyale from "./ClientRoyale";
import Constants, { loadEvents, loadCommands } from "./util";

config();

const client = new ClientRoyale();

console.time(Constants.clientOnlineLabel());
void Promise.all([loadEvents(client), loadCommands(client)]).then(() =>
	client.login()
);
