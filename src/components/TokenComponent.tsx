import { Game, Tokens } from "@prisma/client";
import { SetStateAction, useEffect, useState } from "react";
// import Card from "./Card";
import { Effect, InventoryKey, Reference, TokenColor } from "../common/types";
import { UserState, PlayerState } from "../common/interfaces";

interface TokenComponentProps {
  userState: UserState;
  setUserState: (value: SetStateAction<UserState>) => void;
  playerState: PlayerState;
  setPlayerState: (value: SetStateAction<PlayerState>) => void;
  game: Game;
  reference: Reference;
  effect: Effect | null;
  tokenColor: TokenColor;
}

export default function TokenComponent({
  userState,
  setUserState,
  playerState,
  setPlayerState,
  game,
  reference,
  effect,
  tokenColor,
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
          onClick={async () => {
            // const updateData = {
            //   id: "32132121",
            //   playerId: "312313",
            // };
            // if (test) test(updateData);
            // updateClientToken(props);
            // alert("322");
            updatePlayerToken({
              userState,
              setUserState,
              playerState,
              setPlayerState,
              game,
              reference,
              effect,
              tokenColor,
            });
            setDisabled(true);
            // await new Promise((resolve) => {
            //   setTimeout(resolve, 700);
            // });
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

async function updatePlayerToken({
  game,
  userState,
  setUserState,
  playerState,
  setPlayerState,
  reference,
  effect,
  tokenColor,
}: TokenComponentProps) {
  // alert(playerState.action)
  if (playerState.action === "take") {
    // if (playerState.action === null) {
    const sumTokenColors = Object.values(playerState.playerTokens).reduce(
      (a, b) => a + b,
      0
    );
    if (effect === "take") {
      // TAKE TOKEN
      if (playerState.success) {
        setMessage(setUserState, "Unable to take any more tokens.");
        return;
      }
      if (tokenColor === "gold") {
        setMessage(setUserState, "Unable to take any gold tokens.");
        return;
      }
      switch (sumTokenColors) {
        case 2:
          if (playerState.playerTokens[tokenColor] === 1) {
            setMessage(setUserState, "Unable to take token of this color now.");
            return;
          }
          takeToken(setPlayerState, tokenColor, "resource", "player", true);
          setMessage(setUserState, "Take token success.");
          return;
        case 1:
          if (playerState.playerTokens[tokenColor] === 1) {
            if (game.resource.tokens[tokenColor] < 4) {
              setMessage(
                setUserState,
                "Not enough tokens left for double take."
              );
              return;
            }
            takeToken(setPlayerState, tokenColor, "resource", "player", true);
            setMessage(setUserState, "Take token success.");
            return;
          }
          takeToken(setPlayerState, tokenColor, "resource", "player", false);
          setMessage(setUserState, "Take token success.");
          return;
        case 0:
          takeToken(setPlayerState, tokenColor, "resource", "player", false);
          setMessage(setUserState, "Take token success.");
          return;
      }
      return;
    }
    if (effect === "return") {
      // RETURN TOKEN
      if ([1, 2, 3].includes(sumTokenColors)) {
        takeToken(setPlayerState, tokenColor, "player", "resource", false);
        setMessage(setUserState, "Return token success");
        return;
      }
      return;
    }
    return;
  }
}

async function takeToken(
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
  setUserState: (value: SetStateAction<UserState>) => void,
  message: string
) {
  setUserState((prev) => ({
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
