import Image from "next/image";
import Layout from "./Layout";
import {
  CardIcon,
  PlayerProps,
  ReserveIcon,
  ScoreIcon,
  TileIcon,
  TokenIcon,
  colorClass,
} from "./Me";
import Title from "./Title";
import { InventoryKey } from "../common/types";
import { api } from "../utils/api";
import { useEffect, useState } from "react";
import { tokenColors } from "../common/constants";
import { Inventory } from "@prisma/client";

export default function End(props: PlayerProps) {
  // const [open, setOpen] = useState(false);
  const { game, player } = props;

  const [page, setPage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY <= 50) {
        setPage(0);
      } else if (window.scrollY >= window.innerHeight - 150) {
        setPage(1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // const openDialog = () => setOpen(true);
  // const toggle = () => {
  //   props.setLocalSettings((prev: any) => ({
  //     ...prev,
  //     enableAnimation: !prev?.enableAnimation,
  //   }));
  // };

  const { data: winner, isLoading: winnerLoading } =
    api.game.findPlayerById.useQuery(game.winnerId ?? "");

  return (
    <Layout>
      {winner && (
        <div className="absolute left-0 flex h-full w-full flex-col items-center justify-center max-xl:hidden">
          <Title size={3}>WINNER</Title>
          <div className="mt-6 aspect-square h-[192px]">
            <Image
              alt=""
              src={winner.image || ""}
              width={256}
              height={256}
              className="aspect-square h-full rounded-full object-cover drop-shadow"
            />
          </div>
          <div className="mt-10 max-w-[320px] truncate text-[32px] font-semibold drop-shadow">
            {winner.name}
          </div>
          <div className="mt-4 text-[28px] drop-shadow">
            {game.winnerScore} score
          </div>
        </div>
      )}
      {winner && (
        <div className="absolute left-0 flex h-full w-full items-center justify-center gap-12 overflow-auto max-lg:pt-[50px] xl:hidden">
          <div className="aspect-square h-[160px]">
            <Image
              alt=""
              src={winner.image || ""}
              width={256}
              height={256}
              className="aspect-square h-full rounded-full object-cover drop-shadow"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-12 drop-shadow">
              <div className="max-w-[240px] truncate text-[32px] font-semibold">
                {winner.name}
              </div>
              <div className="text-[28px] drop-shadow">
                {game.winnerScore} score
              </div>
            </div>
            <div className="py-1">
              <WinnerIcon size={1} />
            </div>
          </div>
        </div>
      )}
      <div className="relative top-[100vh] flex w-full flex-col items-center justify-center gap-6 pt-[30px] pb-[50px]">
        <Title size={2}>LEADERBOARD</Title>
        <PlayersProfile {...props} />
      </div>
      <div className="fixed top-0 right-[60px] flex h-screen flex-col justify-center gap-4">
        <button
          className={`h-4 w-4 rounded-full shadow-lg ${
            page === 0 ? "bg-pink-300" : "bg-slate-300"
          }`}
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        ></button>
        <button
          className={`h-4 w-4 rounded-full bg-slate-300 shadow-lg ${
            page === 1 ? "bg-pink-300" : "bg-slate-300"
          }`}
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight - 100,
              behavior: "smooth",
            });
          }}
        ></button>
      </div>
    </Layout>
  );
}

const PlayersProfile = (props: PlayerProps) => {
  const { game, player } = props;

  const findPlayersById = game.playerIds.map((playerId) =>
    api.game.findPlayerById.useQuery(playerId)
  );
  const sortedPlayers = findPlayersById
    .map((player, idx) => {
      const inventory = game[`inventory${idx}` as InventoryKey];
      return {
        ...player.data,
        isLoading: player.isLoading,
        idx,
        inventory,
      };
    })
    .sort((a, b) => {
      if (a.inventory.score !== b.inventory.score) {
        return b.inventory.score - a.inventory.score; // Sort by maximum points
      } else if (a.inventory.cards.length !== b.inventory.cards.length) {
        return a.inventory.cards.length - b.inventory.cards.length; // Sort by least cards purchased
      } else {
        return a.inventory.reserves.length - b.inventory.reserves.length; // Sort by least cards reserved
      }
    });

  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      {sortedPlayers.map((player, arrIdx) => {
        const inventory = player.inventory;
        const reserveCount = inventory.reserves.length;
        const cardCount = inventory.cards.length;
        const tileCount = inventory.tiles.length;
        const score = inventory.score;
        const isWinner = arrIdx === 0;

        return (
          <div
            className={`relative rounded-2xl bg-gray-50 text-lg ${
              !isWinner && "drop-shadow"
            }`}
          >
            {isWinner &&
              (props.localSettings?.enableAnimation ? (
                <div className="bg-animation absolute inset-0 rounded-2xl"></div>
              ) : (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-400/[.6] to-pink-400/[.4]"></div>
              ))}
            <div
              className={`m-1.5 h-fit rounded-xl bg-gray-50 text-2xl drop-shadow-none ${
                isWinner
                  ? "border border-pink-400"
                  : "border border-transparent"
              }`}
            >
              <div className="flex flex-col">
                <div className="flex h-[120px] w-full items-center gap-4 p-[22px] text-start">
                  <div className="aspect-square h-[90%]">
                    <Image
                      alt=""
                      src={player.image || ""}
                      width={256}
                      height={256}
                      className="aspect-square h-full rounded-full object-cover drop-shadow"
                    />
                  </div>
                  <div className="flex h-full flex-1 flex-col justify-between">
                    <div className="flex h-[28px] items-center justify-between">
                      <div className="flex items-center gap-1 text-2xl font-medium">
                        <div className="max-w-[240px] truncate">
                          {player.name}
                        </div>
                        {isWinner && <WinnerIcon />}
                      </div>
                    </div>
                    <div className="flex h-[28px] text-lg">
                      <div className="flex h-[28px] items-center text-end">
                        <CardIcon />
                        <span className="w-[48px] px-3 text-start">
                          {cardCount}
                        </span>
                      </div>
                      <div className="-mx-0.5 flex h-[28px] items-center gap-1">
                        <ReserveIcon />
                        <span className="w-[48px] px-3 text-start">
                          {reserveCount}
                        </span>
                      </div>
                      <div className="flex h-[28px] items-center gap-1">
                        <TileIcon />
                        <span className="w-[48px] px-3 text-start">
                          {tileCount}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex h-[28px] items-center gap-1.5">
                    <ScoreIcon />
                    <span className="w-[28px] text-start">{score}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const WinnerIcon = ({ size = 0 }: { size?: number }) => {
  const sizeClass = size === 1 ? "h-[38px] w-[47px]" : "h-[29px] w-[36px]";

  return (
    <Image
      alt=""
      width={256}
      height={256}
      src="/medal.svg"
      className={`object-cover object-bottom p-0.5 drop-shadow ${sizeClass}`}
    />
  );
};
