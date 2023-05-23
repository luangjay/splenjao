import { Game } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  ChangeEventHandler,
  FormEvent,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { api } from "../../utils/api";
import Layout from "../../components/Layout";
import { ToastBar, Toaster, toast, useToasterStore } from "react-hot-toast";
import Title from "../../components/Title";
import Image from "next/image";

export default function Play() {
  const router = useRouter();
  const [isProcessing, setProcessing] = useState(false);
  const [isSuccess, setSuccess] = useState(false);

  const { data: session } = useSession();

  const utils = api.useContext();

  // FOR COOL INPUTS
  const [digit, setDigit] = useState(0);
  const [values, setValues] = useState<string[]>(Array(6).fill(""));
  const inputCode = parseInt(values.join(""));
  const refs = values.map(() => useRef<HTMLInputElement>(null));

  const {
    data: player,
    refetch: playerRefetch,
    isFetchedAfterMount: playerFetched,
  } = api.play.findPlayer.useQuery(session?.user.id, { retry: false });
  // const lobbyByCode = api.play.findLobbyByCode.useQuery(
  //   inputCode
  //   // {
  //   //   // retry: false,
  //   //   // refetchInterval: 3600000,
  //   // }
  // );
  const findEmptyLobbyAndUpdate =
    api.play.findEmptyLobbyAndUpdate.useMutation();
  const findLobbyByCodeMutation =
    api.play.findLobbyByCodeMutation.useMutation();
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
    if (player && playerFetched) {
      if (player.games) {
        const playerLastGame = player.games[player.games.length - 1] as Game;
        if (playerLastGame && playerLastGame.status !== "ended") {
          router.replace(`/play/game/${playerLastGame.id}`);
        }
      }
      if (player.lobbyId) {
        router.replace(`/play/lobby/${player.lobbyId}`);
      }
    }
  }, [player]);

  const addPlayerToLobby = async (lobbyId: string) => {
    // await playerRefetch();
    if (player) {
      let goLobby = await updateLobby.mutateAsync({
        id: lobbyId,
        playerId: player.id,
      });
      if (goLobby) {
        await updatePlayer.mutateAsync({
          id: player.id,
          lobbyId: lobbyId,
        });
      }
    }
  };
  const newLobby = async () => {
    const toastId = toast.loading("Creating lobby");
    setProcessing(true);
    await playerRefetch();
    if (player) {
      const lobby = await findEmptyLobbyAndUpdate.mutateAsync();
      if (lobby) {
        toast.dismiss(toastId);
        toast.success("Lobby created");
        await addPlayerToLobby(lobby.id);
        toast.dismiss();
        // setProcessing(false);
      } else {
        toast.dismiss(toastId);
        toast.error("Too many requests");
        setProcessing(false);
      }
    } else {
      toast.dismiss(toastId);
      toast.error("Try again later");
      setProcessing(false);
    }
  };
  const joinLobby = async () => {
    const toastId = toast.loading("Finding lobby");
    await playerRefetch();
    setProcessing(true);
    if (player) {
      // await lobbyByCode.refetch();
      const lobby = await findLobbyByCodeMutation.mutateAsync(inputCode);
      if (lobby) {
        if (lobby.playerCount >= 4) {
          toast.dismiss(toastId);
          toast.error("Lobby full");
          setProcessing(false);
        } else {
          toast.dismiss(toastId);
          toast.success("Lobby found");
          await addPlayerToLobby(lobby.id);
          // setProcessing(false);
        }
      } else {
        toast.dismiss(toastId);
        toast.error("Lobby not found");
        setProcessing(false);
      }
    } else {
      toast.dismiss(toastId);
      toast.error("Not logged in");
      setProcessing(false);
    }
  };

  const { toasts } = useToasterStore();

  // Enforce Limit
  useEffect(() => {
    toasts
      .filter((t) => t.visible) // Only consider visible toasts
      .filter((_, i) => i >= 3) // Is toast index over limit
      .forEach((t) => toast.dismiss(t.id)); // Dismiss – Use toast.remove(t.id) removal without animation
  }, [toasts]);

  useEffect(() => {
    refs[digit]?.current?.focus();
  }, [digit, isProcessing]);

  useEffect(() => {
    if (inputCode / 100000 >= 1) {
      joinLobby();
    }
  }, [inputCode]);

  useEffect(() => {
    (async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      refs[digit]?.current?.focus();
    })();
    return () => {
      toast.remove();
    };
  }, []);

  if (!playerFetched) return <Layout />;
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
      <main className="absolute left-0 flex h-full w-full flex-col items-center justify-center text-2xl">
        <div className="max-xl:hidden">
          <Title size={3}>SPLENJAO</Title>
        </div>
        <div className="flex aspect-square h-full w-full max-w-lg flex-col items-center justify-center max-lg:gap-12 max-lg:pt-12 lg:h-[386px]">
          <div className="flex items-center justify-center lg:flex-1 xl:pb-12">
            <label
              className="flex flex-col items-center justify-center gap-6 drop-shadow"
              htmlFor={`input${digit}`}
            >
              <div>Join lobby with room code</div>
              <div className="flex gap-4 font-mono font-semibold caret-slate-600">
                {values.map((value, idx) =>
                  idx !== digit ? (
                    <div className="flex aspect-square h-[64px] items-center justify-center rounded-xl border-2 border-slate-400 bg-gray-50 text-[32px]">
                      {values[idx]}
                    </div>
                  ) : (
                    <input
                      id={`input${idx}`}
                      type="number"
                      pattern="[0-9]*"
                      ref={refs[idx]}
                      value={value}
                      disabled={isProcessing}
                      onKeyDown={(e) => {
                        if (isProcessing) return;
                        if (e.key === "e") {
                          e.preventDefault();
                        } else if (e.key === "Backspace") {
                          if (0 <= idx && idx <= 5) {
                            const tmp = [...values];
                            if (idx === 5 && tmp[5] !== "") {
                              tmp[idx] = "";
                            } else if (idx !== 0) {
                              tmp[idx - 1] = "";
                              setDigit(idx - 1);
                            }
                            setValues(tmp);
                          }
                        } else if (e.key >= "0" && e.key <= "9") {
                          if (0 <= idx && idx <= 5) {
                            const tmp = [...values];
                            if (idx !== 5) {
                              tmp[idx] = e.key;
                              setDigit(idx + 1);
                            } else if (tmp[5] === "") {
                              tmp[idx] = e.key;
                            }
                            setValues(tmp);
                          }
                        }
                      }}
                      className="aspect-square h-[64px] rounded-xl border-2 border-slate-400 bg-gray-50 text-center text-[32px] focus:border-pink-400 focus:shadow-[0_0_0_0.3rem_rgba(244,114,182,.25)] focus:outline-none"
                    />
                  )
                )}
              </div>
            </label>
          </div>
          <div className="flex flex-col gap-6 drop-shadow">
            <div className="h-[2px] bg-slate-600 max-lg:hidden"></div>
            <div className="flex items-center gap-8 px-6">
              <div>No code?</div>
              <button
                className="w-[140px] rounded-lg bg-slate-600 p-2 text-xl font-medium text-slate-100 hover:bg-slate-700"
                onClick={newLobby}
              >
                New lobby
              </button>
            </div>
          </div>
        </div>
      </main>
      {/* <main className="flex h-screen flex-col items-center justify-center">
        <div className="flex w-1/4 flex-col items-center justify-center gap-4">
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
      </main> */}
    </Layout>
  );
}
