import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../../../utils/api";
import Card from "../../../components/Card";
import Deck from "../../../components/Deck";
import { useRouter } from "next/router";
import Error from "next/error";
import { useEffect, useState } from "react";

export default function Game() {
  const router = useRouter();
  const id = router.query.id as string;
  const { data: sessionData } = useSession();

  const [countdown, setCountdown] = useState(0);
  const [isNextTurn, setNextTurn] = useState(false);
  const [isValidTab, setValidTab] = useState(false);

  const utils = api.useContext();

  const player = api.gamex.findPlayerById.useQuery(sessionData?.user.id, {
    refetchInterval: 5000,
  });
  const updatePlayerLastPlayed = api.gamex.updatePlayerLastPlayed.useMutation({
    async onSettled() {
      utils.gamex.findPlayerById.invalidate();
    },
  });

  const game = api.gamex.findAndAuthorize.useQuery(
    {
      id,
      playerId: sessionData?.user.id,
    },
    {
      retry: false,
      refetchInterval: 1000,
      refetchIntervalInBackground: true,
      notifyOnChangeProps: "all",
    }
  );
  const updateNextTurn = api.gamex.updateNextTurn.useMutation({
    async onSettled() {},
  });

  useEffect(() => {
    if (
      player.data &&
      (!player.data.lastPlayed ||
        new Date() >= addSeconds(player.data.lastPlayed, 10))
    ) {
      setValidTab(true);
    }
  }, [player.data]);

  // useEffect(() => {
  //   if (
  //     player.data &&
  //     (!player.data.lastPlayed ||
  //       new Date() >= addSeconds(player.data.lastPlayed, 10))
  //   ) {
  //     setValidTab(true);
  //   }
  // }, [player.data]);

  useEffect(() => {
    if (sessionData) {
      updatePlayerLastPlayed.mutate(sessionData.user.id);
    }
  }, [isValidTab]);

  // useEffect(() => {
  //   if (isValidTab) {
  //     const interval = setInterval(() => {
  //       if (sessionData && game.data) {
  //         updatePlayerLastPlayed.mutate(sessionData.user.id);
  //       }
  //     }, 5000);
  //     return () => clearInterval(interval);
  //   }
  // }, [isValidTab]);

  useEffect(() => {
    if (isValidTab) {
      if (sessionData && game.data) {
        updatePlayerLastPlayed.mutate(sessionData.user.id);
      }
    }
  }, [player.data]);

  useEffect(() => {
    if (game.data && isValidTab) {
      const startTime = game.data.nextTurn.startTime;
      if (startTime) setCountdown((startTime.getTime() - Date.now()) / 1000);
    }
  }, [game.data, isValidTab]);

  // useEffect(() => {
  //   if (countdown < 0 && game.data && sessionData) {
  //     const updateData = {
  //       id: game.data.id,
  //       playerId: sessionData.user.id,
  //     };
  //     updateNextTurn.mutate(updateData);
  //     setCountdown(0);
  //   }
  // }, [game.data]);

  useEffect(() => {
    if (
      countdown < 0 &&
      sessionData?.user.id === game.data?.hostId &&
      isValidTab
    ) {
      setNextTurn(true);
    }
  }, [game.data, isValidTab]);

  useEffect(() => {
    if (isNextTurn && game.data && sessionData && isValidTab) {
      setCountdown(0);
      setNextTurn(false);
      const updateData = {
        id: game.data.id,
        playerId: sessionData.user.id,
      };
      updateNextTurn.mutate(updateData);
    }
  }, [game.data, isNextTurn, isValidTab]);

  if (game.isLoading || !sessionData?.user) return <></>;
  if (!isValidTab)
    return (
      <>
        <p>Looks like you are playing in another tab.</p>
        <p>If not, please wait a moment...</p>
      </>
    );
  if (game.isError) return <Error statusCode={404} />;
  return (
    <>
      <Head>
        <title>Splenjao</title>
        <meta name="description" content="Splenjao" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen justify-between border-2 border-green-400">
        <div className="w-1/5 border-2">
          {Math.max(Math.ceil(countdown), 0)} {game.data.currentTurn.playerIdx}
        </div>
        <div className="grid place-content-center border-2 border-red-500">
          <div className="w-fit border-2">
            <Deck shuffle={game.data.shuffle} />
          </div>
        </div>
        <div className="w-1/5 border-2">
          {sessionData.user.id ===
            game.data.playerIds[game.data.currentTurn.playerIdx] &&
            "This is your turn."}
        </div>
      </main>
    </>
  );
}

const addSeconds = (date: Date, seconds: number) => {
  date.setSeconds(date.getSeconds() + seconds);
  return date;
};

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">
        {sessionData && <span>{sessionData.user?.name}</span>}
      </p>
    </div>
  );
};
