import { Game } from "@prisma/client";
import { SetStateAction, useEffect, useState } from "react";
import { PlayerState, UserState } from "../common/interfaces";
import { Effect, InventoryKey, Reference, TokenColor } from "../common/types";
import TokenComponent from "./TokenComponent";

const tokens = {
  white: 0,
  blue: 0,
  green: 0,
  red: 0,
  black: 0,
  gold: 0,
};

const tokenColors = [
  "white",
  "blue",
  "green",
  "red",
  "black",
  "gold",
] as TokenColor[];

interface TokenContainerProps {
  userState: UserState;
  setUserState: (value: SetStateAction<UserState>) => void;
  playerState: PlayerState;
  setPlayerState: (value: SetStateAction<PlayerState>) => void;
  game: Game;
}

export default function TokenContainer(props: TokenContainerProps) {
  // useEffect(() => {
  //   props.setPlayerState((prev) => ({
  //     ...prev,
  //     resourceTokens: props.game ? props.game.resource.tokens : { ...tokens },
  //     playerTokens: { ...tokens },
  //     inventoryTokens:
  //       props.game && props.game.status !== "created"
  //         ? props.game[`inventory${props.game.turnIdx}` as InventoryKey].tokens
  //         : { ...tokens },
  //   }));
  // }, [props.game.turnIdx]);

  return (
    <div className="flex gap-8">
      <div>
        {tokenColors.map((tokenColor) => (
          <TokenComponent
            // owner="game"
            reference="resource"
            // effect={!props.serverState?.action.endTurn ? "take" : null}
            effect="take"
            tokenColor={tokenColor}
            {...props}
          />
        ))}
      </div>
      <div>
        {tokenColors.map((tokenColor) => (
          <TokenComponent
            reference="player"
            effect="return"
            tokenColor={tokenColor}
            {...props}
          />
        ))}
      </div>
      <div>
        {tokenColors.map((tokenColor) => (
          <TokenComponent
            reference="inventory"
            // effect={!props.serverState?.action.endTurn ? null : "take"}
            effect={null}
            tokenColor={tokenColor}
            {...props}
          />
        ))}
      </div>
      <button
        className="bg-cyan-400"
        onClick={() => {
          props.setUserState((prev) => ({
            ...prev,
            nextTurn: true,
          }));
        }}
      >
        abcd
      </button>
    </div>
  );
}
