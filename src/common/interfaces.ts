import {
  Action,
  ActionType,
  PlayerCard,
  PlayerTile,
  PlayerToken,
} from "@prisma/client";
import { TokenColor } from "./types";

export interface TokenList {
  white: number;
  blue: number;
  green: number;
  red: number;
  black: number;
  gold: number;
}

export interface ClientState {
  color?: TokenColor | null;
  take?: boolean | null;
  type?: ActionType | null;
  cardId?: number;
}

export interface ServerState {
  tokenList: TokenList;
  action: Action;
  playerCard: PlayerCard;
  playerTile: PlayerTile;
  playerToken: PlayerToken;
}
