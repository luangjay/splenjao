import { GameStatus } from "@prisma/client";
import { GetServerSidePropsContext, type NextPage } from "next";
import { useSession } from "next-auth/react";
import Error from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { z } from "zod";

import { api } from "../../../utils/api";

export default function Lobby() {
  // const hello = api.user.findAll.useQuery().data;
  const router = useRouter();
  const id = router.query.id as string;
  const { data: sessionData } = useSession();
  const [message, setMessage] = useState("");

  const lobby = api.lobby.findById.useQuery(id, {
    retry: false,
    onError() {
      // maybe handle error here
    },
  });
  const user = api.user.findById.useQuery(sessionData?.user.id, {
    refetchInterval: 1000,
  });
  const createGame = api.game.createOne.useMutation();
  const upsertPlayer = api.player.upsertOne.useMutation();

  const handleClick = async () => {
    await user.refetch();
    if (user.data && lobby.data) {
      const gameData = {
        playerCount: lobby.data.playerCount,
        playerIds: [user.data.id],
        shuffle: {
          lv1_ids: shuffleArray(Array.from(shuffle(0, 40))),
          lv2_ids: shuffleArray(Array.from(shuffle(40, 70))),
          lv3_ids: shuffleArray(Array.from(shuffle(70, 90))),
          noble_ids: shuffleArray(Array.from(shuffle(0, 10))),
        },
        status: "starting" as GameStatus,
      };
      let game = await createGame.mutateAsync(gameData);
      setMessage(`Create game success, game id: ${game.id}`);
      // alert(`XXXX ${game.id} XXXX`);
      const playerData = {
        id: user.data.id,
        name: user.data.name,
        image: user.data.image,
        gameId: game.id,
      };
      let player = await upsertPlayer.mutateAsync(playerData);
      // alert(`XXXX ${player.id} XXXX`);
      setMessage(
        (prev) => (prev += `\nCreate player success, player id: ${player.id}`)
      );
    }
  };

  if (lobby.isLoading) return <></>;
  if (lobby.isError) return <Error statusCode={404} />;
  return (
    <>
      <Head>
        <title>Splenjao</title>
        <meta name="description" content="Splenjao" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen flex-col items-center justify-center">
        <button className="rounded-md bg-cyan-200 p-2" onClick={handleClick}>
          New game
        </button>
        <p>{message}</p>
        <p>{lobby.data?.playerCount}</p>
      </main>
    </>
  );
}

const shuffle = (begin: number, end: number) => {
  return shuffleArray(Array.from({ length: end - begin }, (_, i) => begin + i));
};

// DON'T TOUCH: Durstenfeld shuffle
const shuffleArray = (array: number[]) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    let j = (Math.random() * (i + 1)) | 0;
    [result[i], result[j]] = [result[j] as number, result[i] as number];
  }
  return result;
};
