import { Shuffle, Action, ActionType, Game } from "@prisma/client";
import { SetStateAction, useEffect, useState } from "react";
// import Card from "./Card";
import { Effect, IdxKey, Owner, TokenColor } from "../common/types";
import { TokenList, ClientState, ServerState } from "../common/interfaces";

interface TokenProps {
  game: Game;
  owner: Owner;
  effect: Effect | null;
  tokenColor: TokenColor;
  clientState: ClientState | undefined;
  setClientState: (value: SetStateAction<ClientState | undefined>) => void;
  serverState: ServerState | undefined;
  setServerState: (value: SetStateAction<ServerState | undefined>) => void;
  setMessage: (value: SetStateAction<string | undefined>) => void;
  isTurnLoading: boolean;
}

export default function TokenComponent(props: TokenProps) {
  const [disabled, setDisabled] = useState(false);

  let colorClass =
    props.tokenColor === "white"
      ? "bg-white"
      : props.tokenColor === "blue"
      ? "bg-blue-500"
      : props.tokenColor === "green"
      ? "bg-green-500"
      : props.tokenColor === "red"
      ? "bg-red-500"
      : props.tokenColor === "black"
      ? "bg-black"
      : props.tokenColor === "gold"
      ? "bg-yellow-300"
      : "";

  if (props.game.turn.playerIdx === -1 || !props.serverState) return <></>;

  const tokenCount =
    props.owner === "game" && props.serverState.tokenList
      ? props.serverState.tokenList[props.tokenColor]
      : props.owner === "action" && props.serverState.action.tokenList
      ? props.serverState.action.tokenList[props.tokenColor]
      : props.owner === "player" && props.serverState.playerToken
      ? props.serverState.playerToken[`i${props.game.turn.playerIdx}` as IdxKey][
          props.tokenColor
        ]
      : 0;

  return (
    <div className="flex">
      {tokenCount > 0 && (
        <button
          className={`aspect-square w-[30px] rounded-full border-2 ${
            !(props.isTurnLoading || disabled) ? colorClass : "bg-gray-400"
          }`}
          disabled={props.isTurnLoading || !props.effect || disabled}
          onClick={async () => {
            // const updateData = {
            //   id: "32132121",
            //   playerId: "312313",
            // };
            // if (test) test(updateData);
            updateClientToken(props);
            setDisabled(true);
            await new Promise((resolve) => {
              setTimeout(resolve, 700);
            });
            setDisabled(false);
          }}
        >
          T
        </button>
      )}
      <div>{tokenCount}</div>
    </div>
  );
}

function updateClientToken({ effect, tokenColor, ...props }: TokenProps) {
  if (!props.serverState) return;

  if (!props.serverState.action.endTurn) {
    const sumTokenColors = Object.values(
      props.serverState.action.tokenList
    ).reduce((a, b) => a + b, 0);
    if (effect === "take") {
      // TAKE TOKEN
      if (props.serverState.action.type !== null) {
        props.setMessage("You cannot take any more tokens.");
        return;
      }
      switch (sumTokenColors) {
        case 2:
          if (props.serverState.action.tokenList[tokenColor] === 1) {
            props.setMessage("You cannot take token of this color now.");
            return;
          }
          if (tokenColor === "gold") {
            props.setMessage("You cannot take gold token now.");
            return;
          }
          props.setClientState({
            effect,
            tokenColor,
            actionType: "takeThree",
            cardId: -1,
          });
          props.setMessage("Take token success.");
          return;
        case 1:
          if (props.serverState.action.tokenList.gold === 1) {
            props.setMessage("You can only reserve card now.");
            return;
          }
          if (tokenColor === "gold") {
            props.setMessage("You cannot take gold token now.");
            return;
          }
          if (props.serverState.action.tokenList[tokenColor] === 1) {
            if (props.serverState.tokenList[tokenColor] < 3) {
              props.setMessage("Not enough tokens left for double take.");
              return;
            }
            props.setClientState({
              effect,
              tokenColor,
              actionType: "takeTwo",
              cardId: -1,
            });
            props.setMessage("Take token success.");
            return;
          }
          props.setClientState({
            effect,
            tokenColor,
            actionType: null,
            cardId: -1,
          });
          props.setMessage("Take token success.");
          return;

        case 0:
          props.setClientState({
            effect,
            tokenColor,
            actionType: null,
            cardId: -1,
          });
          props.setMessage("Take token success.");
          return;
      }
      return;
    }
    if (effect === "return") {
      // RETURN TOKEN
      if ([1, 2, 3].includes(sumTokenColors)) {
        props.setClientState({
          effect,
          tokenColor,
          actionType: null,
          cardId: -1,
        });
        props.setMessage("Return token success");
        return;
      }
      return;
    }
    return;
  }

  const sumTokenColors = Object.values(
    props.serverState.playerToken[`i${props.game.turn.playerIdx}` as IdxKey]
  ).reduce((a, b) => a + b, 0);
  if (props.serverState.action.type !== "return" && sumTokenColors <= 10)
    return;
  if (effect === "take") {
    if (sumTokenColors > 10) {
      props.setClientState({
        effect,
        tokenColor,
        actionType: "return",
        cardId: -1,
      });
      props.setMessage("Return token success.");
      return;
    }
    props.setMessage("You will need to have exactly 10 tokens left!");
    return;
  }
  if (effect === "return") {
    props.setClientState({
      effect,
      tokenColor,
      actionType: null,
      cardId: -1,
    });
    props.setMessage("Take token success.");
    return;
  }
}
