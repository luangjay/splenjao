import { Game } from "@prisma/client";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { api } from "../../utils/api";
import Layout from "../../components/Layout";

export default function Play() {
  const router = useRouter();
  const [inputCode, setInputCode] = useState("");
  const [isProcessing, setProcessing] = useState(false);

  const { data: session } = useSession();

  const utils = api.useContext();

  const { data: player, refetch: playerRefetch } = api.play.findPlayer.useQuery(
    session?.user.id || ""
  );
  const lobbyByCode = api.play.findLobbyByCode.useQuery(parseInt(inputCode), {
    retry: false,
    refetchInterval: 3600000,
  });
  const findEmptyLobbyAndUpdate =
    api.play.findEmptyLobbyAndUpdate.useMutation();
  const updatePlayer = api.play.updatePlayer.useMutation({
    async onSettled() {
      utils.play.findPlayer.invalidate();
    },
  });
  const updateLobby = api.play.updateLobby.useMutation({
    async onSettled() {
      utils.play.findLobbyById.invalidate();
      utils.play.findLobbyByCode.invalidate();
    },
  });

  useEffect(() => {
    if (player && player.games) {
      const playerLastGame = player.games[player.games.length - 1] as Game;
      if (playerLastGame && playerLastGame.status !== "ended")
        router.replace(`/play/game/${playerLastGame.id}`);
    }
    if (player?.lobby) {
      router.replace(`/play/lobby/${player.lobby.id}`);
    }
  }, [player]);

  const addPlayerToLobby = async (lobbyId: string) => {
    await playerRefetch();
    if (player) {
      let goLobby = await updateLobby.mutateAsync({
        id: lobbyId,
        playerId: player.id,
      });
      if (goLobby) {
        const playerData = {
          id: player.id,
          lobbyId: lobbyId,
        };
        await updatePlayer.mutateAsync(playerData);
      }
    }
  };
  const handleNewLobby = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await playerRefetch();
    if (player) {
      const lobby = await findEmptyLobbyAndUpdate.mutateAsync();
      if (lobby) {
        await addPlayerToLobby(lobby.id);
      }
    }
  };
  const handleJoinLobby = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await playerRefetch();
    if (player) {
      await lobbyByCode.refetch();
      if (lobbyByCode.data) {
        await addPlayerToLobby(lobbyByCode.data.id);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputCode(e.target.value.replace(/\D/g, "").slice(0, 6));
  };

  return (
    <Layout>
      <main className="flex h-screen flex-col items-center justify-center">
        <div
          className="flex w-1/4 flex-col items-center justify-center gap-4"
          // onSubmit={handleSubmit((data) => {
          //   return new Promise((resolve) => {
          //     setTimeout(resolve, 2000);
          //   });
          // })}
        >
          <div className="flex w-full justify-between">
            <button onClick={handleNewLobby} disabled={isProcessing}>
              New lobby
            </button>
          </div>
          <form className="flex w-full justify-between gap-4">
            <input
              id="lobbyId"
              placeholder="Lobby Id"
              value={inputCode}
              onChange={handleChange}
            />
            <button
              type="submit"
              onClick={handleJoinLobby}
              disabled={!inputCode || isProcessing}
            >
              Join Lobby
            </button>
          </form>
          <div>{lobbyByCode?.data?.id}</div>
          <div>{JSON.stringify(isProcessing)}</div>
        </div>
      </main>
    </Layout>
  );
}
