import { Game, Player } from "@prisma/client";
import { SetStateAction, useEffect, useState } from "react";
import { PlayerState } from "../../../common/types";
import {
  tokenColors,
  cardColors,
  opTokenCount,
  defaultTokens,
} from "../../../common/constants";
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
  const { game, player, playerState, setPlayerState } = props;

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
    <div className="flex w-full flex-col items-center justify-center gap-8 sm:mx-16">
      <div className="flex w-full flex-col gap-1">
        <div className="">Available tokens</div>
        <hr className="h-[2px] w-full bg-gray-700"></hr>
        <div className="flex h-max min-h-[40px] w-full justify-between">
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
      </div>
      <div className="flex w-full flex-col gap-1">
        <div className="">Action tokens</div>
        <hr className="h-[2px] w-full bg-gray-700"></hr>
        <div className="flex min-h-[40px] w-full justify-between">
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
      </div>
      <div className="flex w-full flex-col gap-1">
        <div className="">Your tokens</div>
        <hr className="h-[0.5px] w-full bg-gray-700"></hr>
        <div className="flex min-h-[40px] w-full justify-between">
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
      </div>

      <button
        className="w-1/4 rounded-md bg-[#28a745] py-2 font-semibold text-gray-100"
        onClick={() => {
          if (playerState.success) {
            const tokens = !playerState.hasExtraTurn
              ? opTokenCount(
                  "increment",
                  game[`inventory${game.turnIdx}` as InventoryKey].tokens,
                  playerState.playerTokens
                )
              : playerState.inventoryTokens;
            const sumTokenColors = Object.values(tokens).reduce(
              (a, b) => a + b,
              0
            );
            if (sumTokenColors > 10) {
              setPlayerState((prev) => ({
                ...prev,
                success: false,
                hasExtraTurn: true,
                message: "Return tokens to 10.",
                playerTokens: defaultTokens,
                inventoryTokens: tokens,
              }));
              return;
            }
            setPlayerState((prev) => ({
              ...prev,
              isNextTurn: true,
            }));
          }
        }}
      >
        TAKE
      </button>
    </div>
  );
}
