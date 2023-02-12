import { Game, Player, Price, Tokens } from "@prisma/client";
import { SetStateAction, useEffect, useState } from "react";
// import Card from "./Card";
import {
  TokenEffect,
  InventoryKey,
  Reference,
  TokenColor,
} from "../common/types";
import { PlayerState } from "../common/interfaces";
import { compPrice, opPrice, opPriceWColor } from "../common/functions";
import { api } from "../utils/api";

const tokens = {
  white: 0,
  blue: 0,
  green: 0,
  red: 0,
  black: 0,
  gold: 0,
};
interface TokenComponentProps {
  game: Game;
  player: Player;
  tokenColor: TokenColor;
  reference: Reference;
  tokenEffect: TokenEffect | null;
  playerState: PlayerState;
  setPlayerState: (value: SetStateAction<PlayerState>) => void;
}

export default function TokenComponent({
  game,
  player,
  tokenColor,
  tokenEffect,
  reference,
  playerState,
  setPlayerState,
}: TokenComponentProps) {
  const [disabled, setDisabled] = useState(false);

  const colorClass =
    tokenColor === "white"
      ? "bg-white"
      : tokenColor === "blue"
      ? "bg-blue-500"
      : tokenColor === "green"
      ? "bg-green-500"
      : tokenColor === "red"
      ? "bg-red-500"
      : tokenColor === "black"
      ? "bg-black"
      : tokenColor === "gold"
      ? "bg-yellow-300"
      : "";

  const tokenCount =
    // game.status === "created" ||
    reference === "resource"
      ? playerState.resourceTokens[tokenColor]
      : reference === "inventory"
      ? game.status !== "created"
        ? playerState.inventoryTokens[tokenColor]
        : 0
      : playerState.playerTokens[tokenColor];

  return (
    <div className="flex">
      {tokenCount > 0 && (
        <button
          className={`aspect-square w-[30px] rounded-full border-2 ${
            !disabled ? colorClass : "bg-gray-400"
          }`}
          disabled={disabled}
          onClick={
            /*async*/ () => {
              // const updateData = {
              //   id: "32132121",
              //   playerId: "312313",
              // };
              // if (test) test(updateData);
              // updateClientToken(props);
              // alert("322");
              setPlayerToken({
                game,
                player,
                tokenColor,
                tokenEffect,
                reference,
                playerState,
                setPlayerState,
              });
              setDisabled(true);
              // await new Promise((resolve) => {
              //   setTimeout(resolve, 700);
              // });
              setDisabled(false);
            }
          }
        >
          T
        </button>
      )}
      <div>{tokenCount}</div>
    </div>
  );
}

