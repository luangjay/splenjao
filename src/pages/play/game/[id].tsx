import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../../../utils/api";
import Card from "../../../components/Card";
import Deck from "../../../components/Deck";
import Token from "../../../components/Token";
import { useRouter } from "next/router";
import Error from "next/error";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { Tokens } from "@prisma/client";
import { PlayerState, SocketEvents } from "../../../common/types";
import TokenContainer from "../../../components/TokenContainer";
import ActionDialog from "../../../components/Dialog";
import { InventoryKey, TokenColor } from "../../../common/types";
import { useSocket } from "../../../hooks/useSocket";
import Others from "../../../components/Others";
import Me from "../../../components/Me";

const defaultPrice = {
  white: 0,
  blue: 0,
  green: 0,
  red: 0,
  black: 0,
};

const defaultTokens = {
  white: 0,
  blue: 0,
  green: 0,
  red: 0,
  black: 0,
  gold: 0,
};

export default function Game() {
  // ROUTER HOOKS
  const router = useRouter();
  const id = router.query.id as string;

  // SESSION HOOKS
  const session = useSession();

  // const [message, setMessage] = useState<string>();
  // const [nextTurn, setNextTurn] = useState(false);
  // const [turnLoading, setTurnLoading] = useState(false);

  // CONTEXT HOOKS
  const utils = api.useContext();

  // REACT QUERY HOOKS
  const { data: player } = api.game.findPlayerById.useQuery(
    session.data?.user.id
    // EXPENSIVE SHIT
    // {
    //   refetchInterval: 8000,
    // }
  );
  const {
    data: game,
    error: gameError,
    refetch: gameRefetch,
  } = api.game.findAndAuthorize.useQuery(
    {
      id,
      playerId: session.data?.user.id,
    },
    {
      retry: false,
      // notifyOnChangeProps: ["data"],
      // refetchInterval: 1000,
    }
  );
  const updatePlayerLastPlayed = api.game.updatePlayerLastPlayed.useMutation({
    async onSettled() {
      utils.game.findAndAuthorize.invalidate();
    },
  });
  const updateNextTurn = api.game.updateNextTurn.useMutation({
    async onSettled() {
      utils.game.findAndAuthorize.invalidate();
    },
  });

  // STATE HOOKS
  // const [validTab, setValidTab] = useState(false);
  const [validTab, setValidTab] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const [playerState, setPlayerState] = useState<PlayerState>({
    // reset: false,
    success: false,
    currentAction: null,
    resourceTokens: { ...defaultTokens },
    inventoryTokens: { ...defaultTokens },
    playerTokens: { ...defaultTokens },
    priceToReplace: { ...defaultPrice },
    selectedCard: null,
    selectedCardColor: null,
    hasExtraTurn: false,
    isNextTurn: false,
    message: "",
  });

  // HELPER CONSTANTS
  const playerTurn =
    player && game && player.id === game.playerIds[game.turnIdx];

  const playerHost = player && game && player.id === game.hostId;

  // APP PROTOCOL HOOKS
  // useEffect(() => {
  //   if (
  //     player &&
  //     game &&
  //     (!player.lastPlayed || new Date() >= addSeconds(player.lastPlayed, 10))
  //   ) {
  //     setValidTab(true);
  //     updatePlayerLastPlayed.mutate(player.id);
  //   }
  // }, [player, game]);

  // useInterval(() => {
  //   if (validTab && player && game) {
  //     updatePlayerLastPlayed.mutate(player.id);
  //   }
  // }, 5000);

  // GAME PROTOCOL HOOKS
  useInterval(() => {
    if (validTab && player && game?.status === "starting") {
      const cd = 15 + (game.createdAt.getTime() - Date.now()) / 1000;
      setCountdown(cd);
      if (playerHost && cd <= 0) {
        setPlayerState((prev) => ({ ...prev, isNextTurn: true }));
      }
    }
  }, 500);

  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on(SocketEvents.UpdateClient, (message) => {
        console.log("on: UpdateClient", message);
        gameRefetch();
      });
      return () => {
        socket.off(SocketEvents.UpdateClient);
      };
    }
  }, [socket]);

  const [a, setA] = useState(0);
  // GAME LOGIC HOOKS
  useEffect(() => {
    (async () => {
      // alert(JSON.stringify(game?.resource.tokens));
      // alert(game.isRefetchError);
      if (player && game) {
        await gameRefetch();
        setPlayerState({
          // reset: false,
          success: false,
          currentAction: null,
          resourceTokens: game ? game.resource.tokens : { ...defaultTokens },
          inventoryTokens:
            game && game.status !== "starting"
              ? game[`inventory${game.turnIdx}` as InventoryKey].tokens
              : { ...defaultTokens },
          playerTokens: { ...defaultTokens },
          priceToReplace: { ...defaultPrice },
          selectedCard: null,
          selectedCardColor: null,
          hasExtraTurn: false,
          isNextTurn: false,
          message: "",
        });
      }
    })();
    setA((prev) => prev + 1);
  }, [/*validTab,*/ game?.turnIdx]);

  useEffect(() => {
    (async () => {
      if (validTab && player && game && playerState.isNextTurn) {
        await updateNextTurn.mutateAsync({
          id: game.id,
          playerId: player.id,
          playerState,
        });
        setPlayerState((prev) => ({ ...prev, isNextTurn: false }));
        socket?.emit(SocketEvents.UpdateServer);
      }
    })();
  }, [playerState.isNextTurn]);

  // useEffect(() => {
  //   if (game && game.status === "ended") {
  //     alert(`winner id: ${game.winnerId}\nwinner score: ${game.winnerScore}`);
  //   }
  // }, [game?.status]);

  const [openOthers, setOpenOthers] = useState(false);
  const [openMe, setOpenMe] = useState(false);

  // if (gameError) return <Error statusCode={404} />;
  if (gameError) return <Error statusCode={404} />;
  if (!player || !game) return <></>;
  if (!validTab) {
    return (
      <>
        <p>It looks like you are playing in another instance.</p>
        <p>If not, please wait a moment...</p>
      </>
    );
  }
  // if (game.isError) return <Error statusCode={404} />;
  return (
    <>
      <Head>
        <title>Splenjao</title>
        <meta name="description" content="Splenjao" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <main className="flex min-h-screen justify-between bg-[url('/background.jpg')] bg-cover text-xl text-[#111827]"> */}
      <main className="relative flex h-screen select-none bg-gray-100 text-xl text-slate-600">
        <div
          className="fixed z-10 flex h-full items-center overflow-hidden bg-gray-200/[.5] drop-shadow backdrop-blur-sm transition-width delay-[500]"
          style={{ width: openOthers ? "312px" : 0 }}
        >
          <div className="flex h-full flex-1 flex-col justify-between">
            <Others game={game} me={player} />
          </div>
          <button
            className="mx-0.5 flex h-[72px] items-center rounded-lg hover:bg-white/[.4]"
            onClick={() => setOpenOthers((prev) => !prev)}
          >
            <LeftIcon />
          </button>
        </div>
        <div className="fixed z-10 flex h-full items-center drop-shadow">
          <button
            className="flex h-[72px] items-center rounded-[0_8px_8px_0] bg-gray-200/[.5] transition-width delay-[500] hover:bg-gray-200/[.2]"
            style={{ width: !openOthers ? "36px" : 0 }}
            onClick={() => setOpenOthers((prev) => !prev)}
          >
            <RightIcon />
          </button>
        </div>
        <div className="mx-auto flex h-fit min-h-full items-center justify-center">
          <Deck
            game={game}
            player={player}
            playerState={playerState}
            setPlayerState={setPlayerState}
          />
        </div>
        <div
          className="fixed right-0 z-10 flex h-full items-center overflow-hidden bg-gray-200/[.5] drop-shadow backdrop-blur-sm transition-width delay-100"
          style={{ width: openMe ? "312px" : 0 }}
        >
          <button
            className="mx-0.5 flex h-[72px] items-center rounded-lg hover:bg-white/[.4]"
            onClick={() => setOpenMe((prev) => !prev)}
          >
            <RightIcon />
          </button>
          <div className="flex h-full flex-1 flex-col justify-between">
            <Me game={game} me={player} />
          </div>
        </div>
        <div className="fixed right-0 z-10 flex h-full items-center drop-shadow">
          <button
            className="flex h-[72px] items-center rounded-[0_8px_8px_0] bg-gray-200/[.5] transition-width delay-100 hover:bg-gray-200/[.2]"
            style={{ width: !openMe ? "36px" : 0 }}
            onClick={() => setOpenMe((prev) => !prev)}
          >
            <LeftIcon />
          </button>
        </div>
        {/* DIALOG */}
        <ActionDialog
          game={game}
          player={player}
          playerState={playerState}
          setPlayerState={setPlayerState}
        />
      </main>
    </>
  );
}

