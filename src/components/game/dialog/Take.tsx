import { Game, Player } from "@prisma/client";
import { SetStateAction, useEffect, useState } from "react";
import { PlayerState } from "../../../common/types";
import { tokenColors, cardColors } from "../../../common/constants";
import {
  TokenEffect,
  InventoryKey,
  Reference,
  TokenColor,
  CardColor,
} from "../../../common/types";
import Token from "../tokens/Token";

interface TakeProps {
  game: Game;
  player: Player;
  playerState: PlayerState;
  setPlayerState: (value: SetStateAction<PlayerState>) => void;
}

export default function Take(props: TakeProps) {
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

  if (playerState.currentAction !== "take") return <></>;
  return (
    // <div className="flex gap-8">
    //   <div>
    //     {tokenColors.map((tokenColor) => (
    //       <Token
    //         tokenColor={tokenColor}
    //         tokenEffect={!playerState.hasExtraTurn ? "take" : null}
    //         reference="resource"
    //         showCount
    //         {...props}
    //       />
    //     ))}
    //   </div>
    //   <div>
    //     {tokenColors.map((tokenColor) => (
    //       <Token
    //         tokenColor={tokenColor}
    //         tokenEffect="return"
    //         reference="player"
    //         showCount
    //         {...props}
    //       />
    //     ))}
    //   </div>
    //   <div>
    //     {tokenColors.map((tokenColor) => (
    //       <Token
    //         tokenColor={tokenColor}
    //         tokenEffect={!playerState.hasExtraTurn ? null : "take"}
    //         reference="inventory"
    //         showCount
    //         {...props}
    //       />
    //     ))}
    //   </div>
    //   <button
    //     className="bg-cyan-400"
    //     onClick={() => {
    //       if (playerState.success)
    //         setPlayerState((prev) => ({
    //           ...prev,
    //           isNextTurn: true,
    //         }));
    //     }}
    //   >
    //     NEXT TURN
    //   </button>
    //   <button
    //     className="bg-cyan-400"
    //     onClick={() => {
    //       setPlayerState((prev) => ({
    //         ...prev,
    //         hasExtraTurn: !prev.hasExtraTurn,
    //       }));
    //     }}
    //   >
    //     RETURN
    //   </button>
    // </div>
    // );
    <div className="flex w-full flex-col gap-8 sm:mx-16">
      <div className="flex gap-8">
        <div>
          {tokenColors.map((tokenColor) => (
            <Token
              tokenColor={tokenColor}
              tokenEffect={!playerState.hasExtraTurn ? "take" : null}
              reference="resource"
              showCount
              {...props}
            />
          ))}
        </div>
        <div>
          {tokenColors.map((tokenColor) => (
            <Token
              tokenColor={tokenColor}
              tokenEffect="return"
              reference="player"
              showCount
              {...props}
            />
          ))}
        </div>
        <div>
          {tokenColors.map((tokenColor) => (
            <Token
              tokenColor={tokenColor}
              tokenEffect={!playerState.hasExtraTurn ? null : "take"}
              reference="inventory"
              showCount
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
                isNextTurn: true,
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
              hasExtraTurn: !prev.hasExtraTurn,
            }));
          }}
        >
          RETURN
        </button>
      </div>
    </div>
  );
}
