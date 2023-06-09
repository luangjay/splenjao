import { Card as CardSchema, Game, Inventory, Player } from "@prisma/client";
import {
  CardColor,
  InventoryKey,
  PlayerState,
  TokenColor,
} from "../common/types";
import { api } from "../utils/api";
import { tokenColors } from "../common/constants";
import Image from "next/image";
import Card from "./Card";
import { SetStateAction, useState } from "react";
import Tile from "./Tile";
import Title from "./Title";
import { useLocalStorage } from "../hooks/useLocalStorage";
export interface PlayerProps {
  game: Game;
  player: Player;
  setPlayerState: (value: SetStateAction<PlayerState>) => void;
  localSettings: any;
  setLocalSettings: any;
}

export default function Me(props: PlayerProps) {
  const { game, player } = props;

  const idx = game.playerIds.indexOf(player.id);
  const inventory = game[`inventory${idx}` as InventoryKey];
  const cardCount = inventory.cards.length;
  const reserveCount = inventory.reserves.length;
  const tileCount = inventory.tiles.length;
  const score = inventory.score;
  const isTurn = idx === game.turnIdx;

  const addProps = {
    idx,
    inventory,
    cardCount,
    reserveCount,
    tileCount,
    score,
    isTurn,
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto p-6 text-base">
      <div className="-mb-6 flex-1"></div>
      <div className="flex flex-col gap-4">
        <Title>TILES</Title>
        <MyTiles {...props} {...addProps} />
      </div>
      <div className="flex flex-col gap-4">
        <Title>CARDS</Title>
        <MyCards {...props} {...addProps} />
      </div>
      <MyProfile {...props} {...addProps} />
    </div>
  );
}

export interface MeProps extends PlayerProps {
  idx: number;
  inventory: Inventory;
  cardCount: number;
  reserveCount: number;
  tileCount: number;
  score: number;
  isTurn: boolean;
  cardId?: number;
}

