import { Shuffle, Token, Action } from "@prisma/client";
import { SetStateAction, useState } from "react";
import Card from "./Card";

interface TokenProps {
  color: TokenColor;
  action: Action;
  setAction: (value: SetStateAction<Action>) => void;
  setMessage: (value: SetStateAction<string>) => void;
}

export default function Deck({
  color,
  action,
  setAction,
  setMessage,
}: TokenProps) {
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
    <button
      className={`aspect-square w-[50px] rounded-full border-2 ${colorClass}`}
      onClick={() => {}}
    >
      T
    </button>
  );
}

function TokenLogic({ color, action, setAction, setMessage }: TokenProps) {
  if (action.type !== null) {
    setMessage("You cannot take any more tokens. Consider returing one.");
    return;
  }
  const sumTokenColors = Object.values(action.token).reduce((a, b) => a + b, 0);
  if (sumTokenColors === 3) {
    setMessage("You cannot take any more tokens. Consider returing one.");
    return;
  }
  if (sumTokenColors === 2) {
    if (
      action.token.white === 2 ||
      action.token.blue === 2 ||
      action.token.green === 2 ||
      action.token.red === 2 ||
      action.token.black === 2
    ) {
      setMessage("You cannot take any more tokens. Consider returing one.");
    } else {
      setAction((prev) => ({
        ...prev,
        token: { ...prev.token, [color]: prev.token[color] + 1 },
      }));
    }
  }
}
