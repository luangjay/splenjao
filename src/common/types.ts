export type CardColor = "white" | "blue" | "green" | "red" | "black";

export type TokenColor = "white" | "blue" | "green" | "red" | "black" | "gold";

export type Action = "take" | "purchase" | "reserve";

export type Reference = "resource" | "player" | "inventory";

export type Effect = "take" | "return";

export type InventoryKey =
  | "inventory0"
  | "inventory1"
  | "inventory2"
  | "inventory3";