const MyProfile = (props: MeProps) => {
  const sumTokenCount = Object.values(props.inventory.tokens).reduce(
    (a, v) => a + v,
    0
  );

  return (
    <div
      className={`relative rounded-2xl bg-slate-300 ${
        !props.isTurn && "drop-shadow"
      }`}
    >
      {props.isTurn &&
        (props.localSettings?.enableAnimation ? (
          <div className="bg-animation absolute inset-0 rounded-2xl bg-slate-300"></div>
        ) : (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/[.8] to-sky-500/[.8]"></div>
        ))}
      <div
        className={`z-30 m-1.5 h-fit rounded-xl bg-gray-100 text-base drop-shadow-none ${
          props.isTurn
            ? "border border-transparent"
            : "border border-transparent"
        }`}
      >
        <div className="flex flex-col">
          <div className="h-fit p-3 px-4">
            {sumTokenCount === 0 ? (
              <div className="flex h-[20px] justify-center gap-1 text-sm">
                No tokens owned
              </div>
            ) : (
              <div className="flex h-[20px] justify-between gap-1 text-sm">
                {tokenColors.map((tokenColor) => (
                  <div className="flex w-1/6 items-center gap-[1px]">
                    {props.inventory.tokens[tokenColor] > 0 && (
                      <>
                        <TokenIcon className={colorClass(tokenColor)} />
                        {props.inventory.tokens[tokenColor]}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mx-4 border"></div>
          <div className="flex h-[90px] w-full items-center gap-3 p-4 pb-3 text-start">
            <div className="aspect-square h-[84%] drop-shadow">
              <Image
                alt=""
                src={props.player.image || ""}
                width={256}
                height={256}
                className="aspect-square h-full rounded-full object-cover"
              />
            </div>
            <div className="flex h-full flex-1 flex-col justify-between">
              <div className="flex h-[24px] items-center justify-between">
                <div className="w-[99px] truncate text-base font-medium">
                  {props.player.name}
                </div>
                <div className="relative flex h-[24px] items-center gap-1.5">
                  {props.localSettings?.enableAnimation &&
                    props.score >= 15 && (
                      <span className="absolute -top-0.5 -right-1.5 z-20 flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-500"></span>
                      </span>
                    )}
                  <ScoreIcon />
                  {props.score}
                </div>
              </div>
              <div className="flex h-[24px] justify-between">
                <div className="flex h-[24px] items-center gap-1.5">
                  <CardIcon />
                  {props.cardCount}
                </div>
                <div className="-mx-0.5 flex h-[24px] items-center gap-1">
                  <ReserveIcon />
                  {props.reserveCount}
                </div>
                <div className="flex h-[24px] items-center gap-1.5">
                  <TileIcon />
                  {props.tileCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyCards = (props: MeProps) => {
  const { data: allCards } = api.card.findAll.useQuery();

  return (
    <div className="flex">
      {props.inventory.cards.length === 0 ? (
        <div
          className="rounded-lgtext-base flex h-[190px] w-full items-center justify-center overflow-auto"
          onClick={() => {
            alert(JSON.stringify(allCards));
          }}
        >
          No cards owned
        </div>
      ) : (
        <div className="relative flex h-[190px] w-full items-center gap-4 overflow-auto pt-6 pb-3 text-sm">
          {(props.localSettings?.sortCards && allCards
            ? [...props.inventory.cards].sort(
                (a, b) =>
                  cardOrder(allCards[a]?.color) - cardOrder(allCards[b]?.color)
              )
            : [...props.inventory.cards]
          ).map((cardId) => (
            <MyCard {...props} cardId={cardId} key={cardId} />
          ))}
        </div>
      )}
    </div>
  );
};

const cardOrder = (cardColor?: string) => {
  switch (cardColor) {
    case "white":
      return 0;
    case "blue":
      return 1;
    case "green":
      return 2;
    case "red":
      return 3;
    case "black":
      return 4;
    default:
      return 5;
  }
};

const MyCard = (props: MeProps) => {
  const [float, setFloat] = useState(false);
  return (
    <div
      className="z-20 flex rounded-lg transition-all duration-[100ms]"
      style={{ marginTop: float ? "-48px" : "0px" }}
      onClick={() => setFloat((prev) => !prev)}
    >
      <Card
        cardId={props.cardId ?? -1}
        cardEffect={"special"}
        game={props.game}
        player={props.player}
      />
    </div>
  );
};

const MyTiles = (props: MeProps) => (
  <div className="flex h-[100px]">
    {props.inventory.tiles.length === 0 ? (
      <div className="flex h-full w-full items-center justify-center overflow-auto rounded-lg text-base">
        No tiles owned
      </div>
    ) : (
      <div className="flex h-full w-full gap-2 overflow-auto text-sm">
        {props.inventory.tiles.map((tileId) => (
          <div className="flex rounded-lg transition-all duration-[100ms]">
            <Tile tileId={tileId} />
          </div>
        ))}
      </div>
    )}
  </div>
);

export const colorClass = (tokenColor: TokenColor) =>
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
    : ``;

export function ScoreIcon({
  width = "20px",
  height = "20px",
}: {
  width?: string;
  height?: string;
}) {
  return (
    <svg
      viewBox="0 0 576 512"
      fill="currentColor"
      height={height}
      width={width}
      className="mb-1 drop-shadow"
    >
      <path d="M309 106c11.4-7 19-19.7 19-34 0-22.1-17.9-40-40-40s-40 17.9-40 40c0 14.4 7.6 27 19 34l-57.3 114.6c-9.1 18.2-32.7 23.4-48.6 10.7L72 160c5-6.7 8-15 8-24 0-22.1-17.9-40-40-40S0 113.9 0 136s17.9 40 40 40h.7l45.7 251.4c5.5 30.4 32 52.6 63 52.6h277.2c30.9 0 57.4-22.1 63-52.6L535.3 176h.7c22.1 0 40-17.9 40-40s-17.9-40-40-40-40 17.9-40 40c0 9 3 17.3 8 24l-89.1 71.3c-15.9 12.7-39.5 7.5-48.6-10.7L309 106z" />
    </svg>
  );
}

export function TokenIcon({
  width = "20px",
  height = "20px",
  className,
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height={height}
      width={width}
      className={`drop-shadow ${className ? className : "fill-gray-200"}`}
    >
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-14.243L7.757 12 12 16.243 16.243 12 12 7.757z" />
    </svg>
  );
}

export function ReserveIcon({
  width = "19px",
  height = "19px",
}: {
  width?: string;
  height?: string;
}) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 16 16"
      height={height}
      width={width}
      className="-mb-0.5 rotate-6"
    >
      <path d="M2 1a1 1 0 00-1 1v4.586a1 1 0 00.293.707l7 7a1 1 0 001.414 0l4.586-4.586a1 1 0 000-1.414l-7-7A1 1 0 006.586 1H2zm4 3.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  );
}

export function CardIcon({
  width = "21px",
  height = "21px",
}: {
  width?: string;
  height?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height={height}
      width={width}
      className="-mb-[1px] drop-shadow-sm"
    >
      <path d="M21.47 4.35l-1.34-.56v9.03l2.43-5.86c.41-1.02-.06-2.19-1.09-2.61m-19.5 3.7L6.93 20a2.01 2.01 0 001.81 1.26c.26 0 .53-.05.79-.16l7.37-3.05c.75-.31 1.21-1.05 1.23-1.79.01-.26-.04-.55-.13-.81L13 3.5a1.954 1.954 0 00-1.81-1.25c-.26 0-.52.06-.77.15L3.06 5.45a1.994 1.994 0 00-1.09 2.6m16.15-3.8a2 2 0 00-2-2h-1.45l3.45 8.34" />
    </svg>
  );
}

export function TileIcon({
  width = "18px",
  height = "18px",
}: {
  width?: string;
  height?: string;
}) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 16 16"
      height={height}
      width={width}
      className="mb-[2px] drop-shadow"
    >
      <path d="M2.45 7.4L7.2 1.067a1 1 0 011.6 0L13.55 7.4a1 1 0 010 1.2L8.8 14.933a1 1 0 01-1.6 0L2.45 8.6a1 1 0 010-1.2z" />
    </svg>
  );
}
