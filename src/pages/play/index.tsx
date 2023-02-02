import { GameStatus, Lobby } from "@prisma/client";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { FieldValues, useForm, UseFormRegister } from "react-hook-form";

import { api } from "../../utils/api";

export default function Play() {
  // const hello = api.user.findAll.useQuery().data;
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { isSubmitting, isDirty, isValid },
  } = useForm({ mode: "onChange" });

  const router = useRouter();
  const { data: sessionData } = useSession();
  const lobbyIdQuery: string = watch("lobbyId");

  const user = api.user.findById.useQuery(sessionData?.user.id);
  const createLobby = api.lobby.createOne.useMutation();
  const emptyLobby = api.lobby.findEmptyOne.useQuery(undefined, {
    refetchInterval: 5000
  });
  const uniqueLobby = api.lobby.findById.useQuery(lobbyIdQuery);
  const addUser = api.lobby.updateById.useMutation();

  const handleNewLobby = handleSubmit(async () => {
    await user.refetch();
    if (user.data) {
      await emptyLobby.refetch();
      if (emptyLobby.data) {
        const userData = {
          id: emptyLobby.data.id,
          playerId: user.data.id,
        };
        await addUser.mutateAsync(userData);
        router.push(`/play/lobby/${emptyLobby.data.id}`);
      } /*else {
      const newLobby = await createLobby.mutateAsync();
      router.push(`/play/lobby/${newLobby.id}`);
    }*/
    }
  });
  const handleCreateLobby = handleSubmit(async () => {
    const a = await createLobby.mutateAsync();
    alert(a.id);
  });
  const handleJoinLobby = handleSubmit(async () => {
    await user.refetch();
    if (user.data) {
      await uniqueLobby.refetch();
      if (uniqueLobby.data) {
        const userData = {
          id: uniqueLobby.data.id,
          playerId: user.data.id,
        };
        addUser.mutate(userData);
        router.push(`/play/lobby/${uniqueLobby.data.id}`);
      } /*else {
      const newLobby = await createLobby.mutateAsync();
      router.push(`/play/lobby/${newLobby.id}`);
    }*/
    }
  });

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
              disabled={!lobbyIdQuery || isSubmitting}
            >
              Join Lobby
            </Button>
          </div>
          <div>{lobbyIdQuery}</div>
          <div>{isSubmitting}</div>
          <div>{emptyLobby.isFetching.toString()}</div>
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
