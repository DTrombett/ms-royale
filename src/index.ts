import { config } from "dotenv";
import { ClientRoyale } from "./Client";

config();
const client = new ClientRoyale();
void client.royale.request("/players/#22RJCYLUY").then(console.log);
