import type { ClientEvents, ClientRoyale } from "apiroyale";
import type { Client, ClientEvents as DiscordEvents } from "discord.js";
import type { CustomClient } from ".";
import { EventOptions, EventType } from ".";

/**
 * A class representing a client event
 */
export class Event<
	T extends EventType = EventType,
	K extends T extends EventType.APIRoyale
		? keyof ClientEvents
		: T extends EventType.Discord
		? keyof DiscordEvents
		: never = T extends EventType.APIRoyale
		? keyof ClientEvents
		: T extends EventType.Discord
		? keyof DiscordEvents
		: never
> {
	/**
	 * The client that instantiated this event
	 */
	readonly client: CustomClient;

	/**
	 * The name of this event
	 */
	readonly name: K;

	/**
	 * The type of this event
	 */
	readonly type: T;

	/**
	 * The function to call when this event is emitted
	 */
	on?: OmitThisParameter<NonNullable<EventOptions<T, K>["on"]>>;

	/**
	 * The function to call when this event is emitted once
	 */
	once?: Event<T, K>["on"];

	/**
	 * @param client - The client that instantiated this event
	 * @param data - The data to use to create this event
	 */
	constructor(client: CustomClient, data: EventOptions<T, K>) {
		this.client = client;
		this.name = data.name;
		this.type = data.type;
		this.patch(data);
	}

	/**
	 * Patches this event with the given data.
	 * @param data - The data to use to create this event
	 */
	patch(data: Partial<EventOptions<T, K>>) {
		this.removeListeners();

		if (data.on !== undefined)
			this.on = data.on.bind<EventOptions<T, K>["on"]>(this);
		if (data.once !== undefined)
			this.once = data.once.bind<EventOptions<T, K>["once"]>(this);

		this.addListeners();

		return this;
	}

	/**
	 * Adds these listeners to the client.
	 */
	addListeners(): void {
		if (this.on)
			switch (this.type) {
				case EventType.APIRoyale:
					this.client.on(
						this.name as keyof ClientEvents,
						this.on as Parameters<ClientRoyale["on"]>[1]
					);
					break;
				case EventType.Discord:
					this.client.bot.on(
						this.name as keyof DiscordEvents,
						this.on as Parameters<Client["on"]>[1]
					);
					break;
				default:
			}
		if (this.once)
			switch (this.type) {
				case EventType.APIRoyale:
					this.client.once(
						this.name as keyof ClientEvents,
						this.once as Parameters<ClientRoyale["once"]>[1]
					);
					break;
				case EventType.Discord:
					this.client.bot.once(
						this.name as keyof DiscordEvents,
						this.once as Parameters<Client["once"]>[1]
					);
					break;
				default:
			}
	}

	/**
	 * Emits this event.
	 * @param args - The arguments to pass to the event
	 */
	emit(...args: Parameters<NonNullable<this["on"]>>): boolean {
		switch (this.type) {
			case EventType.APIRoyale:
				return this.client.emit(
					this.name as keyof ClientEvents,
					...(args as Parameters<ClientRoyale["emit"]>[1])
				);
			case EventType.Discord:
				return this.client.bot.emit(
					this.name as keyof DiscordEvents,
					...(args as Parameters<Client["emit"]>[1] as [])
				);
			default:
		}
		return false;
	}

	/**
	 * Removes this event.
	 */
	removeListeners(): void {
		if (this.on)
			switch (this.type) {
				case EventType.APIRoyale:
					this.client.off(
						this.name as keyof ClientEvents,
						this.on as Parameters<ClientRoyale["on"]>[1]
					);
					break;
				case EventType.Discord:
					this.client.bot.off(
						this.name as keyof DiscordEvents,
						this.on as Parameters<Client["on"]>[1]
					);
					break;
				default:
			}
		if (this.once)
			switch (this.type) {
				case EventType.APIRoyale:
					this.client.off(
						this.name as keyof ClientEvents,
						this.once as Parameters<ClientRoyale["once"]>[1]
					);
					break;
				case EventType.Discord:
					this.client.bot.off(
						this.name as keyof DiscordEvents,
						this.once as Parameters<Client["once"]>[1]
					);
					break;
				default:
			}
	}

	/**
	 * Checks if this event has the once listener attached.
	 */
	hasOnceListener(): this is this & { once: NonNullable<Event<T, K>["once"]> } {
		return Boolean(
			this.once && this.client.listeners(this.name).includes(this.once)
		);
	}

	/**
	 * Checks if this event has the on listener attached.
	 */
	hasOnListener(): this is this & { on: NonNullable<Event<T, K>["on"]> } {
		return Boolean(
			this.on && this.client.listeners(this.name).includes(this.on)
		);
	}
}

export default Event;
