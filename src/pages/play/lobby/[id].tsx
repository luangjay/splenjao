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

  // const user = api.user.findById.useQuery(sessionData?.user.id, {
  //   refetchInterval: 1000,
  // });

  const utils = api.useContext();
  const lobby = api.lobby.findAndAuthorize.useQuery(
    {
      id,
      playerId: sessionData?.user.id,
    },
    {
      retry: false,
    }
  );
  const player = api.lobby.findPlayer.useQuery(sessionData?.user.id);
  const createGame = api.lobby.createGame.useMutation({
    async onSettled() {
      utils.lobby.findPlayer.invalidate();
    },
  });
  const updatePlayers = api.lobby.updatePlayers.useMutation({
    async onSettled() {
      utils.lobby.findPlayer.invalidate();
    },
  });
  const clearThisLobby = api.lobby.clearThisLobby.useMutation();

  useEffect(() => {
    if (player.data?.games) {
      const playerLastGame = player.data.games[player.data.games.length - 1];
      if (playerLastGame && playerLastGame.status !== "end")
        router.replace(`/play/game/${playerLastGame.id}`);
    }
  }, [player.data]);

  const handleClick = async () => {
    if (sessionData && lobby.data) {
      const gameData = {
        hostId: sessionData?.user.id,
        playerCount: lobby.data.playerCount,
        playerIds: lobby.data.playerIds,
      };
      let game = await createGame.mutateAsync(gameData);
      // setMessage(`Create game success, game id: ${game.id}`);
      // alert(`XXXX ${game.id} XXXX`);
      updatePlayers.mutate({
        ids: lobby.data.playerIds,
        playerId: sessionData.user.id,
        lobbyId: lobby.data.id,
        gameId: game.id,
      });
      clearThisLobby.mutate({
        id: lobby.data.id,
        playerId: sessionData.user.id,
      });
      // router.push(`/play/game/${game.id}`);
      // setMessage(
      //   (prev) => (prev += `\nCreate player success, player id: ${player.id}`)
      // );
    }
  };

  if (lobby.isLoading || !sessionData?.user) return <></>;
  if (lobby.isError) return <Error statusCode={404} />;
  return (
    <>
      <Head>
        <title>Splenjao</title>
        <meta name="description" content="Splenjao" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen flex-col items-center justify-center">
        {sessionData?.user.id === lobby.data?.hostId && (
          <button className="rounded-md bg-cyan-200 p-2" onClick={handleClick}>
            New game
          </button>
        )}
        <p>{message}</p>
        <p>{lobby.data?.playerCount}</p>
      </main>
    </>
  );
}
