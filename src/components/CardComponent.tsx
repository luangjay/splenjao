import { Game, Price } from "@prisma/client";
import { SetStateAction } from "react";
import { ClientState, ServerState } from "../common/interfaces";
import { IdxKey } from "../common/types";
import { api } from "../utils/api";

interface CardProps {
  game: Game;
  id: number;
  clientState: ClientState | undefined;
  setClientState: (value: SetStateAction<ClientState | undefined>) => void;
  serverState: ServerState | undefined;
  setServerState: (value: SetStateAction<ServerState | undefined>) => void;
  setMessage: (value: SetStateAction<string | undefined>) => void;
  isTurnLoading: boolean;
}

type Color = "white" | "blue" | "green" | "red" | "black";

export default function CardComponent(props: CardProps) {
  const card = api.card.findById.useQuery(props.id);
  const isPicked = props.id === props.serverState?.action.cardId;

  if (!card.data || card.data.id === -1) return <></>;
  return (
    <button
      className={`rounded-lg border-2 border-black drop-shadow-md hover:bg-gray-100 ${
        isPicked && "bg-gray-200"
      }`}
      disabled={props.isTurnLoading}
      onClick={() => {
        updateClientCard(props, card.data?.price);
      }}
    >
      <div className="flex flex-row justify-between p-[4%]">
        <div className="flex aspect-[0.185] w-[30%] flex-col justify-between">
          <div
            className={
              card.data.score
                ? "flex aspect-square w-full items-center justify-center rounded-lg "
                : undefined
            }
          >
            <code className="number text-2xl font-black">
              {card.data.score || ""}
            </code>
          </div>
          <div>
            {(["white", "blue", "green", "red", "black"] as Color[]).map(
              (color) => (
                <PriceLabel color={color} price={card.data?.price[color]} />
              )
            )}
          </div>
        </div>
        <div className="flex aspect-[0.185] w-[30%] flex-col justify-between">
          <ColorLabel color={card.data?.color} />
        </div>
      </div>
    </button>
  );
}

function updateClientCard(props: CardProps, price?: Price) {
  if (!props.serverState || !price) return;
  if (props.serverState.action.endTurn) {
    props.setMessage("You cannot purchase card this period");
    return;
  }
  props.setMessage("4344");
  const sumTokenColors = Object.values(
    props.serverState.action.tokenList
  ).reduce((a, b) => a + b, 0);
  if (sumTokenColors !== 0) {
    if (props.serverState.action.tokenList.gold === 1) {
      props.setMessage("Coming soon");
    } else {
      props.setMessage("You cannot purchase card right now.");
    }
    return;
  }
  // *** IMPORTANT ***
  const discountedPrice = { ...price };
  (Object.keys(discountedPrice) as Color[]).forEach((color) => {
    discountedPrice[color] =
      price[color] -
      props.game.playerDiscount[`i${props.game.turn.playerIdx}` as IdxKey][
        color
      ];
  });
  if (
    !(["white", "blue", "green", "red", "black"] as Color[]).every((color) => {
      if (
        props.serverState &&
        props.serverState.playerToken[
          `i${props.game.turn.playerIdx}` as IdxKey
        ][color] < discountedPrice[color]
      ) {
        props.setMessage("Not enough tokens.");
        return false;
      }
      return true;
    })
  ) {
    return;
  }
  props.setClientState({
    tokenColor: null,
    effect: "purchase",
    actionType: "purchase",
    cardId: props.id,
  });
  props.setMessage("Purchase card success.");
}

interface ColorProps {
  color: Color | undefined;
}

interface PriceProps {
  color: Color | undefined;
  price: number | undefined;
}

function ColorLabel({ color }: ColorProps) {
  let colorClass;
  switch (color) {
    case "white":
      colorClass = "bg-[#edf4f7]";
      break;
    case "blue":
      colorClass = "bg-[#367ec4]";
      break;
    case "green":
      colorClass = "bg-[#0faf60]";
      break;
    case "red":
      colorClass = "bg-[#d2281a]";
      break;
    case "black":
      colorClass = "bg-[#40231d]";
      break;
  }

  if (colorClass)
    return (
      <div
        className={`${colorClass} flex aspect-square w-full items-center justify-center rounded-lg drop-shadow-lg`}
      ></div>
    );
  return <></>;
}

function PriceLabel({ color, price }: PriceProps) {
  if (price)
    return (
      <div
        className={`flex aspect-square w-full items-center justify-center rounded-full border-2 ${
          color && price
            ? color === "black"
              ? "bg-black"
              : color === "white"
              ? "bg-white"
              : ` bg-${color}-500`
            : undefined
        }`}
      >
        <code className="number text-xl font-black">{price || -1}</code>
      </div>
    );
  return <></>;
}
