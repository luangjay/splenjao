import { Game } from "@prisma/client";
import { InventoryKey, PlayerProps, TokenColor } from "../common/types";
import { api } from "../utils/api";
import Image from "next/image";
import { tokenColors } from "../common/constants";
import Token from "./Token";
import { useState } from "react";
import {
  CardIcon,
  ReserveIcon,
  ScoreIcon,
  TileIcon,
  TokenIcon,
  colorClass,
} from "./Me";

export default function Others(props: PlayerProps) {
  const { game, me } = props;
  const findOthersById = game.playerIds.map((playerId) =>
    api.game.findPlayerById.useQuery(playerId)
  );
  const others = findOthersById
    .map((player, idx) => ({
      ...player.data,
      isLoading: player.isLoading,
      idx,
    }))
    .filter((player) => player.id !== me.id);

  return (
    <div className="flex w-full flex-col justify-between gap-6 overflow-auto p-6">
      {others.map((player) => {
        const idx = player.idx;
        const inventory = game[`inventory${idx}` as InventoryKey];
        const reserveCount = inventory.reserves.length;
        const cardCount = inventory.cards.length;
        const tileCount = inventory.tiles.length;
        const score = inventory.score;

        if (player.isLoading) {
          return <div className="w-full"></div>;
        }
        return (
          <div className="h-fit w-full text-base">
            <div className="flex flex-col rounded-lg bg-gray-100 drop-shadow">
              <div className="flex h-[90px] w-full items-center gap-4 p-4 text-start">
                <div className="aspect-square h-[90%]">
                  <Image
                    alt=""
                    src={player.image || ""}
                    width={256}
                    height={256}
                    className="aspect-square h-full rounded-full object-cover drop-shadow"
                  ></Image>
                </div>
                <div className="flex h-full flex-1 flex-col justify-between">
                  <div className="flex h-[24px] items-center justify-between">
                    <div className="w-[99px] truncate text-base font-medium">
                      {player.name}
                    </div>
                    <div className="flex h-[24px] items-center gap-1.5">
                      <ScoreIcon />
                      {score}
                    </div>
                  </div>
                  <div className="flex h-[24px] justify-between">
                    <div className="flex h-[24px] items-center gap-1.5">
                      <CardIcon />
                      {cardCount}
                    </div>
                    <div className="-mx-0.5 flex h-[24px] items-center gap-1">
                      <ReserveIcon />
                      {reserveCount}
                    </div>
                    <div className="flex h-[24px] items-center gap-1.5">
                      <TileIcon />
                      {tileCount}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mx-4 border"></div>
              <div className="h-fit p-4">
                <div className="flex justify-between gap-1 text-sm">
                  {tokenColors.map((tokenColor) => (
                    <div className="flex w-1/6 items-center gap-[1px]">
                      {inventory.tokens[tokenColor] > 0 && (
                        <>
                          <TokenIcon className={colorClass(tokenColor)} />
                          {inventory.tokens[tokenColor]}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
