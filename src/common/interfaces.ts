import {} from "@prisma/client";
import { Action, TokenColor } from "./types";
import { Tokens } from "@prisma/client";

export interface PlayerState {
  success: boolean;
  action: Action | null;
  cardId: number | null;
  resourceTokens: Tokens;
  playerTokens: Tokens;
  inventoryTokens: Tokens;
}

export interface UserState {
  validTab: boolean;
  countdown: number;
  nextTurn: boolean;
  updating: boolean;
  message: string;
}
