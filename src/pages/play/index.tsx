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
  useRef,
  useState,
} from "react";
import { api } from "../../utils/api";
import Layout from "../../components/Layout";
import { ToastBar, Toaster, toast } from "react-hot-toast";
import Title from "../../components/Title";
import Image from "next/image";

export default function Play() {
  const router = useRouter();
  const [inputCode, setInputCode] = useState("");
  const [isProcessing, setProcessing] = useState(false);

  const { data: session } = useSession();

  const utils = api.useContext();

  const {
    data: player,
    refetch: playerRefetch,
    isFetchedAfterMount: playerFetched,
  } = api.play.findPlayer.useQuery(session?.user.id, { retry: false });
  const lobbyByCode = api.play.findLobbyByCode.useQuery(parseInt(inputCode), {
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
    return () => toast.remove();
  }, []);

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
    await playerRefetch();
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
        setProcessing(false);
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
    setProcessing(true);
    await playerRefetch();
    if (player) {
      await lobbyByCode.refetch();
      if (lobbyByCode.data) {
        toast.dismiss(toastId);
        toast.success("Lobby found");
        await addPlayerToLobby(lobbyByCode.data.id);
        toast.dismiss();
        setProcessing(false);
      } else {
        toast.dismiss(toastId);
        toast.error("Lobby not found");
        setProcessing(false);
      }
    } else {
      toast.dismiss(toastId);
      toast.error("Try again later");
      setProcessing(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (inputCode.length === 6) {
        await lobbyByCode.refetch();
        await joinLobby();
      }
    })();
  }, [inputCode]);

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
      <main className="absolute left-0 flex h-full w-full flex-col items-center justify-center">
        <div className="max-xl:hidden">
          <Title size={3}>SPLENJAO</Title>
        </div>
        <div className="mt-6 flex aspect-square h-[338px] w-full flex-col items-center justify-center gap-8 border border-red-500 text-2xl">
          <div className="flex flex-col items-center gap-4">
            <div>Join a lobby</div>
            <InputGroup setInputCode={setInputCode} />
            {inputCode}
          </div>
          <div className="flex flex-col items-center gap-4">
            <div>No code?</div>
            <button
              className="w-[140px] rounded-xl bg-slate-600 p-3 text-xl text-slate-100 hover:bg-slate-700"
              onClick={newLobby}
            >
              New lobby
            </button>
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

interface InputGroupProps {
  setInputCode: (value: SetStateAction<string>) => void;
}

const InputGroup = ({ setInputCode }: InputGroupProps) => {
  const [digit, setDigit] = useState(0);
  const [values, setValues] = useState<string[]>(Array(6).fill(""));
  const refs = values.map(() => useRef<HTMLInputElement>(null));

  useEffect(() => {
    refs[digit]?.current?.focus();
    const joinedValues = values.join("");
    setInputCode(joinedValues);
  }, [digit]);

  return (
    <>
      <div className="flex gap-4">
        {values.map((value, idx) => (
          <input
            type="number"
            pattern="[0-9]*"
            ref={refs[idx]}
            value={value}
            disabled={value !== "" && idx !== 5}
            onKeyDown={(e) => {
              if (e.key === "e") {
                e.preventDefault();
              } else if (e.key === "Backspace") {
                if (0 <= idx && idx <= 5) {
                  const tmp = [...values];
                  if (idx === 5 && tmp[5] !== "") {
                    tmp[idx] = "";
                  } else {
                    tmp[idx - 1] = "";
                    setDigit(idx - 1);
                  }
                  setValues(tmp);
                }
              } else if (e.key >= "0" && e.key <= "9") {
                if (0 <= idx && idx <= 5) {
                  const tmp = [...values];
                  if (idx !== 5 || tmp[5] === "") {
                    tmp[idx] = e.key;
                    setDigit(idx + 1);
                  }
                  setValues(tmp);
                }
              }
            }}
            className="aspect-square h-[64px] rounded-xl border-2 border-slate-400 bg-gray-50 text-center text-[32px] focus:border-pink-400 focus:shadow-[0_0_0_0.3rem_rgba(244,114,182,.25)] focus:outline-none"
          />
        ))}
      </div>
    </>
  );
};
