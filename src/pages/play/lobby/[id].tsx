import { GetServerSidePropsContext, type NextPage } from "next";
import { useSession } from "next-auth/react";
import Error from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { z } from "zod";

import { api } from "../../../utils/api";
import Layout from "../../../components/Layout";
import { useSocket } from "../../../hooks/useSocket";
import { SocketEvents } from "../../../common/types";

export default function Lobby() {
  // const hello = api.user.findAll.useQuery().data;
  const router = useRouter();
  const id = router.query.id as string;
  const { data: session } = useSession();

  const utils = api.useContext();
  const {
    data: lobby,
    refetch: lobbyRefetch,
    isLoading: lobbyLoading,
    isError: lobbyError,
  } = api.lobby.findAndAuthorize.useQuery(
    {
      id,
      playerId: session?.user.id,
    },
    {
      retry: false,
    }
  );
  const { data: player } = api.lobby.findPlayer.useQuery(
    session?.user.id || ""
  );
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
  const leaveLobby = api.lobby.leaveLobby.useMutation({
    async onSettled() {
      utils.lobby.findAndAuthorize.invalidate();
    },
  });
  const clearLobby = api.lobby.clearLobby.useMutation();

  useEffect(() => {
    if (player && player.games) {
      const playerLastGame = player.games[player.games.length - 1];
      if (
        playerLastGame &&
        playerLastGame.status !== "ended" &&
        playerLastGame.status !== "stopped"
      )
        router.replace(`/play/game/${playerLastGame.id}`);
    }
  }, [player]);

  const handleCreateGame = async () => {
    if (lobby && lobby.hostId && player) {
      const gameData = {
        hostId: lobby.hostId,
        playerCount: lobby.playerCount,
        playerIds: lobby.playerIds,
      };
      let game = await createGame.mutateAsync(gameData);
      updatePlayers.mutate({
        ids: lobby.playerIds,
        playerId: player.id,
        lobbyId: lobby.id,
        gameId: game.id,
      });
      clearLobby.mutate({
        id: lobby.id,
        playerId: player.id,
      });
    }
  };
  const handleLeaveLobby = async () => {
    if (lobby && player) {
      await leaveLobby.mutateAsync({
        id: lobby.id,
        playerId: player.id,
      });
      router.replace("/play");
    }
  };

  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on(SocketEvents.UpdateClient, (message) => {
        console.log("on: UpdateClient", message);
        lobbyRefetch();
      });
      socket.emit(SocketEvents.UpdateServer);
      return () => {
        socket.off(SocketEvents.UpdateClient);
      };
    }
  }, [socket]);

  if (lobbyLoading || !session?.user) return <></>;
  if (lobbyError) return <Error statusCode={404} />;
  return (
    <Layout>
      <main className="flex h-screen flex-col items-center justify-center">
        {lobby.code}
        {session?.user.id === lobby?.hostId && (
          <button
            className="rounded-md bg-cyan-200 p-2"
            onClick={handleCreateGame}
          >
            New game
          </button>
        )}
        <p>{lobby?.playerCount}</p>
        <button onClick={handleLeaveLobby}>LEAVE HAHA</button>
      </main>
    </Layout>
  );
}
