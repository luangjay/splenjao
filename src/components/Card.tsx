import { Game, Player } from "@prisma/client";
import { SetStateAction } from "react";
import {
  cardCount,
  compPrice,
  opPrice,
  opPriceWColor,
} from "../common/constants";
import { PlayerState } from "../common/types";
import { CardColor, CardEffect, InventoryKey } from "../common/types";
import { api } from "../utils/api";

interface CardProps {
  game: Game;
  player: Player;
  cardId: number;
  cardEffect: CardEffect | null;
  playerState: PlayerState;
  setPlayerState: (value: SetStateAction<PlayerState>) => void;
}

export default function Card({
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

  if (cardId === 101)
    return (
      <BackCard cardCount={cardCount(game.resource.cardsLv1)} cardLv={1} />
    );
  if (cardId === 102)
    return (
      <BackCard cardCount={cardCount(game.resource.cardsLv2)} cardLv={2} />
    );
  if (cardId === 103)
    return (
      <BackCard cardCount={cardCount(game.resource.cardsLv3)} cardLv={3} />
    );
  if (!card || cardId === -1)
    return (
      <div className="min-w-[100px] max-w-[200px] select-none rounded-lg"></div>
    );
  return (
    <div
      className={`aspect-[0.65] select-none rounded-lg border bg-gray-50 drop-shadow ${
        playerTurn && cardEffect && "hover:bg-gray-100"
      } ${cardEffect ? "w-[100px] max-w-[200px]" : "w-[150px] max-w-[300px]"}`}
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
            currentAction: cardEffect,
            selectedCard: card,
          }));
        }
      }}
    >
      <div className="flex h-full flex-row justify-between p-[6%]">
        <div className="flex h-full w-[30%] flex-col justify-between px-[1%]">
          <ScoreLabel score={card.score} cardEffect={cardEffect} />
          <div
            className={`flex flex-col ${
              cardEffect ? "gap-[2px]" : "gap-[3px]"
            }`}
          >
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
        <div className="flex w-[30%] flex-col justify-between">
          <ColorLabel color={card.color as CardColor} cardEffect={cardEffect} />
        </div>
      </div>
    </div>
  );
}

interface BackCardProps {
  cardLv: number;
  cardCount: number;
}

function BackCard({ cardLv, cardCount }: BackCardProps) {
  return (
    <div className="relative flex aspect-[0.65] min-w-[100px] max-w-[200px] select-none items-center justify-center rounded-lg bg-[#111827] text-center text-sm text-gray-100 shadow-md drop-shadow">
      <div>
        <span className="text-md font-mono font-medium">SPLENJAO</span>
        <br />
        <span className="number text-xl font-black">{cardCount}</span>
      </div>
      <div
        className={`absolute bottom-1.5 flex h-max w-${cardLv}/3 justify-evenly gap-1`}
      >
        {Array(cardLv)
          .fill(0)
          .map(() => (
            <div className="h-1.5 w-1.5 rounded-full bg-gray-100"></div>
          ))}
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
          ? `number flex aspect-square w-full items-center justify-center rounded-md font-black leading-tight ${
              cardEffect ? "text-xl" : "text-3xl"
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
  cardEffect: CardEffect | null;
}

function ColorLabel({ color, cardEffect }: ColorProps) {
  const colorClass =
    color === "white"
      ? "border-white bg-gradient-to-bl from-white to-white/[.75]"
      : color === "blue"
      ? "border-blue-500 bg-gradient-to-bl from-blue-600 to-blue-500/[.75]"
      : color === "green"
      ? "border-green-500 bg-gradient-to-bl from-green-600 to-green-500/[.75]"
      : color === "red"
      ? "border-red-500 bg-gradient-to-bl from-red-600 to-red-500/[.75]"
      : color === "black"
      ? "border-gray-800 bg-gradient-to-bl from-gray-800 to-gray-800/[.75]"
      : "";

  if (!colorClass) return <></>;
  return (
    <div
      className={`${colorClass} ${
        cardEffect ? "rounded-md" : "rounded-[9px]"
      } flex aspect-square w-full items-center justify-center drop-shadow`}
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
      ? "bg-gray-700"
      : "";

  if (!price) return <></>;
  return (
    <div
      className={`number flex aspect-square w-full items-center justify-center rounded-full font-black leading-none drop-shadow ${colorClass} ${
        cardEffect ? "text-lg" : "text-[27px]"
      }`}
    >
      {price}
    </div>
  );
}
