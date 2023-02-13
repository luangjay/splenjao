import { Game, Player } from "@prisma/client";
import { SetStateAction, useEffect, useState } from "react";
import { PlayerState } from "../common/interfaces";
import {
  TokenEffect,
  InventoryKey,
  Reference,
  TokenColor,
} from "../common/types";
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
  game: Game;
  player: Player;
  playerState: PlayerState;
  setPlayerState: (value: SetStateAction<PlayerState>) => void;
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
  const { playerState, setPlayerState } = props;

  if (playerState.action === null) return <></>;
  if (playerState.action === "take")
    return (
      <div className="flex gap-8">
        <div>
          {tokenColors.map((tokenColor) => (
            <TokenComponent
              // owner="game"
              tokenColor={tokenColor}
              tokenEffect={!playerState.extraTurn ? "take" : null}
              reference="resource"
              // effect={!props.serverState?.action.endTurn ? "take" : null}
              {...props}
            />
          ))}
        </div>
        <div>
          {tokenColors.map((tokenColor) => (
            <TokenComponent
              tokenColor={tokenColor}
              tokenEffect="return"
              reference="player"
              {...props}
            />
          ))}
        </div>
        <div>
          {tokenColors.map((tokenColor) => (
            <TokenComponent
              tokenColor={tokenColor}
              tokenEffect={!playerState.extraTurn ? null : "take"}
              reference="inventory"
              // effect={!props.serverState?.action.endTurn ? null : "take"}
              {...props}
            />
          ))}
        </div>
        <button
          className="bg-cyan-400"
          onClick={() => {
            if (playerState.success)
              setPlayerState((prev) => ({
                ...prev,
                nextTurn: true,
              }));
          }}
        >
          NEXT TURN
        </button>
        <button
          className="bg-cyan-400"
          onClick={() => {
            setPlayerState((prev) => ({
              ...prev,
              extraTurn: !prev.extraTurn,
            }));
          }}
        >
          RETURN
        </button>
      </div>
    );
  if (playerState.action === "purchase")
    return (
      <div className="flex gap-8">
        <div>
          <TokenComponent
            tokenColor="gold"
            tokenEffect="special"
            reference="resource"
            {...props}
          />
        </div>
        <div>
          {tokenColors.map((tokenColor) => (
            <TokenComponent
              tokenColor={tokenColor}
              tokenEffect="return"
              reference="player"
              {...props}
            />
          ))}
        </div>
        <div>
          {tokenColors.map((tokenColor) => (
            <TokenComponent
              tokenColor={tokenColor}
              tokenEffect="take"
              reference="inventory"
              // effect={!props.serverState?.action.endTurn ? null : "take"}
              {...props}
            />
          ))}
        </div>
        <button
          className="bg-cyan-400"
          onClick={() => {
            if (playerState.success)
              setPlayerState((prev) => ({
                ...prev,
                nextTurn: true,
              }));
          }}
        >
          NEXT TURN
        </button>
      </div>
    );
  return (
    <div className="flex gap-8">z
      <div>
        <TokenComponent
          tokenColor="gold"
          tokenEffect="special"
          reference="resource"
          {...props}
        />
      </div>
      {/* <div>
        <TokenComponent
          tokenColor="gold"
          tokenEffect="return"
          reference="player"
          {...props}
        />
      </div> */}
      <button
        className="bg-cyan-400"
        onClick={() => {
          if (playerState.success)
            setPlayerState((prev) => ({
              ...prev,
              nextTurn: true,
            }));
        }}
      >
        NEXT TURN
      </button>
    </div>
  );
}
