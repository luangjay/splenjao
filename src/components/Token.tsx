import { Shuffle, Action, ActionType } from "@prisma/client";
import { SetStateAction, useEffect, useState } from "react";
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

interface ClientState {
  color?: TokenColor;
  take?: boolean | null;
  type?: ActionType | null;
  cardId?: number;
}

interface ServerState {
  token: Token | undefined;
  action: Action | undefined;
}

interface TokenProps {
  color: TokenColor;
  take: boolean | null;
  clientState: ClientState | undefined;
  setClientState: (value: SetStateAction<ClientState | undefined>) => void;
  serverState: ServerState | undefined;
  setServerState: (value: SetStateAction<ServerState | undefined>) => void;
  setMessage: (value: SetStateAction<string | undefined>) => void;
}

export default function Token({
  color,
  take,
  clientState,
  setClientState,
  serverState,
  setServerState,
  setMessage,
}: // setGameToken,

// test,
TokenProps) {
  const [disabled, setDisabled] = useState(false);

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

  if (!serverState || !serverState.action) return <></>;
  if (take)
    return (
      <div className="flex">
        {serverState.token && serverState.token[color] > 0 && (
          <button
            className={`aspect-square w-[30px] rounded-full border-2 ${
              !disabled ? colorClass : "bg-gray-400"
            }`}
            onClick={async () => {
              // const updateData = {
              //   id: "32132121",
              //   playerId: "312313",
              // };
              // if (test) test(updateData);
              updateClientToken({
                color,
                take,
                clientState,
                setClientState,
                serverState,
                setServerState,
                setMessage,
              });
              setDisabled(true);
              await new Promise((resolve) => {
                setTimeout(resolve, 500);
              });
              setDisabled(false);
            }}
          >
            T
          </button>
        )}
        <div>{serverState.token && serverState.token[color]}</div>
      </div>
    );
  return (
    <div className="flex">
      {serverState.action.token && serverState.action.token[color] > 0 && (
        <button
          className={`aspect-square w-[30px] rounded-full border-2 ${colorClass}`}
          onClick={async () => {
            // const updateData = {
            //   id: "32132121",
            //   playerId: "312313",
            // };
            // if (test) test(updateData);
            updateClientToken({
              color,
              take,
              clientState,
              setClientState,
              serverState,
              setServerState,
              setMessage,
            });
            setDisabled(true);
            await new Promise((resolve) => {
              setTimeout(resolve, 300);
            });
            setDisabled(false);
          }}
        >
          T
        </button>
      )}
      <div>{serverState.action.token && serverState.action.token[color]}</div>
    </div>
  );
}

function updateClientToken({
  color,
  take,
  clientState,
  setClientState,
  serverState,
  setServerState,
  setMessage,
}: // setGameToken,
TokenProps) {
  if (
    take === null ||
    !serverState ||
    !serverState.action ||
    !serverState.token
  )
    return;
  const sumTokenColors = Object.values(serverState.action.token).reduce(
    (a, b) => a + b,
    0
  );
  if (take) {
    // TAKE TOKEN
    if (serverState.action.type !== null) {
      setMessage("You cannot take any more tokens.");
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
        if (serverState.action.token[color] === 1) {
          setMessage("You cannot pick token of this color now.");
        } else if (color === "gold") {
          setMessage("You cannot pick gold token now.");
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
          setClientState((prev) => ({
            ...prev,
            take,
            color,
            type: "takeThree",
          }));
          setMessage("Take token success.");
        }
        // }
        return;
      case 1:
        if (serverState.action.token.gold === 1) {
          setMessage("You can only reserve card now.");
        } else if (color === "gold") {
          setMessage("You cannot pick gold token now.");
        } else {
          if (serverState.action.token[color] === 1) {
            if (serverState.token[color] < 3) {
              setMessage("Not enough tokens left for double take.");
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
              setClientState((prev) => ({
                ...prev,
                take,
                color,
                type: "takeTwo",
              }));
              setMessage("Take token success.");
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
            setClientState((prev) => ({
              ...prev,
              take,
              color,
            }));
            setMessage("Take token success.");
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
        setClientState((prev) => ({
          ...prev,
          take,
          color,
        }));
        setMessage("Take token success.");
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
    setClientState((prev) => ({
      ...prev,
      take,
      color,
      type: null,
    }));
    setMessage("Return token success");
  }
}
