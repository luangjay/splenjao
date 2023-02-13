import { Card, Price } from "@prisma/client";
import { Action, TokenColor } from "./types";
import { Tokens } from "@prisma/client";

export interface PlayerState {
  // reset: boolean;
  success: boolean;
  action: Action | null;
  card: Card | null;
  resourceTokens: Tokens;
  inventoryTokens: Tokens;
  tokens: Tokens;
  replaces: Price;
  extraTurn: boolean;
  nextTurn: boolean;
  message: string;
}
