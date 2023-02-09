import {
  Action,
  ActionType,
  PlayerCard,
  PlayerReserve,
  PlayerTile,
  PlayerToken,
} from "@prisma/client";
import { Effect, Owner, TokenColor } from "./types";

export interface TokenList {
  white: number;
  blue: number;
  green: number;
  red: number;
  black: number;
  gold: number;
}

export interface ClientState {
  effect: Effect | null;
  actionType: ActionType | null;
  tokenColor?: TokenColor | null;
  cardId?: number;
}

export interface ServerState {
  action: Action;
  tokenList: TokenList;
  playerCard: PlayerCard;
  playerTile: PlayerTile;
  playerToken: PlayerToken;
  playerReserve: PlayerReserve;
}
