import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../../../utils/api";
import CardComponent from "../../../components/CardComponent";
import CardContainer from "../../../components/CardContainer";
import TokenComponent from "../../../components/TokenComponent";
import { useRouter } from "next/router";
import Error from "next/error";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { Tokens } from "@prisma/client";
import { PlayerState, UserState } from "../../../common/interfaces";
import TokenContainer from "../../../components/TokenContainer";
import Dialog from "../../../components/ActionDialog";
import { InventoryKey, TokenColor } from "../../../common/types";

const allTokenColors = [
  "white",
  "blue",
  "green",
  "red",
  "black",
  "gold",
] as TokenColor[];

const tokens = {
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
  const player = api.gamex.findPlayerById.useQuery(session.data?.user.id, {
    refetchInterval: 8000,
  });
  const game = api.gamex.findAndAuthorize.useQuery(
    {
      id,
      playerId: session.data?.user.id,
    },
    {
      retry: false,
      refetchInterval: 1000,
    }
  );
  const updatePlayerLastPlayed = api.gamex.updatePlayerLastPlayed.useMutation({
    async onSettled() {
      utils.gamex.findAndAuthorize.invalidate();
    },
  });
  const updateNextTurn = api.gamex.updateNextTurn.useMutation({
    async onSettled() {
      utils.gamex.findAndAuthorize.invalidate();
    },
  });

  // STATE HOOKS
  // const [isValidTab, setValidTab] = useState(false);
  // const [countdown, setCountdown] = useState(0);
  const [userState, setUserState] = useState<UserState>({
    validTab: false,
    countdown: 0,
    nextTurn: false,
    updating: false,
    message: "",
  });

  const [playerState, setPlayerState] = useState<PlayerState>({
    success: false,
    action: null,
    cardId: null,
    resourceTokens: game.data ? game.data.resource.tokens : { ...tokens },
    playerTokens: { ...tokens },
    inventoryTokens:
      game.data && game.data.status !== "created"
        ? game.data[`inventory${game.data.turnIdx}` as InventoryKey].tokens
        : { ...tokens },
  });

  const resetPlayerState = async () => {
    await game.refetch();
    // alert(JSON.stringify(game.data?.resource.tokens));
    // alert(game.isRefetchError);
    if (player.data && game.data) {
      setPlayerState({
        success: false,
        action: null,
        cardId: null,
        resourceTokens: game.data ? game.data.resource.tokens : { ...tokens },
        playerTokens: { ...tokens },
        inventoryTokens:
          game.data && game.data.status !== "created"
            ? game.data[`inventory${game.data.turnIdx}` as InventoryKey].tokens
            : { ...tokens },
      });
    }
  };

  // HELPER CONSTANTS
  const playerTurn =
    player.data &&
    game.data &&
    player.data.id === game.data.playerIds[game.data.turnIdx];

  const playerHost =
    player.data && game.data && player.data.id === game.data.hostId;

  // APP PROTOCOL HOOKS
  useEffect(() => {
    if (
      player.data &&
      game.data &&
      (!player.data.lastPlayed ||
        new Date() >= addSeconds(player.data.lastPlayed, 10))
    ) {
      setUserState((prev) => ({ ...prev, validTab: true }));
      updatePlayerLastPlayed.mutate(player.data.id);
    }
  }, [player.data, game.data]);

  useInterval(() => {
    if (userState.validTab && player.data && game.data) {
      updatePlayerLastPlayed.mutate(player.data.id);
    }
  }, 5000);

  // GAME PROTOCOL HOOKS
  useEffect(() => {
    (async () => {
      if (
        userState.validTab &&
        player.data &&
        game.data?.status === "created"
      ) {
        const cd = 30 + (game.data.createdAt.getTime() - Date.now()) / 1000;
        setUserState((prev) => ({ ...prev, countdown: cd }));
        if (playerHost && cd <= 0) {
          // setUserState((prev) => ({ ...prev, updating: true }));
          // setCountdown(0);
          setUserState((prev) => ({ ...prev, nextTurn: true }));

          // await new Promise((resolve) => {
          //   setTimeout(resolve, 900);
          // });
          // setUserState((prev) => ({ ...prev, updating: false }));
        }
      }
    })();
  }, [game.data]);

  useEffect(() => {
    resetPlayerState();
  }, [userState.validTab, game.data?.resource]);

  const [a, setA] = useState(0);

  useEffect(() => {
    (async () => {
      if (
        userState.validTab &&
        player.data &&
        game.data &&
        userState.nextTurn
      ) {
        await updateNextTurn.mutateAsync({
          id: game.data.id,
          playerId: player.data.id,
          playerState,
        });
        await resetPlayerState();
        // alert(JSON.stringify(game.data.resource.tokens));
        setUserState((prev) => ({ ...prev, nextTurn: false }));
        // await new Promise((resolve) => {
        //   setTimeout(resolve, 900);
        // });
        // resetPlayerState();
        setA((prev) => prev + 1);
      }
    })();
  }, [userState.nextTurn]);

  // GAME LOGIC HOOKS

  if (!player.data || !game.data) return <></>;
  if (!userState.validTab)
    return (
      <>
        <p>It looks like you are playing in another instance.</p>
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
      <main className="flex min-h-screen justify-between border-2 border-green-400 text-xl">
        <div className="flex w-1/5 flex-col justify-between border-2">
          <div className="flex flex-col">
            <div>{userState.countdown}</div>
            <div>{game.data.turnIdx}</div>
          </div>
          <TokenContainer
            game={game.data}
            userState={userState}
            setUserState={setUserState}
            playerState={playerState}
            setPlayerState={setPlayerState}
          />
        </div>
        <div className="grid place-content-center border-2 border-red-500">
          <div className="w-fit border-2">
            {/* <CardContainer
              game={game.data}
              clientState={clientState}
              setClientState={setClientState}
              serverState={serverState}
              setServerState={setServerState}
              isTurnLoading={isTurnLoading}
              setMessage={setMessage}
            /> */}
          </div>
        </div>
        <div className="flex w-1/5 flex-col border-2">
          {!userState.nextTurn && playerTurn && (
            <div>
              <p>It's your turn</p>
              <button
                onClick={() =>
                  setUserState((prev) => ({ ...prev, nextTurn: true }))
                }
              >
                Next turn
              </button>
            </div>
          )}
          <div>{userState.message}</div>
          <div className="w-[50px]">{JSON.stringify(game.data.status)}</div>
          <div className="w-[50px]">{JSON.stringify(player.data.id)}</div>
          <div className="w-[50px]">{JSON.stringify(playerState)}</div>
          <div className="w-[50px]">{JSON.stringify(userState)}</div>
          {/* DUMMY begin */}
          <button
            className="border-2"
            onClick={() => {
              if (playerTurn)
                setPlayerState((prev) => ({ ...prev, action: "take" }));
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
                  action: "purchase",
                  cardId: 7,
                }));
            }}
          >
            Purchase
          </button>
          <button
            className="border-2"
            onClick={() => {
              if (playerTurn)
                setPlayerState((prev) => ({
                  ...prev,
                  action: "reserve",
                  cardId: 7,
                }));
            }}
          >
            Reserve
          </button>
          <>Turn count: {a}</>
          {/* DUMMY end */}
        </div>
        {/* DIALOG */}
        <Dialog
          game={game.data}
          userState={userState}
          setUserState={setUserState}
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
