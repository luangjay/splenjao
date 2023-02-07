import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../../../utils/api";
import CardComponent from "../../../components/Card";
import DeckComponent from "../../../components/Deck";
import TokenComponent from "../../../components/Token";
import { useRouter } from "next/router";
import Error from "next/error";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { Action, ActionType, Token } from "@prisma/client";

type TokenColor = "white" | "blue" | "green" | "red" | "black" | "gold";
interface ClientState {
  color?: TokenColor;
  take?: boolean | null;
  type?: ActionType | null;
  cardId?: number;
}

interface ServerState {
  token: Token | undefined;
  action: Action | undefined;
}

const allTokenColors = [
  "white",
  "blue",
  "green",
  "red",
  "black",
  "gold",
] as TokenColor[];

export default function Game() {
  // ROUTER HOOKS
  const router = useRouter();
  const id = router.query.id as string;

  // SESSION HOOKS
  const { data: sessionData } = useSession();

  // STATE HOOKS
  const [countdown, setCountdown] = useState(0);
  const [isValidTab, setValidTab] = useState(false);
  // const [takeToken, setTakeToken] = useState<TokenColor>();
  // const [returnToken, setReturnToken] = useState<TokenColor>();
  // const [actionType, setActionType] = useState<ActionType | null>();
  const [clientState, setClientState] = useState<ClientState>();
  const [serverState, setServerState] = useState<ServerState>();
  const [message, setMessage] = useState<string>();

  // const [action, setAction] = useState<Action>();
  // const [token, setToken] = useState<Token>();

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
  const updateServerState = api.gamex.updateServerState.useMutation({
    async onSettled() {
      utils.gamex.findAndAuthorize.invalidate();
    },
  });
  // const updateToken = api.gamex.updateToken.useMutation({
  //   async onSettled() {
  //     utils.gamex.findAndAuthorize.invalidate();
  //   },
  // });
  // const updateCurrentActionToken =
  //   api.gamex.updateCurrentActionToken.useMutation({
  //     async onSettled() {
  //       utils.gamex.findAndAuthorize.invalidate();
  //     },
  //   });
  // const updateCurrentActionType = api.gamex.updateCurrentActionType.useMutation(
  //   {
  //     async onSettled() {
  //       utils.gamex.findAndAuthorize.invalidate();
  //     },
  //   }
  // );

  const isPlayerTurn =
    sessionData?.user.id ===
    game.data?.playerIds[game.data?.currentTurn.playerIdx];

  // APP PROTOCOL HOOKS
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

  // GAME PROTOCOL HOOKS
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

  // GAME LOGIC HOOKS
  useEffect(() => {
    if (game.data) {
      setServerState({
        action: game.data.currentAction,
        token: game.data.token,
      });
    }
  }, [game.data]);

  // useEffect(() => {
  //   if (game.data && takeToken) {
  //     updateCurrentActionToken.mutate({
  //       id: game.data.id,
  //       color: takeToken,
  //       inc: 1,
  //     });
  //     updateToken.mutate({
  //       id: game.data.id,
  //       color: takeToken,
  //       inc: -1,
  //     });
  //   }
  // }, [takeToken]);

  // useEffect(() => {
  //   if (game.data && returnToken) {
  //     updateCurrentActionToken.mutate({
  //       id: game.data.id,
  //       color: returnToken,
  //       inc: -1,
  //     });
  //     updateToken.mutate({
  //       id: game.data.id,
  //       color: returnToken,
  //       inc: 1,
  //     });
  //   }
  // }, [returnToken]);

  // useEffect(() => {
  //   if (game.data && actionType) {
  //     updateCurrentActionType.mutate({
  //       id: game.data.id,
  //       type: actionType,
  //     });
  //   }
  // }, [actionType]);

  useEffect(() => {
    if (isPlayerTurn && clientState && game.data) {
      updateServerState.mutate({
        id: game.data.id,
        state: { ...clientState },
      });
    }
  }, [clientState]);

  if (game.isLoading || !sessionData?.user) return <></>;
  if (!isValidTab)
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
            <div>{Math.max(Math.ceil(countdown), 0)}</div>
            <div>{game.data.currentTurn.playerIdx}</div>
          </div>
          <div>
            {allTokenColors.map((tokenColor) => (
              <TokenComponent
                color={tokenColor}
                take={true}
                clientState={clientState}
                setClientState={setClientState}
                serverState={serverState}
                setServerState={setServerState}
                setMessage={setMessage}
                // test={updateNextTurn.mutate}
              />
            ))}
          </div>
          <div>
            {allTokenColors.map((tokenColor) => (
              <TokenComponent
                color={tokenColor}
                take={false}
                clientState={clientState}
                setClientState={setClientState}
                serverState={serverState}
                setServerState={setServerState}
                setMessage={setMessage}
                // test={updateNextTurn.mutate}
              />
            ))}
          </div>
          <button
            className="bg-cyan-400"
            onClick={() => {
              // updateToken.mutate({
              //   id: game.data.id,
              //   color: "green",
              //   inc: -1,
              // });
            }}
          >
            abcd
          </button>
        </div>
        <div className="grid place-content-center border-2 border-red-500">
          <div className="w-fit border-2">
            <DeckComponent shuffle={game.data.shuffle} />
          </div>
        </div>
        <div className="flex w-1/5 flex-col border-2">
          <div>{isPlayerTurn && "This is your turn."}</div>
          <div>
            {clientState ? (clientState.take ? "take" : "return") : "nah"}
          </div>
          <div>{clientState && clientState.type}</div>
          <div>{message}</div>
        </div>
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
