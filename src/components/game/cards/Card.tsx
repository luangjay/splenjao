import { Game, Player } from "@prisma/client";
import { SetStateAction } from "react";
import {
  cardCount,
  compPrice,
  opPrice,
  opPriceWColor,
} from "../../../common/constants";
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
    return <div className="min-w-[100px] max-w-[200px] rounded-lg"></div>;
  return (
    <div
      className={`aspect-[0.65] rounded-lg border border-gray-300 bg-gray-100 shadow-md drop-shadow-sm ${
        playerTurn && cardEffect && "cursor-pointer hover:bg-gray-200"
      } ${cardEffect ? "w-[100px] max-w-[200px]" : "w-[120px] max-w-[240px]"}`}
      // disabled={props.isTurnLoading}
      onClick={() => {
        if (
          playerTurn &&
          (cardEffect === "purchase" || cardEffect === "claim")
        ) {
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
      <div className="flex h-full flex-row justify-between p-[4%]">
        <div className="flex h-full w-[30%] flex-col justify-between">
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
        <div className="flex w-[30%] flex-col justify-between">
          <ColorLabel color={card.color as CardColor} />
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
    <div className="relative flex aspect-[0.65] min-w-[100px] max-w-[200px] items-center justify-center rounded-lg border border-gray-300 bg-[#111827] text-center font-mono text-sm text-gray-100 shadow-md drop-shadow-sm">
      <div>
        <span className="text-md font-medium">SPLENJAO</span>
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
          ? `number flex aspect-square w-full items-center justify-center rounded-md font-mono font-black leading-tight ${
              cardEffect ? "text-xl" : "text-2xl"
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
      className={`${colorClass} flex aspect-square w-full items-center justify-center rounded-md drop-shadow-lg`}
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
        cardEffect ? "text-lg" : "text-xl"
      }`}
    >
      {price}
    </div>
  );
}
