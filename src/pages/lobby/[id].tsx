import { GetServerSidePropsContext, type NextPage } from "next";
import { useSession } from "next-auth/react";
import Error from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { z } from "zod";

import { api } from "../../utils/api";
import Layout from "../../components/Layout";
import { useSocket } from "../../hooks/useSocket";
import { SocketEvents } from "../../common/types";
import { ToastBar, Toaster, toast, useToasterStore } from "react-hot-toast";
import Error404 from "../404";
import Title from "../../components/Title";
import Image from "next/image";

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
    isFetchedAfterMount: lobbyFetched,
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
  const {
    data: player,
    isFetchedAfterMount: playerFetched,
    refetch: playerRefetch,
  } = api.lobby.findPlayer.useQuery(session?.user.id, { retry: false });
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
      utils.play.findLobbyByCode.invalidate();
      utils.play.findLobbyById.invalidate();
    },
  });
  const clearLobby = api.lobby.clearLobby.useMutation();

  const socket = useSocket();

  useEffect(() => {
    (async () => {
      if (player && playerFetched && player.games) {
        const playerLastGame = player.games[player.games.length - 1];
        if (playerLastGame && playerLastGame.status !== "ended") {
          setProcessing(true);
          await router.replace(`/game/${playerLastGame.id}`);
          setProcessing(false);
        }
      }
    })();
  }, [player]);

  const handleCreateGame = async () => {
    if (!socket) return;
    setProcessing(true);
    if (lobby && lobby.playerCount < 2) {
      toast.error("Not enough players");
      setProcessing(false);
      return;
    }
    if (lobby && lobby.playerCount > 4) {
      toast.error("Too many players. How?!");
      setProcessing(false);
      return;
    }
    // const toastId = toast.loading("Starting game");
    socket.emit(SocketEvents.ToastServer, {
      type: "loading",
      message: "Starting game",
    });
    if (lobby && lobby.hostId && player && isHost) {
      const gameData = {
        hostId: lobby.hostId,
        playerCount: lobby.playerCount,
        playerIds: lobby.playerIds,
      };
      const game = await createGame.mutateAsync(gameData);
      // toast.dismiss(toastId);
      socket.emit(SocketEvents.ToastServer, {
        type: "dismiss",
      });
      // toast.success("Game started");
      socket.emit(SocketEvents.ToastServer, {
        type: "success",
        message: "Game started",
      });
      await updatePlayers.mutateAsync({
        ids: lobby.playerIds,
        playerId: player.id,
        lobbyId: lobby.id,
        gameId: game.id,
      });
      socket.emit(SocketEvents.UpdateServer);
      await clearLobby.mutateAsync({
        id: lobby.id,
        playerId: player.id,
      });
      // toast.dismiss();
      socket.emit(SocketEvents.ToastServer, {
        type: "dismiss",
      });
      setProcessing(false);
    } else {
      // toast.dismiss(toastId);
      socket.emit(SocketEvents.ToastServer, {
        type: "dismiss",
      });
      socket.emit(SocketEvents.ToastServer, {
        type: "error",
        message: "Try again later",
      });
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
      await router.replace("/");
      setProcessing(false);
    } else {
      toast.dismiss(toastId);
      toast.error("Try again later");
      setProcessing(false);
    }
  };

  useEffect(() => {
    toast.remove()
    return () => {
      toast.remove();
    };
  }, []);
  useEffect(() => {
    if (socket) {
      socket.on(SocketEvents.UpdateClient, async (message) => {
        console.log("on: UpdateClient", message);
        playerRefetch();
        lobbyRefetch();
      });
      socket.on(SocketEvents.ToastClient, (bread) => {
        console.log("on: ToastClient", bread);
        const { type, message } = bread;
        if (type === "loading" && message === "Starting game") {
          setProcessing(true);
        }
        switch (type) {
          case "success":
            toast.success(message);
            break;
          case "error":
            toast.success(message);
            break;
          case "loading":
            toast.loading(message);
            break;
          case "dismiss":
            toast.dismiss();
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

  // const { data: lobbyPlayers } = api.lobby.findPlayers.useQuery(
  //   lobby ? lobby.playerIds : []
  // );
  const lobbyPlayers = lobby ? lobby.players : [];
  const isHost = player && lobby ? player.id === lobby.hostId : false;

  // Enforce Limit
  const { toasts } = useToasterStore();
  useEffect(() => {
    toasts
      .filter((t) => t.visible) // Only consider visible toasts
      .filter((_, i) => i >= 3) // Is toast index over limit
      .forEach((t) => toast.dismiss(t.id)); // Dismiss – Use toast.remove(t.id) removal without animation
  }, [toasts]);

  if (playerFetched && lobbyFetched && lobbyError) return <Error404 />;
  if (!playerFetched || !lobbyFetched || !player || !lobby) return <Layout />;
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
      <main className="absolute left-0 flex h-full w-full flex-col items-center justify-center">
        <div className="mt-16 max-xl:hidden">
          <Title size={3}>LOBBY</Title>
        </div>
        <div className="flex aspect-square h-full w-full max-w-lg flex-col items-center justify-center pt-16 pb-2 text-lg lg:h-[386px] lg:pt-12 lg:text-2xl xl:justify-start xl:pt-2">
          <div className="flex items-center gap-4">
            <div className="mt-1 flex leading-none drop-shadow lg:mt-0.5">
              Room code
            </div>
            <div className="rounded-md bg-slate-200 px-1.5 py-1 font-mono text-[25px] font-semibold leading-none shadow lg:text-[32px]">
              {lobby.code}
            </div>
            <CopyButton code={lobby.code} />
          </div>
          <div className="m-[32px_0_26px_0] flex justify-center gap-8 lg:m-[40px_0_32px_0] xl:m-[60px_0_48px_0]">
            {lobbyPlayers ? (
              lobbyPlayers.map(
                (lobbyPlayer) =>
                  lobbyPlayer && (
                    <div className="flex h-[104px] flex-col items-center gap-2 drop-shadow lg:h-[130px] lg:gap-3">
                      <div className="relative flex aspect-square h-[72px] flex-col items-center lg:h-[90px]">
                        <Image
                          width={256}
                          height={256}
                          alt=""
                          src={lobbyPlayer.image || ""}
                          loading="lazy"
                          className="h-full w-full rounded-full object-cover"
                        />
                        {lobbyPlayer.id === lobby.hostId && (
                          <div className="absolute -top-4">
                            <HostIcon />
                          </div>
                        )}
                      </div>
                      <div className="max-w-[72px] truncate text-[14px] lg:max-w-[90px] lg:text-lg">
                        {lobbyPlayer.name}
                      </div>
                    </div>
                  )
              )
            ) : (
              <div className="h-[104px] lg:h-[130px]"></div>
            )}
          </div>
          <div className="flex gap-12 text-base lg:text-xl">
            <button
              disabled={isProcessing}
              onClick={handleLeaveLobby}
              className="w-[90px] rounded-lg bg-slate-200 p-1.5 font-medium text-slate-600 drop-shadow-sm hover:bg-slate-300 disabled:bg-slate-200 lg:w-[112px] lg:p-2"
            >
              Leave
            </button>
            {isHost && (
              <button
                disabled={isProcessing}
                onClick={handleCreateGame}
                className="w-[112px] rounded-lg bg-slate-600 p-1.5 font-medium text-slate-100 drop-shadow-sm hover:bg-slate-700 disabled:bg-slate-600 lg:w-[140px] lg:p-2"
              >
                Start game
              </button>
            )}
          </div>
        </div>
      </main>
      {/* ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
          : "bg-slate-600 text-slate-100 hover:bg-slate-700" */}
      {/* <main className="flex h-screen flex-col items-center justify-center">
        {lobby.code}
        {player && lobby && player.id === lobby.hostId && (
          <button
            disabled={isProcessing}
            onClick={handleCreateGame}
            className="rounded-md bg-cyan-200 p-2"
          >
            New game
          </button>
        )}
        <p>{lobby?.playerCount}</p>
        <button disabled={isProcessing} onClick={handleLeaveLobby}>
          LEAVE HAHA
        </button>
      </main> */}
    </Layout>
  );
}

const CopyButton = ({ code }: { code: number }) => {
  const [ok, setOk] = useState(false);
  const handleClick = async () => {
    copyToClipboard(code.toString());
    if (!ok) {
      setOk(true);
      await new Promise((resolve) => {
        setTimeout(resolve, 10000);
      });
      setOk(false);
    }
  };

  return (
    <button
      className="relative text-slate-600 hover:text-slate-700"
      onClick={handleClick}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" height="24px" width="24px">
        <path d="M14 8H4c-1.103 0-2 .897-2 2v10c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V10c0-1.103-.897-2-2-2z" />
        <path d="M20 2H10a2 2 0 00-2 2v2h8a2 2 0 012 2v8h2a2 2 0 002-2V4a2 2 0 00-2-2z" />
      </svg>
      {ok && (
        <svg
          fill="currentColor"
          viewBox="0 0 16 16"
          height="16px"
          width="16px"
          className="absolute top-[7px] left-[1px] fill-gray-100"
        >
          <path d="M10.97 4.97a.75.75 0 011.07 1.05l-3.99 4.99a.75.75 0 01-1.08.02L4.324 8.384a.75.75 0 111.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 01.02-.022z" />
        </svg>
      )}
    </button>
  );
};

const copyToClipboard = (text: string) => {
  // Create a textarea element
  var textarea = document.createElement("textarea");

  // Set the value of the textarea to the text you want to copy
  textarea.value = text;

  // Append the textarea to the DOM
  document.body.appendChild(textarea);

  // Select the text in the textarea
  textarea.select();

  // Copy the selected text to the clipboard
  document.execCommand("copy");

  // Remove the textarea from the DOM as we no longer need it
  document.body.removeChild(textarea);
};

const HostIcon = () => {
  return (
    <>
      <svg
        viewBox="0 0 576 512"
        fill="currentColor"
        height="28px"
        width="28px"
        className="mb-1 fill-pink-300 drop-shadow max-lg:hidden"
      >
        <path d="M309 106c11.4-7 19-19.7 19-34 0-22.1-17.9-40-40-40s-40 17.9-40 40c0 14.4 7.6 27 19 34l-57.3 114.6c-9.1 18.2-32.7 23.4-48.6 10.7L72 160c5-6.7 8-15 8-24 0-22.1-17.9-40-40-40S0 113.9 0 136s17.9 40 40 40h.7l45.7 251.4c5.5 30.4 32 52.6 63 52.6h277.2c30.9 0 57.4-22.1 63-52.6L535.3 176h.7c22.1 0 40-17.9 40-40s-17.9-40-40-40-40 17.9-40 40c0 9 3 17.3 8 24l-89.1 71.3c-15.9 12.7-39.5 7.5-48.6-10.7L309 106z" />
      </svg>
      <svg
        viewBox="0 0 576 512"
        fill="currentColor"
        height="23px"
        width="23px"
        className="mb-1 fill-pink-300 drop-shadow lg:hidden"
      >
        <path d="M309 106c11.4-7 19-19.7 19-34 0-22.1-17.9-40-40-40s-40 17.9-40 40c0 14.4 7.6 27 19 34l-57.3 114.6c-9.1 18.2-32.7 23.4-48.6 10.7L72 160c5-6.7 8-15 8-24 0-22.1-17.9-40-40-40S0 113.9 0 136s17.9 40 40 40h.7l45.7 251.4c5.5 30.4 32 52.6 63 52.6h277.2c30.9 0 57.4-22.1 63-52.6L535.3 176h.7c22.1 0 40-17.9 40-40s-17.9-40-40-40-40 17.9-40 40c0 9 3 17.3 8 24l-89.1 71.3c-15.9 12.7-39.5 7.5-48.6-10.7L309 106z" />
      </svg>
    </>
  );
};
