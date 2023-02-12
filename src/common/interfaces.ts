import { Card } from "@prisma/client";
import { Action, TokenColor } from "./types";
import { Tokens } from "@prisma/client";

export interface PlayerState {
  // reset: boolean;
  success: boolean;
  action: Action | null;
  resourceTokens: Tokens;
  playerTokens: Tokens;
  inventoryTokens: Tokens;
  playerCard: Card | null;
  extraTurn: boolean;
  nextTurn: boolean;
  message: string;
}
