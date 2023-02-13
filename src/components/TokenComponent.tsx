import { Game, Player, Price, Tokens } from "@prisma/client";
import { SetStateAction, useEffect, useState } from "react";
// import Card from "./Card";
import {
  TokenEffect,
  InventoryKey,
  Reference,
  TokenColor,
  CardColor,
} from "../common/types";
import { PlayerState } from "../common/interfaces";
import { compPrice, opPrice, opPriceWColor } from "../common/functions";
import { api } from "../utils/api";

const allTokens = {
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
      : playerState.tokens[tokenColor];

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
              setPlayerTokens({
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

async function setPlayerTokens({
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
      const sumTokenColors = Object.values(playerState.tokens).reduce(
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
            if (playerState.tokens[tokenColor] === 1) {
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
            if (playerState.tokens[tokenColor] === 1) {
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
    if (!playerState.card) {
      return;
    }
    const { gold: x1, ...tokens } = playerState.tokens;
    const { gold: x2, ...inventoryTokens } = playerState.inventoryTokens;
    const replacedTokens = opPrice("increment", tokens, playerState.replaces);
    const discountedPrice = opPrice(
      "decrement",
      playerState.card.price,
      game[`inventory${game.turnIdx}` as InventoryKey].discount
    );
    if (tokenEffect === "special") {
      if (tokenColor === "gold") {
        if (playerState.tokens.gold >= 3) {
          setMessage(setPlayerState, "Unable to take more than 3 gold tokens.");
          return;
        }
        setPlayerState((prev) => ({
          ...prev,
          success: true,
          action: "reserve",
          resourceTokens: game ? game.resource.tokens : { ...allTokens },
          inventoryTokens:
            game && game.status !== "created"
              ? game[`inventory${game.turnIdx}` as InventoryKey].tokens
              : { ...allTokens },
          tokens: { ...allTokens, gold: 1 },
        }));
        setMessage(setPlayerState, "Reserving.");
        return;
      }
      return;
    }
    // alert(JSON.stringify(discountedPrice));

    // TAKE TOKEN
    if (tokenEffect === "take") {
      if (playerState.success) {
        setMessage(setPlayerState, "Requirements satisfied.");
        return;
      }
      // TODO: BUY WITH GOLD TOKEN
      if (tokenColor === "gold") {
        if (playerState.tokens.gold >= 3) {
          setMessage(setPlayerState, "Unable to take more than 3 gold tokens.");
          return;
        }
        if (!compPriceEmpty(discountedPrice, tokens, inventoryTokens)) {
          setMessage(setPlayerState, "Use normal tokens first.");
          return;
        }
        // TODO: VALIDATE
        exchangeGoldtoken(
          playerState,
          setPlayerState,
          replacedTokens,
          discountedPrice,
          false
        );
        // exchangeToken(setPlayerState, tokenColor, "inventory", "player", false);
        // setMessage(setPlayerState, `Take gold token success. `);
        return;
      }

      // BUY WITH NORMAL TOKENS
      // exchangeToken(setPlayerState, tokenColor, "player", "inventory", false);
      if (replacedTokens[tokenColor] >= discountedPrice[tokenColor]) {
        setMessage(setPlayerState, "exceedzz");
        return;
      }
      if (
        compPrice(
          replacedTokens,
          opPriceWColor("decrement", discountedPrice, tokenColor)
        )
      ) {
        exchangeToken(setPlayerState, tokenColor, "inventory", "player", true);
        setMessage(setPlayerState, "maybezz");
        return;
      }
      exchangeToken(setPlayerState, tokenColor, "inventory", "player", false);
      setMessage(setPlayerState, "Take token success.");
      return;
    }
    if (tokenEffect === "return") {
      if (tokenColor === "gold") {
        if (!compPriceEmpty(discountedPrice, tokens, inventoryTokens)) {
          setMessage(setPlayerState, "Use normal tokens first.");
          return;
        }
        // TODO: VALIDATE
        exchangeGoldtoken(
          playerState,
          setPlayerState,
          replacedTokens,
          discountedPrice,
          true
        );
        // exchangeToken(setPlayerState, tokenColor, "player", "inventory", false);
        // setMessage(setPlayerState, `Take gold token success. `);
        return;
      }
      if (playerState.tokens.gold > 0) {
        setMessage(setPlayerState, "Return gold tokens first.");
        return;
      }
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
        resourceTokens: game ? game.resource.tokens : { ...allTokens },
        inventoryTokens:
          game && game.status !== "created"
            ? game[`inventory${game.turnIdx}` as InventoryKey].tokens
            : { ...allTokens },
        tokens: { ...allTokens },
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
  type name = "resourceTokens" | "inventoryTokens" | "tokens";
  const fromName: name = from === "player" ? "tokens" : `${from}Tokens`;
  const toName: name = to === "player" ? "tokens" : `${to}Tokens`;
  setPlayerState((prev) => ({
    ...prev,
    [fromName]: {
      ...prev[fromName],
      [tokenColor]: prev[fromName][tokenColor] - 1,
    },
    [toName]: {
      ...prev[toName],
      [tokenColor]: prev[toName][tokenColor] + 1,
    },
    success,
  }));
}

function exchangeGoldtoken(
  playerState: PlayerState,
  setPlayerState: (value: SetStateAction<PlayerState>) => void,
  price: Price,
  cardPrice: Price,
  inverse: boolean
) {
  //const replacedTokens = opPrice("increment", tokens, playerState.replaces);
  // const result = { ...price };
  if (!inverse) {
    (["white", "blue", "green", "red", "black"] as CardColor[]).every(
      (color) => {
        if (price[color] < cardPrice[color]) {
          // alert(
          //   `${JSON.stringify(price)} xxx ${JSON.stringify(
          //     cardPrice
          //   )} xxx ${compPrice(
          //     price,
          //     opPriceWColor("decrement", cardPrice, color)
          //   )}`
          // );
          setPlayerState((prev) => ({
            ...prev,
            replaces: {
              ...prev.replaces,
              [color]: prev.replaces[color] + 1,
            },
          }));
          exchangeToken(
            setPlayerState,
            "gold",
            "inventory",
            "player",
            compPrice(price, opPriceWColor("decrement", cardPrice, color))
          );
          // alert(JSON.stringify(playerState));
          // if (
          //   compPrice(
          //     price,
          //     opPriceWColor("decrement", cardPrice, color)
          //   )
          // ) {
          //   exchangeToken(setPlayerState, tokenColor, "inventory", "player", true);
          //   setMessage(setPlayerState, "maybezz");
          //   return;
          // }
          return false;
        }
        return true;
      }
    );
  } else {
    (["black", "red", "green", "blue", "white"] as CardColor[]).every(
      (color) => {
        if (playerState.replaces[color] > 0) {
          setPlayerState((prev) => ({
            ...prev,
            replaces: {
              ...prev.replaces,
              [color]: prev.replaces[color] - 1,
            },
          }));
          exchangeToken(setPlayerState, "gold", "player", "inventory", false);
          return false;
        }
        return true;
      }
    );
  }
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
