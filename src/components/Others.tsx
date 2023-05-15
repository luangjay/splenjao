import { Game, Player } from "@prisma/client";
import { InventoryKey, TokenColor } from "../common/types";
import { PlayerProps } from "./Me";
import { api } from "../utils/api";
import Image from "next/image";
import { tokenColors } from "../common/constants";
import Token from "./Token";
import {
  ButtonHTMLAttributes,
  Fragment,
  SetStateAction,
  useState,
} from "react";
import {
  CardIcon,
  ReserveIcon,
  ScoreIcon,
  TileIcon,
  TokenIcon,
  colorClass,
} from "./Me";
import Title from "./Title";
import { Dialog, Transition } from "@headlessui/react";

interface PlayerWithIdx extends Player {
  idx: number;
}

export default function Others(props: PlayerProps) {
  const [open, setOpen] = useState(false);

  const { game, player: me } = props;
  const findOthersById = game.playerIds.map((playerId) =>
    api.game.findPlayerById.useQuery(playerId)
  );
  const others = findOthersById
    .map((player, idx) => ({
      ...player.data,
      isLoading: player.isLoading,
      idx,
    }))
    .filter((player) => player.id !== me.id) as PlayerWithIdx[];

  const openDialog = () => setOpen(true);

  return (
    <>
      <div className="flex h-full w-full flex-col gap-6 overflow-auto p-6 text-base">
        <OthersProfile {...props} others={others} />
        <div className="flex flex-col items-center gap-6">
          <Title>OPTIONS</Title>
          <Button onClick={openDialog}>Leave game</Button>
        </div>
      </div>
      <LeaveDialog game={game} player={me} open={open} setOpen={setOpen} />
    </>
  );
}

interface OthersProps extends PlayerProps {
  others: PlayerWithIdx[];
}

const OthersProfile = (props: OthersProps) => (
  <div className="flex w-full flex-col justify-between gap-6">
    {props.others.map((player) => {
      const idx = player.idx;
      const inventory = props.game[`inventory${idx}` as InventoryKey];
      const reserveCount = inventory.reserves.length;
      const cardCount = inventory.cards.length;
      const tileCount = inventory.tiles.length;
      const score = inventory.score;
      const isTurn = idx === props.game.turnIdx;

      // if (player.isLoading) {
      //   return <div className="w-full"></div>;
      // }
      return (
        <div
          className={`relative rounded-2xl bg-gray-100 ${
            !isTurn && "drop-shadow"
          }`}
        >
          {isTurn && (
            <div className="bg-animation absolute inset-0 rounded-2xl"></div>
          )}
          <div
            className={`m-1.5 h-fit rounded-xl bg-gray-100 text-base drop-shadow-none  ${
              isTurn && "border border-slate-600"
            }`}
          >
            <div className="flex flex-col">
              <div className="flex h-[90px] w-full items-center gap-3 p-4 pb-3 text-start">
                <div className="aspect-square h-[84%]">
                  <Image
                    alt=""
                    src={player.image || ""}
                    width={256}
                    height={256}
                    className="aspect-square h-full rounded-full object-cover drop-shadow"
                  />
                </div>
                <div className="flex h-full flex-1 flex-col justify-between">
                  <div className="flex h-[24px] items-center justify-between">
                    <div className="w-[99px] truncate text-base font-medium">
                      {player.name}
                    </div>
                    <div className="relative flex h-[24px] items-center gap-1.5">
                      {score >= 15 && (
                        <span className="absolute -top-0.5 -right-1.5 z-20 flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-500"></span>
                        </span>
                      )}
                      <ScoreIcon />
                      {score}
                    </div>
                  </div>
                  <div className="flex h-[24px] justify-between">
                    <div className="flex h-[24px] items-center gap-1.5">
                      <CardIcon />
                      {cardCount}
                    </div>
                    <div className="-mx-0.5 flex h-[24px] items-center gap-1">
                      <ReserveIcon />
                      {reserveCount}
                    </div>
                    <div className="flex h-[24px] items-center gap-1.5">
                      <TileIcon />
                      {tileCount}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mx-4 border"></div>
              <div className="h-fit p-3 px-4">
                <div className="flex justify-between gap-1 text-sm">
                  {tokenColors.map((tokenColor) => (
                    <div className="flex w-1/6 items-center gap-[1px]">
                      {inventory.tokens[tokenColor] > 0 && (
                        <>
                          <TokenIcon className={colorClass(tokenColor)} />
                          {inventory.tokens[tokenColor]}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

function LeaveDialog({
  game,
  player,
  open,
  setOpen,
}: {
  game: Game;
  player: Player;
  open: boolean;
  setOpen: (value: SetStateAction<boolean>) => void;
}) {
  const utils = api.useContext();
  const leaveGame = api.game.updateLeave.useMutation({
    async onSettled() {
      utils.game.findAndAuthorize.invalidate();
    },
  });

  function closeDialog() {
    setOpen(false);
  }

  async function confirmLeave() {
    await leaveGame.mutateAsync({ id: game.id, playerId: player.id });
    closeDialog();
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-20 select-none text-slate-600 max-md:hidden"
        onClose={() => {}}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto" onClick={closeDialog}>
          <div className="flex min-h-full items-center justify-center text-center">
            <Transition.Child
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative flex transform overflow-hidden text-left align-middle drop-shadow-xl transition-all">
                <div className="flex flex-col rounded-2xl border-4 border-slate-700 bg-gray-100 p-6">
                  <Dialog.Title>
                    <Title size={1}>LEAVE GAME?</Title>
                  </Dialog.Title>
                  <div className="flex h-[120px] w-[400px] flex-col items-center justify-center text-lg">
                    <div>Are you sure you want to leave the game?</div>
                    <div>The game will end for all players.</div>
                    {/* <Content {...props} /> */}
                  </div>
                  <div className="flex justify-evenly">
                    <Button inverse onClick={closeDialog}>
                      Cancel
                    </Button>
                    <Button onClick={confirmLeave}>Confirm</Button>
                  </div>
                </div>
                {/* <div className="flex w-[80px] flex-col items-end py-8"></div> */}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  inverse?: boolean;
}

function Button({ inverse, children, className, ...props }: ButtonProps) {
  return (
    <button
      className={`w-[120px] rounded-md p-2 text-base font-semibold drop-shadow-sm disabled:bg-slate-400 ${
        inverse
          ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
          : "bg-slate-600 text-slate-100 hover:bg-slate-700"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