async function setPlayerToken({
  game,
  player,
  tokenColor,
  tokenEffect,
  reference,
  playerState,
  setPlayerState,
}: TokenComponentProps) {
  // ACTION: TAKE
  if (playerState.action === "take") {
    // if (playerState.action === null) {

    // NORMAL TURN
    if (!playerState.extraTurn) {
      if (tokenColor === "gold") {
        setMessage(setPlayerState, "Unable to take any gold tokens.");
        return;
      }
      const sumTokenColors = Object.values(playerState.playerTokens).reduce(
        (a, b) => a + b,
        0
      );
      // TAKE TOKEN
      if (tokenEffect === "take") {
        if (playerState.success) {
          setMessage(setPlayerState, "Unable to take any more tokens.");
          return;
        }

        switch (sumTokenColors) {
          case 2:
            if (playerState.playerTokens[tokenColor] === 1) {
              setMessage(
                setPlayerState,
                "Unable to take token of this color now."
              );
              return;
            }
            exchangeToken(
              setPlayerState,
              tokenColor,
              "resource",
              "player",
              true
            );
            setMessage(setPlayerState, "Take token success.");
            return;
          case 1:
            if (playerState.playerTokens[tokenColor] === 1) {
              if (game.resource.tokens[tokenColor] < 4) {
                setMessage(
                  setPlayerState,
                  "Not enough tokens left for double take."
                );
                return;
              }
              exchangeToken(
                setPlayerState,
                tokenColor,
                "resource",
                "player",
                true
              );
              setMessage(setPlayerState, "Take token success.");
              return;
            }
            exchangeToken(
              setPlayerState,
              tokenColor,
              "resource",
              "player",
              false
            );
            setMessage(setPlayerState, "Take token success.");
            return;
          case 0:
            exchangeToken(
              setPlayerState,
              tokenColor,
              "resource",
              "player",
              false
            );
            setMessage(setPlayerState, "Take token success.");
            return;
        }
        return;
      }
      // RETURN TOKEN
      if (tokenEffect === "return") {
        if ([1, 2, 3].includes(sumTokenColors)) {
          exchangeToken(
            setPlayerState,
            tokenColor,
            "player",
            "resource",
            false
          );
          setMessage(setPlayerState, "Return token success.");
          return;
        }
        return;
      }
      return;
    }
    // EXTRA TURN
    const sumTokenColors = Object.values(playerState.inventoryTokens).reduce(
      (a, b) => a + b,
      0
    );
    if (tokenEffect === "take") {
      if (playerState.success) {
        setMessage(setPlayerState, "Unable to return any more tokens.");
        return;
      }
      if (sumTokenColors === 11) {
        exchangeToken(setPlayerState, tokenColor, "inventory", "player", true);
        setMessage(setPlayerState, "Return token success.");
        return;
      }
      exchangeToken(setPlayerState, tokenColor, "inventory", "player", false);
      setMessage(setPlayerState, "Return token success.");
      return;
    }
    if (tokenEffect === "return") {
      exchangeToken(setPlayerState, tokenColor, "player", "inventory", false);
      setMessage(setPlayerState, "Take token success.");
      return;
    }
    return;
  }
  // ACTION: PURCHASE
  if (playerState.action === "purchase") {
    if (!playerState.playerCard) return;
    const { gold: _, ...playerTokens } = playerState.playerTokens;
    const discountedPrice = opPrice(
      "decrement",
      playerState.playerCard.price,
      game[`inventory${game.turnIdx}` as InventoryKey].discount
    );
    if (tokenEffect === "special") {
      if (tokenColor === "gold") {
        setPlayerState((prev) => ({
          ...prev,
          success: true,
          action: "reserve",
          resourceTokens: game ? game.resource.tokens : { ...tokens },
          playerTokens: { ...tokens, gold: 1 },
          inventoryTokens:
            game && game.status !== "created"
              ? game[`inventory${game.turnIdx}` as InventoryKey].tokens
              : { ...tokens },
        }));
        setMessage(setPlayerState, "Reserving.");
        return;
      }
      return;
    }
    // alert(JSON.stringify(discountedPrice));
    // TAKE TOKEN
    if (tokenEffect === "take") {
      if (tokenColor === "gold") {
        // TODO: BUY WITH GOLD TOKEN
        setMessage(setPlayerState, "Reserving.");
        return;
      }
      // exchangeToken(setPlayerState, tokenColor, "player", "inventory", false);
      if (playerTokens[tokenColor] >= discountedPrice[tokenColor]) {
        setMessage(setPlayerState, "exceedzz");
        return;
      }
      if (
        compPrice(
          playerTokens,
          opPriceWColor("decrement", discountedPrice, tokenColor)
        )
      ) {
        exchangeToken(setPlayerState, tokenColor, "inventory", "player", true);
        setMessage(setPlayerState, "maybezz");
        return;
      }
      exchangeToken(setPlayerState, tokenColor, "inventory", "player", false);
      // setMessage(setPlayerState, "Take token success.");
      return;
    }
    if (tokenEffect === "return") {
      // exchangeToken(setPlayerState, tokenColor, "player", "inventory", false);
      exchangeToken(setPlayerState, tokenColor, "player", "inventory", false);
      setMessage(setPlayerState, "Return token success.");
      return;
    }
    return;
  }
  // ACTION: RESERVE
  if (tokenEffect === "special") {
    if (tokenColor === "gold") {
      setPlayerState((prev) => ({
        ...prev,
        success: false,
        action: "purchase",
        resourceTokens: game ? game.resource.tokens : { ...tokens },
        playerTokens: { ...tokens },
        inventoryTokens:
          game && game.status !== "created"
            ? game[`inventory${game.turnIdx}` as InventoryKey].tokens
            : { ...tokens },
      }));
      setMessage(setPlayerState, "Purchasing.");
      return;
    }
    return;
  }
}

