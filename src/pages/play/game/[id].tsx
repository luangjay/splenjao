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
import { PlayerState } from "../../../common/types";
import TokenContainer from "../../../components/TokenContainer";
import ActionDialog from "../../../components/Dialog";
import { InventoryKey, TokenColor } from "../../../common/types";

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
    session.data?.user.id,
    {
      refetchInterval: 8000,
    }
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
  const [validTab, setValidTab] = useState(false);
  const [countdown, setCountdown] = useState(0);
  // const [userState, setUserState] = useState<UserState>({
  //   validTab: false,
  //   countdown: 0,
  //   message: "",
  // });

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
  useEffect(() => {
    if (
      player &&
      game &&
      (!player.lastPlayed || new Date() >= addSeconds(player.lastPlayed, 10))
    ) {
      setValidTab(true);
      updatePlayerLastPlayed.mutate(player.id);
    }
  }, [player, game]);

  useInterval(() => {
    if (validTab && player && game) {
      updatePlayerLastPlayed.mutate(player.id);
    }
  }, 5000);

  // GAME PROTOCOL HOOKS
  useInterval(() => {
    if (validTab && player && game?.status === "created") {
      const cd = 15 + (game.createdAt.getTime() - Date.now()) / 1000;
      setCountdown(cd);
      if (playerHost && cd <= 0) {
        setPlayerState((prev) => ({ ...prev, isNextTurn: true }));
      }
    }
  }, 500);

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
            game && game.status !== "created"
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
    if (validTab && player && game && playerState.isNextTurn) {
      updateNextTurn.mutateAsync({
        id: game.id,
        playerId: player.id,
        playerState,
      });
      setPlayerState((prev) => ({ ...prev, isNextTurn: false }));
    }
  }, [playerState.isNextTurn]);

  // if (gameError) return <Error statusCode={404} />;
  if (!player || !game) return <></>;
  if (gameError) return <Error statusCode={404} />;
  if (!validTab)
    return (
      <>
        <p>It looks like you are playing in another instance.</p>
        <p>If not, please wait a moment...</p>
      </>
    );
  // if (game.isError) return <Error statusCode={404} />;
  return (
    <>
      <Head>
        <title>Splenjao</title>
        <meta name="description" content="Splenjao" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <main className="flex min-h-screen justify-between bg-[url('/background.jpg')] bg-cover text-xl text-[#111827]"> */}
      <main className="flex min-h-screen justify-between overflow-scroll bg-gray-100 text-xl text-[#111827]">
        <div className="flex min-w-[288px] flex-col justify-between border">
          <div className="flex flex-col">
            <div>{countdown}</div>
            <div>{game.turnIdx}</div>
          </div>
          {/* <TokenContainer
            game={game}
            player={player}
            playerState={playerState}
            setPlayerState={setPlayerState}
          /> */}
        </div>
        <div className="grid flex-grow place-content-center overflow-scroll border">
          <div className="w-fit">
            <Deck
              game={game}
              player={player}
              playerState={playerState}
              setPlayerState={setPlayerState}
            />
          </div>
        </div>
        <div className="flex min-w-[288px] flex-col border">
          {/* <div>{playerState.message}</div>
          <div className="w-[50px]">{JSON.stringify(game.status)}</div>
          <div className="w-[50px]">{JSON.stringify(player.id)}</div>
          <div className="w-[50px]">{JSON.stringify(playerState)}</div> */}
          {/* DUMMY begin */}
          <button
            className="border-2"
            onClick={() => {
              if (playerTurn)
                setPlayerState((prev) => ({ ...prev, currentAction: "take" }));
            }}
          >
            Take
          </button>
          <button
            className="border-2"
            onClick={() => {
              if (playerTurn)
                setPlayerState((prev) => ({
                  ...prev,
                  currentAction: "reserve",
                  cardId: 7,
                }));
            }}
          >
            Reserve
          </button>
          <div className="font-nova-flat">Turn count: {a}</div>
          {/* DUMMY end */}
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

// const AuthShowcase: React.FC = () => {
//   const { data: sessionData } = useSession();

//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <p className="text-center text-2xl">
//         {sessionData && <span>{sessionData.user?.name}</span>}
//       </p>
//     </div>
//   );
// };

// // multi tab detection
// function register_tab_GUID() {
//   // detect local storage available
//   if (typeof Storage !== "undefined") {
//     // get (set if not) tab GUID and store in tab session
//     if (sessionStorage["tabGUID"] == null)
//       sessionStorage["tabGUID"] = tab_GUID();
//     var guid = sessionStorage["tabGUID"];

//     // add eventlistener to local storage
//     window.addEventListener("storage", storage_Handler, false);

//     // set tab GUID in local storage
//     localStorage["tabGUID"] = guid;
//   }
// }

// function storage_Handler(e: StorageEvent) {
//   // if tabGUID does not match then more than one tab and GUID
//   if (e.key == "tabGUID") {
//     if (e.oldValue != e.newValue) tab_Warning();
//   }
// }

// function tab_GUID() {
//   function s4() {
//     return Math.floor((1 + Math.random()) * 0x10000)
//       .toString(16)
//       .substring(1);
//   }
//   return (
//     s4() +
//     s4() +
//     "-" +
//     s4() +
//     "-" +
//     s4() +
//     "-" +
//     s4() +
//     "-" +
//     s4() +
//     s4() +
//     s4()
//   );
// }

// function tab_Warning() {
//   alert("Another tab is open!");
// }
