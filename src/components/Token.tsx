import { Shuffle, Action, ActionType } from "@prisma/client";
import { SetStateAction, useState } from "react";
import Card from "./Card";

type TokenColor = "white" | "blue" | "green" | "red" | "black" | "gold";
type Token = {
  white: number;
  blue: number;
  green: number;
  red: number;
  black: number;
  gold: number;
};

interface TokenProps {
  color: TokenColor;
  take: boolean | null;
  action: Action | undefined;
  // setAction: (value: SetStateAction<Action>) => void;
  gameToken: Token | undefined;
  setTakeToken: (value: SetStateAction<TokenColor | undefined>) => void;
  setReturnToken: (value: SetStateAction<TokenColor | undefined>) => void;
  setActionType: (value: SetStateAction<ActionType | null | undefined>) => void;
  // setGameToken: (value: SetStateAction<Token>) => void;
  setMessage: (value: SetStateAction<string | undefined>) => void;
  // test?: Function;
}

export default function Token({
  color,
  take,
  action,
  // setAction,
  gameToken,
  setTakeToken,
  setReturnToken,
  setActionType,
  setMessage,
}: // setGameToken,

// test,
TokenProps) {
  let colorClass: string;
  switch (color) {
    case "white":
      colorClass = "bg-white";
      break;
    case "blue":
      colorClass = "bg-blue-500";
      break;
    case "green":
      colorClass = "bg-green-500";
      break;
    case "red":
      colorClass = "bg-red-500";
      break;
    case "black":
      colorClass = "bg-black";
      break;
    case "gold":
      colorClass = "bg-yellow-300";
      break;
  }

  return (
    <div className="flex">
      {gameToken && gameToken[color] > 0 && (
        <button
          className={`aspect-square w-[30px] rounded-full border-2 ${colorClass}`}
          onClick={async () => {
            // const updateData = {
            //   id: "32132121",
            //   playerId: "312313",
            // };
            // if (test) test(updateData);
            updateToken({
              color,
              take,
              action,
              // setAction,
              gameToken,
              setTakeToken,
              setReturnToken,
              setActionType,
              // setGameToken,
              setMessage,
              // test,
            });
          }}
        >
          T
        </button>
      )}
      <div>{gameToken && gameToken[color]}</div>
    </div>
  );
}

function updateToken({
  color,
  take,
  action,
  // setAction
  gameToken,
  setTakeToken,
  setReturnToken,
  setActionType,
  setMessage,
}: // setGameToken,
TokenProps) {
  if (take === null || !action || !gameToken) return;
  const sumTokenColors = Object.values(action.token).reduce((a, b) => a + b, 0);
  setMessage("455");
  if (take) {
    // TAKE TOKEN
    if (action.type !== null) {
      setMessage("You cannot take any more tokens. Consider returing one.");
      return;
    }
    switch (sumTokenColors) {
      // case 3:
      //   setMessage("You cannot take any more tokens. Consider returing one.");
      //   return;
      case 2:
        // if (
        //   action.token.white === 2 ||
        //   action.token.blue === 2 ||
        //   action.token.green === 2 ||
        //   action.token.red === 2 ||
        //   action.token.black === 2
        // ) {
        //   setMessage("You cannot take any more tokens. Consider returing one.");
        // } else {
        if (action.token[color] === 1) {
          setMessage("You cannot pick token of this color now");
        } else {
          // setAction((prev) => ({
          //   ...prev,
          //   type: "takeThree",
          //   token: { ...prev.token, [color]: prev.token[color] + 1 },
          // }));
          // setGameToken((prev) => ({
          //   ...prev,
          //   [color]: prev[color] - 1,
          // }));
          setTakeToken(color);
          setActionType("takeThree");
          setMessage("Take token success");
        }
        // }
        return;
      case 1:
        if (action.token.gold === 1) {
          setMessage("You can only reserve card now");
        } else {
          if (action.token[color] === 1) {
            if (gameToken[color] < 3) {
              setMessage("Not enough tokens left for double pick");
            } else {
              // setAction((prev) => ({
              //   ...prev,
              //   type: "takeTwo",
              //   token: { ...prev.token, [color]: prev.token[color] + 1 },
              // }));
              // setGameToken((prev) => ({
              //   ...prev,
              //   [color]: prev[color] - 1,
              // }));
              setTakeToken(color);
              setActionType("takeTwo");
              setMessage("Take token success");
            }
          } else {
            // setAction((prev) => ({
            //   ...prev,
            //   token: { ...prev.token, [color]: prev.token[color] + 1 },
            // }));
            // setGameToken((prev) => ({
            //   ...prev,
            //   [color]: prev[color] - 1,
            // }));
            setTakeToken(color);
            setMessage("Take token success");
          }
        }
        return;
      case 0:
        // setAction((prev) => ({
        //   ...prev,
        //   token: { ...prev.token, [color]: prev.token[color] + 1 },
        // }));
        // setGameToken((prev) => ({
        //   ...prev,
        //   [color]: prev[color] - 1,
        // }));
        setTakeToken(color);
        setMessage("Take token success");
        return;
    }
    return;
  }
  // RETURN TOKEN
  if ([1, 2, 3].includes(sumTokenColors)) {
    // setAction((prev) => ({
    //   ...prev,
    //   type: null,
    //   token: { ...prev.token, [color]: prev.token[color] - 1 },
    // }));
    // setGameToken((prev) => ({
    //   ...prev,
    //   [color]: prev[color] + 1,
    // }));
    setActionType(null);
    setReturnToken(color);
    setMessage("Return token success");
  }
}
