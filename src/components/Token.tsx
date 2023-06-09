import { Game, Player, Price, Tokens } from "@prisma/client";
import { MouseEvent, SetStateAction, useEffect, useState } from "react";
// import Card from "./Card";
import {
  TokenEffect,
  InventoryKey,
  Reference,
  TokenColor,
  CardColor,
} from "../common/types";
import { PlayerState } from "../common/types";
import {
  compPrice,
  defaultTokens,
  opPrice,
  opPriceWColor,
} from "../common/constants";
import { api } from "../utils/api";

interface TokenIconProps {
  className?: string | undefined;
  flexCol?: boolean;
}

export function TokenIcon({ className, flexCol = false }: TokenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height={!flexCol ? "40px" : "36px"}
      width={!flexCol ? "40px" : "36px"}
      className={`drop-shadow-lg ${className || "fill-slate-50"}`}
    >
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-14.243L7.757 12 12 16.243 16.243 12 12 7.757z" />
    </svg>
  );
}

interface TokenProps {
  game: Game;
  player: Player;
  tokenColor: TokenColor;
  tokenEffect: TokenEffect | null;
  reference: Reference;
  playerState: PlayerState;
  setPlayerState: (value: SetStateAction<PlayerState>) => void;
  colorToReplace?: CardColor;
  showCount?: boolean;
  flexCol?: boolean;
  fixed?: boolean;
}

export default function Token({
  game,
  player,
  tokenColor,
  tokenEffect,
  reference,
  playerState,
  setPlayerState,
  colorToReplace,
  showCount,
  flexCol = false,
  fixed = false,
}: TokenProps) {
  const [disabled, setDisabled] = useState(false);
  const playerTurn = player.id === game.playerIds[game.turnIdx];

  const colorClass =
    tokenColor === "white"
      ? `fill-white ${tokenEffect && "cursor-pointer hover:fill-gray-100"}`
      : tokenColor === "blue"
      ? `fill-blue-500 ${tokenEffect && "cursor-pointer hover:fill-blue-600"}`
      : tokenColor === "green"
      ? `fill-green-500 ${tokenEffect && "cursor-pointer hover:fill-green-600"}`
      : tokenColor === "red"
      ? `fill-red-500 ${tokenEffect && "cursor-pointer hover:fill-red-600"}`
      : tokenColor === "black"
      ? `fill-gray-800 ${tokenEffect && "cursor-pointer hover:fill-black"}`
      : tokenColor === "gold"
      ? `fill-yellow-300 ${
          tokenEffect && "cursor-pointer hover:fill-yellow-400"
        }`
      : "";

  const tokenCount =
    // game.status === "created" ||
    reference === "resource"
      ? fixed
        ? game.resource.tokens[tokenColor]
        : playerState.resourceTokens[tokenColor]
      : reference === "inventory"
      ? game.status !== "created"
        ? playerState.inventoryTokens[tokenColor]
        : 0
      : playerState.playerTokens[tokenColor];

  if (tokenCount === 0 && flexCol) return <></>;
  if (
    tokenCount === 0 ||
    (colorToReplace &&
      tokenColor === "gold" &&
      reference === "player" &&
      playerState.priceToReplace[colorToReplace] === 0)
  )
    return (
      <div
        className={
          !showCount ? "-z-50 h-[40px] w-[64px]" : "-z-50 h-[40px] w-[64px]"
        }
      ></div>
    );
  return (
    <div
      className={`flex select-none items-center text-slate-600 ${
        showCount && !flexCol && "w-[64px]"
      } ${flexCol && "h-[56px] flex-col"}`}
    >
      <button
        className={`${tokenEffect} ${
          playerTurn && showCount && !flexCol && "cursor-pointer"
        }`}
        disabled={!tokenEffect}
        onClick={(e) => {
          if (!tokenEffect) return;
          e.stopPropagation();
          setDisabled(true);
          setPlayerTokens({
            game,
            player,
            tokenColor,
            tokenEffect,
            reference,
            playerState,
            setPlayerState,
            colorToReplace,
          });
          setDisabled(false);
        }}
      >
        <TokenIcon className={colorClass} flexCol={flexCol} />
      </button>
      {showCount && `${!flexCol ? "×" : ""}${tokenCount}`}
    </div>
  );
}

