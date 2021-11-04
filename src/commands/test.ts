import { SlashCommandBuilder } from "@discordjs/builders";
import { createCanvas, loadImage, registerFont } from "canvas";
import { MessageAttachment } from "discord.js";
import { join } from "path";
import type { CommandOptions } from "../types";

registerFont(join(__dirname, "../../fonts/royale.ttf"), { family: "royale" });

export const command: CommandOptions = {
	data: new SlashCommandBuilder()
		.setName("test")
		.setDescription("Test command for the images"),
	async run(interaction) {
		const image = createCanvas(510, 54);
		const ctx = image.getContext("2d");

		ctx.drawImage(
			await loadImage(join(__dirname, "../../images/joined.png")),
			0,
			0,
			image.width,
			image.height
		);
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = "9pt royale";
		ctx.fillStyle = "#ffffff";
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 1.75;
		ctx.strokeText(
			"DTrombett è entrato/a nel clan",
			image.width / 2,
			image.height / 2 + 0.5
		);
		ctx.fillText(
			"DTrombett è entrato/a nel clan",
			image.width / 2,
			image.height / 2
		);

		interaction
			.reply({
				files: [new MessageAttachment(image.toBuffer(), "joined.png")],
			})
			.catch(console.error);
	},
};
