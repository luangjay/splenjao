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
      if (window.scrollY <= 60) {
        setPage(0);
      } else if (window.scrollY >= window.innerHeight - 120) {
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

  const { data: winner, isLoading: winnerLoading } = game.winnerId
    ? api.game.findPlayerById.useQuery(game.winnerId)
    : {
        data: null,
        isLoading: false,
      };

  const { data: stopper, isLoading: stopperLoading } = game.stopperId
    ? api.game.findPlayerById.useQuery(game.stopperId)
    : { data: null, isLoading: false };

  // if (game.winnerId === null) {
  //   return <Layout>fuck</Layout>;
  // }
  return (
    <Layout>
      {!winner && !winnerLoading ? (
        <main className="absolute left-0 flex h-full w-full flex-col items-center justify-center max-xl:hidden">
          <Title size={3}>RESULT</Title>
          {stopper ? (
            <div className="flex aspect-square h-[386px] w-full flex-col items-center justify-center gap-2 pb-24 text-[32px] drop-shadow">
              <div>Player {stopper.name} has left,</div>
              <div>resulting in the game's end!</div>
            </div>
          ) : (
            <div className="flex aspect-square h-[386px] w-full flex-col items-center justify-center gap-2 pb-24 text-[32px] drop-shadow">
              <div>The players tied,</div>
              <div>resulting in no winners!</div>
            </div>
          )}
        </main>
      ) : (
        <main className="absolute left-0 flex h-full w-full flex-col items-center justify-center max-xl:hidden">
          {winner && (
            <>
              <Title size={3}>RESULT</Title>
              <div className="mt-6 aspect-square h-[192px]">
                <Image
                  alt=""
                  src={winner.image || ""}
                  width={192}
                  height={192}
                  loading="lazy"
                  className="aspect-square h-full rounded-full object-cover drop-shadow"
                />
              </div>
              <div className="relative mt-10 w-fit">
                <div className="max-w-[320px] truncate text-[32px] font-semibold drop-shadow">
                  {winner?.name}
                </div>
                <div className="absolute -right-12 top-0 py-1">
                  <WinnerIcon size={1} />
                </div>
              </div>
              <div className="mt-4 mb-6 text-[28px] drop-shadow">
                {game.winnerScore} score
              </div>
            </>
          )}
        </main>
      )}
      {!winner && !winnerLoading ? (
        <main className="absolute left-0 flex h-full w-full items-center justify-center gap-12 overflow-auto max-lg:pt-[50px] xl:hidden">
          {stopper ? (
            <div className="flex aspect-square h-full w-full flex-col items-center justify-center gap-2 pt-6 text-[32px]">
              <div>Player {stopper.name} has left,</div>
              <div>resulting in the game's end!</div>
            </div>
          ) : (
            <div className="flex aspect-square h-full w-full flex-col items-center justify-center gap-2 pt-6 text-[32px]">
              <div>The players tied,</div>
              <div>resulting in no winners!</div>
            </div>
          )}
        </main>
      ) : (
        <main className="absolute left-0 flex h-full w-full items-center justify-center gap-12 overflow-auto max-lg:pt-[50px] xl:hidden">
          {winner && (
            <>
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
                    {winner?.name}
                  </div>
                  <div className="text-[28px] drop-shadow">
                    {game.winnerScore} score
                  </div>
                </div>
                <div className="py-1">
                  <WinnerIcon size={1} />
                </div>
              </div>
            </>
          )}
        </main>
      )}
      <div className="relative top-[100vh] flex min-h-screen w-full flex-col items-center justify-center gap-6 pt-[30px] pb-[50px]">
        <Title size={2}>LEADERBOARD</Title>
        <PlayersProfile {...props} />
      </div>
      <div className="fixed top-0 right-[48px] flex h-screen flex-col justify-center gap-4 lg:right-[60px]">
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
          className={`h-4 w-4 rounded-full shadow-lg ${
            page === 1 ? "bg-pink-300" : "bg-slate-300"
          }`}
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight - 80,
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
        const isWinner = player.id === game.winnerId && arrIdx === 0;

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
                  <div className="aspect-square h-[90%] drop-shadow">
                    <Image
                      alt=""
                      src={player.image || ""}
                      width={256}
                      height={256}
                      className="aspect-square h-full rounded-full object-cover"
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
                      <div className="flex h-[28px] items-center gap-1">
                        <ReserveIcon />
                        <span className="-mx-0.5 w-[48px] px-3 text-start">
                          {reserveCount}
                        </span>
                      </div>
                      <div className="flex h-[28px] items-center gap-1">
                        <TileIcon />
                        <span className="-mx-1 w-[48px] px-3 text-start">
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