async function exchangeToken(
  setPlayerState: (value: SetStateAction<PlayerState>) => void,
  tokenColor: TokenColor,
  from: Reference,
  to: Reference,
  success: boolean
) {
  setPlayerState((prev) => ({
    ...prev,
    [`${from}Tokens`]: {
      ...prev[`${from}Tokens`],
      [tokenColor]: prev[`${from}Tokens`][tokenColor] - 1,
    },
    [`${to}Tokens`]: {
      ...prev[`${to}Tokens`],
      [tokenColor]: prev[`${to}Tokens`][tokenColor] + 1,
    },
    success,
  }));
}

// async function returnToken(
//   setPlayerState: (value: SetStateAction<PlayerState>) => void,
//   reference: Reference,
//   tokenColor: TokenColor,
//   success: boolean
// ) {
//   setPlayerState((prev) => ({
//     ...prev,
//     tokens: {
//       ...prev.playerTokens,
//       [tokenColor]: prev.playerTokens[tokenColor] - 1,
//     },
//     success,
//   }));
// }

async function setMessage(
  setPlayerState: (value: SetStateAction<PlayerState>) => void,
  message: string
) {
  setPlayerState((prev) => ({
    ...prev,
    message,
  }));
}

// function updateClientToken({ effect, tokenColor, ...props }: TokenProps) {
//   if (!serverState) return;

//   if (!serverState.action.endTurn) {
//     const sumTokenColors = Object.values(serverState.action.tokenList).reduce(
//       (a, b) => a + b,
//       0
//     );
//     if (effect === "take") {
//       // TAKE TOKEN
//       if (serverState.action.type !== null) {
//         setMessage("You cannot take any more tokens.");
//         return;
//       }
//       switch (sumTokenColors) {
//         case 2:
//           if (serverState.action.tokenList[tokenColor] === 1) {
//             setMessage("You cannot take token of this color now.");
//             return;
//           }
//           if (tokenColor === "gold") {
//             setMessage("You cannot take gold token now.");
//             return;
//           }
//           setClientState({
//             effect,
//             tokenColor,
//             actionType: "takeThree",
//             cardId: -1,
//           });
//           setMessage("Take token success.");
//           return;
//         case 1:
//           if (serverState.action.tokenList.gold === 1) {
//             setMessage("You can only reserve card now.");
//             return;
//           }
//           if (tokenColor === "gold") {
//             setMessage("You cannot take gold token now.");
//             return;
//           }
//           if (serverState.action.tokenList[tokenColor] === 1) {
//             if (serverState.tokenList[tokenColor] < 3) {
//               setMessage("Not enough tokens left for double take.");
//               return;
//             }
//             setClientState({
//               effect,
//               tokenColor,
//               actionType: "takeTwo",
//               cardId: -1,
//             });
//             setMessage("Take token success.");
//             return;
//           }
//           setClientState({
//             effect,
//             tokenColor,
//             actionType: null,
//             cardId: -1,
//           });
//           setMessage("Take token success.");
//           return;

//         case 0:
//           setClientState({
//             effect,
//             tokenColor,
//             actionType: null,
//             cardId: -1,
//           });
//           setMessage("Take token success.");
//           return;
//       }
//       return;
//     }
//     if (effect === "return") {
//       // RETURN TOKEN
//       if ([1, 2, 3].includes(sumTokenColors)) {
//         setClientState({
//           effect,
//           tokenColor,
//           actionType: null,
//           cardId: -1,
//         });
//         setMessage("Return token success");
//         return;
//       }
//       return;
//     }
//     return;
//   }

//   const sumTokenColors = Object.values(
//     serverState.playerToken[`i${game.turn.playerIdx}` as IdxKey]
//   ).reduce((a, b) => a + b, 0);
//   if (serverState.action.type !== "return" && sumTokenColors <= 10) return;
//   if (effect === "take") {
//     if (sumTokenColors > 10) {
//       setClientState({
//         effect,
//         tokenColor,
//         actionType: "return",
//         cardId: -1,
//       });
//       setMessage("Return token success.");
//       return;
//     }
//     setMessage("You will need to have exactly 10 tokens left!");
//     return;
//   }
//   if (effect === "return") {
//     setClientState({
//       effect,
//       tokenColor,
//       actionType: null,
//       cardId: -1,
//     });
//     setMessage("Take token success.");
//     return;
//   }
// }
