import { Game, Player } from "@prisma/client";
import { SetStateAction, useState } from "react";
import { tokenColors } from "../common/constants";
import { InventoryKey, PlayerState } from "../common/types";
import { CardEffect } from "../common/types";
import Card from "./Card";
import Tile from "./Tile";
import Token from "./Token";

interface DeckProps {
  game: Game;
  player: Player;
  playerState: PlayerState;
  setPlayerState: (value: SetStateAction<PlayerState>) => void;
}

export default function Deck(props: DeckProps) {
  const { game, player, playerState, setPlayerState } = props;
  const playerIdx = game.playerIds.indexOf(player.id);
  const playerTurn =
    player && game && player.id === game.playerIds[game.turnIdx];

  const tileClass =
    game.playerCount === 2
      ? "grid-cols-3 w-3/5"
      : game.playerCount === 3
      ? "grid-cols-4 w-4/5"
      : "grid-cols-5 w-full";

  return (
    <div className="flex gap-6 overflow-auto p-2 lg:gap-12 lg:p-6">
      <div className="flex items-center">
        <button
          className={`flex h-max min-h-[40px] select-none flex-col rounded-lg bg-gray-50 p-1 text-base drop-shadow ${
            playerTurn && ""
          }`}
          disabled={!playerTurn}
          onClick={() =>
            setPlayerState((prev) => ({
              ...prev,
              currentAction: "take",
            }))
          }
        >
          {tokenColors.map((tokenColor) => (
            <Token
              tokenColor={tokenColor}
              tokenEffect={null}
              reference="resource"
              showCount
              {...props}
            />
          ))}
        </button>
      </div>
      <div className="grid grid-rows-4 gap-1.5 lg:gap-2">
        <div className={`mx-auto grid gap-1.5 lg:gap-2 ${tileClass}`}>
          {game.resource.tiles.map(
            (tileId, idx) => idx < 5 && <Tile tileId={tileId} />
          )}
        </div>
        <div className="relative grid h-fit grid-cols-5 gap-1.5 lg:gap-2">
          <Card cardId={103} cardEffect={null} {...props} />
          {game.resource.cardsLv3.map(
            (cardId, idx) =>
              idx < 4 && (
                <Card cardId={cardId} cardEffect="purchase" {...props} />
              )
          )}
        </div>
        <div className="grid h-fit grid-cols-5 gap-1.5 lg:gap-2">
          <Card cardId={102} cardEffect={null} {...props} />
          {game.resource.cardsLv2.map(
            (cardId, idx) =>
              idx < 4 && (
                <Card cardId={cardId} cardEffect="purchase" {...props} />
              )
          )}
        </div>
        <div className="grid h-fit grid-cols-5 gap-1.5 lg:gap-2">
          <Card cardId={101} cardEffect={null} {...props} />
          {game.resource.cardsLv1.map(
            (cardId, idx) =>
              idx < 4 && (
                <Card cardId={cardId} cardEffect="purchase" {...props} />
              )
          )}
        </div>
      </div>
      <div className="grid h-fit grid-rows-4 gap-1.5 lg:gap-2">
        <div></div>
        {playerIdx !== -1 &&
          Array(3)
            .fill(0)
            .map((_, idx) => {
              const reservedCardId =
                game[`inventory${playerIdx}` as InventoryKey].reserves[idx];
              if (reservedCardId !== undefined) {
                return (
                  <Card
                    cardId={reservedCardId}
                    cardEffect="purchase"
                    {...props}
                  />
                );
              }
              return <Card cardId={104} cardEffect={null} {...props} />;
            })}
        {playerIdx === -1 &&
          Array(3)
            .fill(0)
            .map((_, idx) => (
              <Card cardId={104} cardEffect={null} {...props} />
            ))}
      </div>
    </div>
  );
}