function setPlayerTokens({
  game,
  player,
  tokenColor,
  tokenEffect,
  reference,
  playerState,
  setPlayerState,
  colorToReplace,
}: TokenProps) {
  // ACTION: TAKE
  if (playerState.currentAction === "take") {
    // if (playerState.action === null) {

    // NORMAL TURN
    if (!playerState.hasExtraTurn) {
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
  if (playerState.currentAction === "purchase") {
    // CLICK TO RESERVE
    if (tokenEffect === "special") {
      if (tokenColor === "gold") {
        if (playerState.playerTokens.gold >= 3) {
          setMessage(setPlayerState, "Unable to take more than 3 gold tokens.");
          return;
        }
        setPlayerState((prev) => ({
          ...prev,
          success: true,
          currentAction: "reserve",
          resourceTokens: game ? game.resource.tokens : { ...defaultTokens },
          inventoryTokens:
            game && game.status !== "created"
              ? game[`inventory${game.turnIdx}` as InventoryKey].tokens
              : { ...defaultTokens },
          playerTokens: { ...defaultTokens, gold: 1 },
        }));
        setMessage(setPlayerState, "Reserving.");
        return;
      }
      return;
    }

    if (
      !playerState.selectedCard ||
      !playerState.selectedCardColor ||
      (tokenColor !== "gold" && tokenColor !== playerState.selectedCardColor)
    ) {
      return;
    }

    const { gold: _, ...price } = playerState.playerTokens;
    const replacedPrice = opPrice(
      "increment",
      price,
      playerState.priceToReplace
    );
    const discountedPrice = opPrice(
      "decrement",
      playerState.selectedCard.price,
      game[`inventory${game.turnIdx}` as InventoryKey].discount
    );

    // alert(JSON.stringify(discountedPrice));

    // TAKE TOKEN
    if (tokenEffect === "take") {
      if (playerState.success) {
        setMessage(setPlayerState, "Requirements satisfied.");
        return;
      }
      if (
        replacedPrice[playerState.selectedCardColor] >=
        discountedPrice[playerState.selectedCardColor]
      ) {
        setMessage(setPlayerState, "exceedzz");
        return;
      }
      // TODO: BUY WITH GOLD TOKEN
      if (tokenColor === "gold") {
        // if (!compPriceEmpty(discountedPrice, tokens, inventoryTokens)) {
        //   setMessage(setPlayerState, "Use normal tokens first.");
        //   return;
        // }
        // TODO: VALIDATE
        setPlayerState((prev) => ({
          ...prev,
          priceToReplace: prev.selectedCardColor
            ? {
                ...prev.priceToReplace,
                [prev.selectedCardColor]:
                  prev.priceToReplace[prev.selectedCardColor] + 1,
              }
            : prev.priceToReplace,
        }));
        exchangeToken(
          setPlayerState,
          "gold",
          "inventory",
          "player",
          playerState.selectedCardColor
            ? compPrice(
                replacedPrice,
                opPriceWColor(
                  "decrement",
                  discountedPrice,
                  playerState.selectedCardColor
                )
              )
            : false
        );
        return;
      }

      // BUY WITH NORMAL TOKENS

      exchangeToken(
        setPlayerState,
        tokenColor,
        "inventory",
        "player",
        compPrice(
          replacedPrice,
          opPriceWColor("decrement", discountedPrice, tokenColor)
        )
      );
      setMessage(setPlayerState, "Take token success.");
      return;
    }
    if (tokenEffect === "return") {
      if (tokenColor === "gold") {
        if (colorToReplace !== playerState.selectedCardColor) {
          return;
        }
        setPlayerState((prev) => ({
          ...prev,
          priceToReplace: prev.selectedCardColor
            ? {
                ...prev.priceToReplace,
                [prev.selectedCardColor]:
                  prev.priceToReplace[prev.selectedCardColor] - 1,
              }
            : prev.priceToReplace,
        }));
        exchangeToken(setPlayerState, "gold", "player", "inventory", false);
        // exchangeToken(setPlayerState, tokenColor, "player", "inventory", false);
        // setMessage(setPlayerState, `Take gold token success. `);
        return;
      }
      // if (playerState.tokens.gold > 0) {
      //   setMessage(setPlayerState, "Return gold tokens first.");
      //   return;
      // }
      exchangeToken(setPlayerState, tokenColor, "player", "inventory", false);
      setMessage(setPlayerState, "Return token success.");
      return;
    }
    return;
  }
  // ACTION: RESERVE
  if (playerState.currentAction === "reserve") {
    if (playerState.hasExtraTurn) {
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
          exchangeToken(
            setPlayerState,
            tokenColor,
            "inventory",
            "player",
            true
          );
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
    success,
    [`${from}Tokens`]: {
      ...prev[`${from}Tokens`],
      [tokenColor]: prev[`${from}Tokens`][tokenColor] - 1,
    },
    [`${to}Tokens`]: {
      ...prev[`${to}Tokens`],
      [tokenColor]: prev[`${to}Tokens`][tokenColor] + 1,
    },
  }));
}

export function compPriceEmpty(
  cardPrice: Price,
  tokens: Price,
  inventoryTokens: Price
): boolean {
  // alert(`${JSON.stringify(price)} xxxx ${JSON.stringify(cardPrice)}`);
  return (["white", "blue", "green", "red", "black"] as CardColor[]).every(
    (color) => {
      //price[tokenColor] >= cardPrice[tokenColor]
      if (
        cardPrice[color] === 0 ||
        inventoryTokens[color] === 0 ||
        tokens[color] === cardPrice[color]
        // price[color] > cardPrice[color]
      )
        return true;
      return false;
    }
  );
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
