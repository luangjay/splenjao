import { Card, Game, Player, Price } from "@prisma/client";
import { SetStateAction } from "react";
import { compPrice, opPrice, opPriceWColor } from "../../../common/constants";
import { PlayerState } from "../../../common/types";
import { CardColor, CardEffect, InventoryKey } from "../../../common/types";
import { api } from "../../../utils/api";

interface CardProps {
  game: Game;
  player: Player;
  cardId: number;
  cardEffect: CardEffect | null;
  playerState: PlayerState;
  setPlayerState: (value: SetStateAction<PlayerState>) => void;
}

export default function CardComponent({
  game,
  player,
  cardId,
  cardEffect,
  playerState,
  setPlayerState,
}: CardProps) {
  const { data: card } = api.card.findById.useQuery(cardId);
  const playerTurn =
    player && game && player.id === game.playerIds[game.turnIdx];

  if (!card || cardId === -1)
    return (
      <div className="mx-auto min-w-[120px] max-w-[240px] rounded-lg"></div>
    );
  return (
    <div
      className={`mx-auto rounded-lg border border-gray-300 bg-gray-100 shadow-md drop-shadow-sm ${
        playerTurn && cardEffect
          ? "min-w-[120px] max-w-[240px] cursor-pointer hover:bg-gray-200"
          : "min-w-[144px] max-w-[288px]"
      }`}
      // disabled={props.isTurnLoading}
      onClick={() => {
        if (playerTurn && cardEffect === "purchase") {
          const discountedPrice = opPrice(
            "decrement",
            card.price,
            game[`inventory${game.turnIdx}` as InventoryKey].discount
          );
          setPlayerState((prev) => ({
            ...prev,
            success: compPrice(playerState.playerTokens, discountedPrice),
            currentAction: "purchase",
            selectedCard: card,
          }));
        }
      }}
    >
      <div className="flex flex-row justify-between p-[4%]">
        <div className="flex aspect-[0.185] w-[30%] flex-col justify-between">
          <ScoreLabel score={card.score} cardEffect={cardEffect} />
          <div>
            {(["white", "blue", "green", "red", "black"] as CardColor[]).map(
              (color) => (
                <PriceLabel
                  color={color}
                  price={card.price[color]}
                  cardEffect={cardEffect}
                />
              )
            )}
          </div>
        </div>
        <div className="flex aspect-[0.185] w-[30%] flex-col justify-between">
          <ColorLabel color={card.color as CardColor} />
        </div>
      </div>
    </div>
  );
}

interface ScoreProps {
  score: number;
  cardEffect: CardEffect | null;
}

function ScoreLabel({ score, cardEffect }: ScoreProps) {
  return (
    <div
      className={
        score
          ? `number flex aspect-square w-full items-center justify-center rounded-lg font-mono font-black leading-tight ${
              cardEffect ? "text-2xl" : "text-3xl"
            }`
          : undefined
      }
    >
      {score || ""}
    </div>
  );
}

interface ColorProps {
  color: CardColor | undefined;
}

function ColorLabel({ color }: ColorProps) {
  const colorClass =
    color === "white"
      ? "bg-gray-100"
      : color === "blue"
      ? "bg-blue-600"
      : color === "green"
      ? "bg-green-600"
      : color === "red"
      ? "bg-red-600"
      : color === "black"
      ? "bg-black"
      : "";

  if (!colorClass) return <></>;
  return (
    <div
      className={`${colorClass} flex aspect-square w-full items-center justify-center rounded-lg drop-shadow-lg`}
    ></div>
  );
}

interface PriceProps {
  color: CardColor | undefined;
  price: number | undefined;
  cardEffect: CardEffect | null;
}

function PriceLabel({ color, price, cardEffect }: PriceProps) {
  const colorClass =
    color === "white"
      ? "bg-white"
      : color === "blue"
      ? "bg-blue-500"
      : color === "green"
      ? "bg-green-500"
      : color === "red"
      ? "bg-red-500"
      : color === "black"
      ? "bg-gray-800"
      : "";

  if (!price) return <></>;
  return (
    <div
      className={`number flex aspect-square w-full items-center justify-center rounded-full border-2 border-gray-100 font-mono font-black leading-none ${colorClass} ${
        cardEffect ? "text-1xl" : "text-2xl"
      }`}
    >
      {price}
    </div>
  );
}
