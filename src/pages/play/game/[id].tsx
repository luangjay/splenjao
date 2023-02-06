import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../../../utils/api";
import Card from "../../../components/Card";
import Deck from "../../../components/Deck";
import { useRouter } from "next/router";
import Error from "next/error";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { Action } from "@prisma/client";

export default function Game() {
  // ROUTER HOOKS
  const router = useRouter();
  const id = router.query.id as string;

  // SESSION HOOKS
  const { data: sessionData } = useSession();

  // STATE HOOKS
  const [frame, setFrame] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isValidTab, setValidTab] = useState(false);
  const [message, setMessage] = useState("");
  const [action, setAction] = useState<Action>({
    type: null,
    token: { white: 0, blue: 0, green: 0, red: 0, black: 0, gold: 0 },
    cardId: null,
  });

  // CONTEXT HOOKS
  const utils = api.useContext();

  // REACT QUERY HOOKS
  const game = api.gamex.findAndAuthorize.useQuery(
    {
      id,
      playerId: sessionData?.user.id,
    },
    {
      retry: false,
      refetchInterval: 1000,
    }
  );
  const updateNextTurn = api.gamex.updateNextTurn.useMutation({
    async onSettled() {
      utils.gamex.findAndAuthorize.invalidate();
    },
  });
  const player = api.gamex.findPlayerById.useQuery(sessionData?.user.id, {
    refetchInterval: 10000,
  });
  const updatePlayerLastPlayed = api.gamex.updatePlayerLastPlayed.useMutation({
    async onSettled() {
      utils.gamex.findPlayerById.invalidate();
    },
  });

  //
  useEffect(() => {
    if (
      player.data &&
      sessionData &&
      (!player.data.lastPlayed ||
        new Date() >= addSeconds(player.data.lastPlayed, 10))
    ) {
      setValidTab(true);
      updatePlayerLastPlayed.mutate(sessionData.user.id);
    }
  }, [player.data]);

  useInterval(() => {
    if (sessionData && game.data && isValidTab) {
      updatePlayerLastPlayed.mutate(sessionData.user.id);
    }
  }, 5000);

  // LOGIC HOOKS
  useEffect(() => {
    if (game.data && isValidTab) {
      const startTime = game.data.nextTurn.startTime;
      if (startTime) setCountdown((startTime.getTime() - Date.now()) / 1000);
    }
  }, [game.data]);

  useEffect(() => {
    if (
      countdown < 0 &&
      !updateNextTurn.isLoading &&
      sessionData?.user.id === game.data?.hostId &&
      isValidTab
    ) {
      setCountdown(0);
      const updateData = {
        id: game.data?.id,
        playerId: sessionData?.user.id,
      };
      updateNextTurn.mutate(updateData);
    }
  }, [game.data]);

  if (game.isLoading || !sessionData?.user) return <></>;
  if (!isValidTab)
    return (
      <>
        <p>It looks like you are playing in another instance.</p>
        <p>If not, please wait a moment...</p>
      </>
    );
  if (game.isError) return <Error statusCode={404} />;
  const isTurn =
    sessionData.user.id ===
    game.data.playerIds[game.data.currentTurn.playerIdx];
  return (
    <>
      <Head>
        <title>Splenjao</title>
        <meta name="description" content="Splenjao" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen justify-between border-2 border-green-400 text-4xl">
        <div className="flex w-1/5 flex-col border-2">
          <div className="flex flex-col">
            <div>{Math.max(Math.ceil(countdown), 0)}</div>
            <div>{game.data.currentTurn.playerIdx}</div>
          </div>
        </div>
        <div className="grid place-content-center border-2 border-red-500">
          <div className="w-fit border-2">
            <Deck shuffle={game.data.shuffle} />
          </div>
        </div>
        <div className="w-1/5 border-2">{isTurn && "This is your turn."}</div>
      </main>
    </>
  );
}

const addSeconds = (date: Date, seconds: number) => {
  date.setSeconds(date.getSeconds() + seconds);
  return date;
};

function TailwindBugFix() {
  return (
    <>
      <div className="hidden bg-red-500"></div>
      <div className="hidden bg-green-500"></div>
      <div className="hidden bg-blue-500"></div>
    </>
  );
}

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
