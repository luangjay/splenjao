import { Game } from "@prisma/client";
import { InventoryKey, PlayerProps, TokenColor } from "../common/types";
import { api } from "../utils/api";
import Image from "next/image";
import { tokenColors } from "../common/constants";
import Token from "./Token";
import { useState } from "react";

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

function ReserveIcon() {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 16 16"
      height="20px"
      width="20px"
      className="rotate-6"
    >
      <path d="M2 1a1 1 0 00-1 1v4.586a1 1 0 00.293.707l7 7a1 1 0 001.414 0l4.586-4.586a1 1 0 000-1.414l-7-7A1 1 0 006.586 1H2zm4 3.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  );
}

const colorClass = (tokenColor: TokenColor) =>
  tokenColor === "white"
    ? `fill-white`
    : tokenColor === "blue"
    ? `fill-blue-500`
    : tokenColor === "green"
    ? `fill-green-500`
    : tokenColor === "red"
    ? `fill-red-500`
    : tokenColor === "black"
    ? `fill-gray-800`
    : tokenColor === "gold"
    ? `fill-yellow-300`
    : "";

function ScoreIcon() {
  return (
    <svg
      viewBox="0 0 576 512"
      fill="currentColor"
      height="20px"
      width="20px"
      className="mb-1 drop-shadow"
    >
      <path d="M309 106c11.4-7 19-19.7 19-34 0-22.1-17.9-40-40-40s-40 17.9-40 40c0 14.4 7.6 27 19 34l-57.3 114.6c-9.1 18.2-32.7 23.4-48.6 10.7L72 160c5-6.7 8-15 8-24 0-22.1-17.9-40-40-40S0 113.9 0 136s17.9 40 40 40h.7l45.7 251.4c5.5 30.4 32 52.6 63 52.6h277.2c30.9 0 57.4-22.1 63-52.6L535.3 176h.7c22.1 0 40-17.9 40-40s-17.9-40-40-40-40 17.9-40 40c0 9 3 17.3 8 24l-89.1 71.3c-15.9 12.7-39.5 7.5-48.6-10.7L309 106z" />
    </svg>
  );
}

interface TokenIconProps {
  className?: string;
}

function TokenIcon(props: TokenIconProps) {
  const { className } = props;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height="20px"
      width="20px"
      className={`drop-shadow ${className ? className : "fill-slate-600"}`}
    >
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-14.243L7.757 12 12 16.243 16.243 12 12 7.757z" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height="20px"
      width="20px"
      className="-mb-[1px] drop-shadow-sm"
    >
      <path d="M21.47 4.35l-1.34-.56v9.03l2.43-5.86c.41-1.02-.06-2.19-1.09-2.61m-19.5 3.7L6.93 20a2.01 2.01 0 001.81 1.26c.26 0 .53-.05.79-.16l7.37-3.05c.75-.31 1.21-1.05 1.23-1.79.01-.26-.04-.55-.13-.81L13 3.5a1.954 1.954 0 00-1.81-1.25c-.26 0-.52.06-.77.15L3.06 5.45a1.994 1.994 0 00-1.09 2.6m16.15-3.8a2 2 0 00-2-2h-1.45l3.45 8.34" />
    </svg>
  );
}

function TileIcon() {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 16 16"
      height="18px"
      width="18px"
      className="mb-[2px] drop-shadow"
    >
      <path d="M2.45 7.4L7.2 1.067a1 1 0 011.6 0L13.55 7.4a1 1 0 010 1.2L8.8 14.933a1 1 0 01-1.6 0L2.45 8.6a1 1 0 010-1.2z" />
    </svg>
  );
}
