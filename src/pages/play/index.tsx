import { Lobby } from "@prisma/client";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FieldValues, useForm, UseFormRegister } from "react-hook-form";

import { api } from "../../utils/api";

export default function Play() {
  // const hello = api.user.findAll.useQuery().data;

  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { isSubmitting, isDirty, isValid },
  } = useForm({ mode: "onChange" });

  const { data: sessionData } = useSession();
  const inputLobbyId: string = watch("lobbyId");

  // const player = api.play.findPlayerById.useQuery(sessionData?.user.id, {
  //   refetchInterval: 2000
  // });

  const playerGames = api.play.findPlayerGames.useQuery(sessionData?.user.id);
  const playerLobby = api.play.findPlayerLobby.useQuery(sessionData?.user.id);
  const createLobby = api.play.createLobby.useMutation();
  const aLobby = api.play.findLobby.useQuery(undefined, {
    refetchInterval: 2000,
  });
  const theLobby = api.play.findLobbyById.useQuery(inputLobbyId);
  // const upsertPlayer = api.player.upsertOneOnLobbyJoin.useMutation();
  const updatePlayer = api.play.updatePlayer.useMutation();
  const updateLobby = api.play.updateLobby.useMutation();

  // const handleTabClosing = () => {
  //   removePlayerFromGame();
  // };

  // const alertUser = (event: any) => {
  //   event.preventDefault();
  //   event.returnValue = "";
  // };

  useEffect(() => {
    if (playerGames.data) {
      const playerLastGame = playerGames.data[playerGames.data.length - 1];
      if (playerLastGame && playerLastGame.status !== "final")
        router.replace(`/play/game/${playerLastGame.id}`);
    }
    if (playerLobby.data) {
      router.replace(`/play/lobby/${playerLobby.data.id}`);
    }
  }, [playerGames.data, playerLobby.data]);

  const handleNewLobby = handleSubmit(async () => {
    // await player.refetch();
    if (sessionData?.user) {
      // await aLobby.refetch();
      if (aLobby.data) {
        await addPlayerToLobby(aLobby.data);
        // router.push(`/play/lobby/${aLobby.data.id}`);
      } /*else {
      const newLobby = await createLobby.mutateAsync();
      router.push(`/play/lobby/${newLobby.id}`);
    }*/
    }
  });
  const handleCreateLobby = handleSubmit(async () => {
    if (sessionData?.user) {
      const a = await createLobby.mutateAsync(sessionData.user.id);
      alert(a.id);
    }
  });
  const handleJoinLobby = handleSubmit(async () => {
    // await player.refetch();
    if (sessionData?.user) {
      // await theLobby.refetch();
      if (theLobby.data) {
        // const userData = {
        //   id: uniqueLobby.data.id,
        //   playerId: user.data.id,
        // };
        await addPlayerToLobby(theLobby.data);
        // router.push(`/play/lobby/${theLobby.data.id}`);
      } /*else {
      const newLobby = await createLobby.mutateAsync();
      router.push(`/play/lobby/${newLobby.id}`);
      }*/
    }
  });

  const addPlayerToLobby = async (lobby: Lobby) => {
    // await player.refetch();
    if (sessionData?.user) {
      const lobbyData = {
        id: lobby.id,
        playerId: sessionData.user.id,
      };
      let goLobby = await updateLobby.mutateAsync(lobbyData);
      // alert(`XXXX ${JSON.stringify(goLobby)} XXXX`);
      if (goLobby) {
        const playerData = {
          id: sessionData?.user.id,
          lobbyId: lobby.id,
        };
        // const player = await upsertPlayer.mutateAsync(playerData);
        await updatePlayer.mutateAsync(playerData);
        // alert(`XXXX ${sessionData.user.id} XXXX`);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Splenjao</title>
        <meta name="description" content="Splenjao" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen flex-col items-center justify-center">
        <form
          className="flex w-1/4 flex-col items-center justify-center gap-4"
          // onSubmit={handleSubmit((data) => {
          //   return new Promise((resolve) => {
          //     setTimeout(resolve, 2000);
          //   });
          // })}
        >
          <div className="flex w-full justify-between">
            <Button onClick={handleNewLobby} disabled={isSubmitting}>
              New lobby
            </Button>
            <Button onClick={handleCreateLobby} disabled={isSubmitting}>
              Create Lobby --FORCE!
            </Button>
          </div>
          <div className="flex w-full justify-between gap-4">
            <Input id="lobbyId" register={register} placeholder="Lobby Id" />
            <Button
              onClick={handleJoinLobby}
              disabled={!inputLobbyId || isSubmitting}
            >
              Join Lobby
            </Button>
          </div>
          <div>{inputLobbyId}</div>
          <div>{isSubmitting}</div>
          <div>{aLobby.isFetching.toString()}</div>
        </form>
      </main>
    </>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  register: UseFormRegister<FieldValues>; // declare register props
  validationRules?: object;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  register,
  validationRules,
  type = "text",
  ...rest
}) => (
  <>
    {label && <label htmlFor={id}>{label}</label>}
    <input
      className="block w-full rounded border border-gray-100 bg-gray-100 p-1 px-2 text-sm text-gray-900 drop-shadow-md focus:border-blue-500 focus:bg-white focus:ring-blue-500"
      id={id}
      type={type}
      {...rest}
      {...register(id, validationRules)}
    />
  </>
);

const Button: React.FC<ButtonProps> = ({ children, ...props }) => (
  <button
    className="w-full rounded bg-[#98AAB4] p-2.5 text-center text-sm font-semibold text-[#213951] drop-shadow-md hover:bg-[#8b9ba3] focus:outline-none focus:ring-4 focus:ring-blue-300 sm:w-auto"
    {...props}
  >
    {children}
  </button>
);
