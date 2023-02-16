import { Game, Player } from "@prisma/client";
import { SetStateAction, useEffect, useState } from "react";
import { PlayerState } from "../../common/types";
import { tokenColors, cardColors } from "../../common/constants";
import {
  TokenEffect,
  InventoryKey,
  Reference,
  TokenColor,
  CardColor,
} from "../../common/types";
import Token from "./tokens/Token";

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

  if (playerState.currentAction === null) return <></>;
  if (playerState.currentAction === "take")
    return (
      <div className="flex gap-8">
        <div>
          {tokenColors.map((tokenColor) => (
            <Token
              tokenColor={tokenColor}
              tokenEffect={!playerState.hasExtraTurn ? "take" : null}
              reference="resource"
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
    );
  if (playerState.currentAction === "purchase")
    return (
      <div className="flex gap-8">
        <div>
          <Token
            tokenColor="gold"
            tokenEffect="special"
            reference="resource"
            {...props}
          />
        </div>
        <div>
          {tokenColors.map((tokenColor) => (
            <Token
              tokenColor={tokenColor}
              tokenEffect="return"
              reference="player"
              {...props}
            />
          ))}
        </div>
        <div>
          {tokenColors.map((tokenColor) => (
            <Token
              tokenColor={tokenColor}
              tokenEffect="take"
              reference="inventory"
              // effect={!props.serverState?.action.endTurn ? null : "take"}
              {...props}
            />
          ))}
        </div>
        <div>
          {cardColors.map((cardColor) => (
            <button
              className="border-2"
              onClick={() => {
                setPlayerState((prev) => ({
                  ...prev,
                  selectedCardColor: cardColor,
                }));
              }}
            >
              {cardColor.slice(0, 2)}
            </button>
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
      </div>
    );
  return (
    <div className="flex gap-8">
      z
      <div>
        <Token
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
              isNextTurn: true,
            }));
        }}
      >
        NEXT TURN
      </button>
    </div>
  );
}
