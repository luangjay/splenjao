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

  return (
    <div className="flex gap-12">
      <div className="flex items-center">
        <div
          className={`flex h-max min-h-[40px] w-full flex-col border-2 ${
            playerTurn && "cursor-pointer hover:bg-gray-100"
          }`}
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
        </div>
      </div>
      <div className="grid min-w-max grid-rows-4 gap-2 border">
        <div className="grid grid-cols-5 gap-2">
          {game.resource.tiles.map(
            (tileId, idx) => idx < 5 && <Tile tileId={tileId} {...props} />
          )}
        </div>
        <div className="grid grid-cols-5 gap-2">
          <Card cardId={103} cardEffect={null} {...props} />
          {game.resource.cardsLv3.map(
            (cardId, idx) =>
              idx < 4 && (
                <Card cardId={cardId} cardEffect="purchase" {...props} />
              )
          )}
        </div>
        <div className="grid grid-cols-5 gap-2">
          <Card cardId={102} cardEffect={null} {...props} />
          {game.resource.cardsLv2.map(
            (cardId, idx) =>
              idx < 4 && (
                <Card cardId={cardId} cardEffect="purchase" {...props} />
              )
          )}
        </div>
        <div className="grid grid-cols-5 gap-2">
          <Card cardId={101} cardEffect={null} {...props} />
          {game.resource.cardsLv1.map(
            (cardId, idx) =>
              idx < 4 && (
                <Card cardId={cardId} cardEffect="purchase" {...props} />
              )
          )}
        </div>
      </div>
      <div className="grid min-w-max grid-rows-4 gap-2 border">
        <Card cardId={-1} cardEffect={null} {...props} />
        {/* <Card cardId={103} {...props} />
        <Card cardId={102} {...props} />
        <Card cardId={101} {...props} /> */}
        {playerIdx !== -1 &&
          game[`inventory${playerIdx}` as InventoryKey].reserves.map(
            (cardId) => (
              <Card cardId={cardId} cardEffect="purchase" {...props} />
            )
          )}
      </div>
    </div>
  );
}
