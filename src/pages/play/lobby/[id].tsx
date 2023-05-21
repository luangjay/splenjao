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
import { ToastBar, Toaster, toast } from "react-hot-toast";
import Error404 from "../../404";

export default function Lobby() {
  // const hello = api.user.findAll.useQuery().data;
  const router = useRouter();
  const id = router.query.id as string;
  const { data: session } = useSession();
  const [isProcessing, setProcessing] = useState(false);

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
  const { data: player, isFetchedAfterMount: playerFetched } =
    api.lobby.findPlayer.useQuery(session?.user.id, { retry: false });
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
      utils.play.findPlayerById.invalidate();
    },
  });
  const clearLobby = api.lobby.clearLobby.useMutation();

  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on(SocketEvents.UpdateClient, (message) => {
        console.log("on: UpdateClient", message);
        lobbyRefetch();
      });
      socket.on(SocketEvents.ToastClient, (bread) => {
        console.log("on: ToastClient", bread);
        const { type, message } = bread;
        switch (type) {
          case "success":
            toast.success(message);
            break;
          case "error":
            toast.error(message);
            break;
          case "custom":
            toast.custom(message);
            break;
          default:
            toast(message);
        }
      });
      socket.emit(SocketEvents.UpdateServer);

      return () => {
        socket.off(SocketEvents.UpdateClient);
        socket.off(SocketEvents.ToastClient);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (player && playerFetched && player.games) {
      const playerLastGame = player.games[player.games.length - 1];
      if (playerLastGame && playerLastGame.status !== "ended") {
        router.replace(`/play/game/${playerLastGame.id}`);
      }
    }
  }, [player]);

  useEffect(() => {
    return () => toast.remove();
  }, []);

  const handleCreateGame = async () => {
    const toastId = toast.loading("Creating game");
    setProcessing(true);
    if (lobby && lobby.hostId && player) {
      const gameData = {
        hostId: lobby.hostId,
        playerCount: lobby.playerCount,
        playerIds: lobby.playerIds,
      };
      let game = await createGame.mutateAsync(gameData);
      toast.dismiss(toastId);
      toast.success("Game created");
      await updatePlayers.mutateAsync({
        ids: lobby.playerIds,
        playerId: player.id,
        lobbyId: lobby.id,
        gameId: game.id,
      });
      await clearLobby.mutateAsync({
        id: lobby.id,
        playerId: player.id,
      });
      toast.dismiss();
      setProcessing(false);
    } else {
      toast.dismiss(toastId);
      toast.error("Try again later");
      setProcessing(false);
    }
  };
  const handleLeaveLobby = async () => {
    const toastId = toast.loading("Leaving lobby");
    setProcessing(true);
    if (lobby && player && socket) {
      await leaveLobby.mutateAsync({
        id: lobby.id,
        playerId: player.id,
      });
      socket.emit(SocketEvents.UpdateServer);
      toast.dismiss(toastId);
      setProcessing(false);
      router.replace("/play");
    } else {
      toast.dismiss(toastId);
      toast.error("Try again later");
      setProcessing(false);
    }
  };

  if (playerFetched && lobbyError) return <Error404 />;
  if (!playerFetched || !player || !lobby) return <Layout />;
  return (
    <Layout>
      <Toaster gutter={20}>
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <div
                className="flex h-fit w-[320px] cursor-pointer items-center gap-2 p-4 text-xl text-slate-600"
                onClick={() => {
                  if (t.type !== "loading") {
                    toast.dismiss(t.id);
                  }
                }}
              >
                <div
                  className={
                    t.type === "loading"
                      ? "h-[24px] w-[24px] scale-[240%]"
                      : "h-[24px] w-[24px] scale-[150%]"
                  }
                >
                  {icon}
                </div>
                <div className="flex-1 text-center">{message}</div>
              </div>
            )}
          </ToastBar>
        )}
      </Toaster>
      <main className="flex h-screen flex-col items-center justify-center">
        {lobby.code}
        {player && lobby && player.id === lobby.hostId && (
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