const addSeconds = (date: Date, seconds: number) => {
  date.setSeconds(date.getSeconds() + seconds);
  return date;
};

function useInterval(callback: Function, delay: number) {
  const intervalRef = useRef<NodeJS.Timer>();
  const callbackRef = useRef(callback);

  // Remember the latest callback:
  //
  // Without this, if you change the callback, when setInterval ticks again, it
  // will still call your old callback.
  //
  // If you add `callback` to useEffect's deps, it will work fine but the
  // interval will be reset.

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Set up the interval:

  useEffect(() => {
    intervalRef.current = setInterval(() => callbackRef.current(), delay);

    // Clear interval if the components is unmounted or the delay changes:
    return () => clearInterval(intervalRef.current);
  }, [delay]);

  // Returns a ref to the interval ID in case you want to clear it manually:
  return intervalRef;
}

function useTimeout(callback: Function, delay: number) {
  const timeoutRef = useRef<NodeJS.Timer>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    timeoutRef.current = setInterval(() => callbackRef.current(), delay);
    return () => clearInterval(timeoutRef.current);
  }, [delay]);

  return timeoutRef;
}

function LeftIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 16 16" height="36px" width="36px">
      <path
        fillRule="evenodd"
        d="M11.354 1.646a.5.5 0 010 .708L5.707 8l5.647 5.646a.5.5 0 01-.708.708l-6-6a.5.5 0 010-.708l6-6a.5.5 0 01.708 0z"
      />
    </svg>
  );
}

function RightIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 16 16" height="36px" width="36px">
      <path
        fillRule="evenodd"
        d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z"
      />
    </svg>
  );
}
