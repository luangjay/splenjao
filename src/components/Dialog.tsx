import { useState, Fragment, SetStateAction } from "react";
import { Dialog, Tab, Transition } from "@headlessui/react";
import { Game, Player } from "@prisma/client";
import { InventoryKey, PlayerState } from "../common/types";
import Title from "./Title";
import { defaultPrice, defaultTokens } from "../common/constants";
import Content from "./Content";
import { CardIcon, ReserveIcon } from "./Me";

export interface DialogProps {
  game: Game;
  player: Player;
  playerState: PlayerState;
  setPlayerState: (value: SetStateAction<PlayerState>) => void;
}

export default function ActionDialog(props: DialogProps) {
  const { game, player, playerState, setPlayerState } = props;
  const isOpen = playerState.currentAction !== null;

  function closeDialog() {
    if (player && game) {
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
  }
  const titleTxt =
    playerState.currentAction === "purchase"
      ? "PURCHASE CARD"
      : playerState.currentAction === "reserve"
      ? "RESERVE CARD"
      : "COLLECT TOKENS";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-20 select-none max-md:hidden"
        onClose={closeDialog}
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

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center text-center">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {playerState.currentAction && (
                <Dialog.Panel className="w-[640px] transform overflow-hidden rounded-2xl bg-gray-100 text-left align-middle shadow-xl transition-all">
                  <div className="flex w-full gap-6">
                    <div className="flex flex-1 flex-col gap-4 py-6 pl-6">
                      <div className="flex aspect-square w-full items-center justify-center rounded bg-gray-50 text-slate-600 drop-shadow">
                        <CardIcon width="80%" height="80%" />
                      </div>
                      <div className="flex aspect-square w-full items-center justify-center rounded bg-gray-50 text-slate-600 drop-shadow">
                        <ReserveIcon width="80%" height="80%" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-6 py-6">
                      <Dialog.Title>
                        <Title>{titleTxt}</Title>
                      </Dialog.Title>
                      <div className="w-[400px]">
                        <Content {...props} />
                      </div>
                    </div>
                    <div className="flex-1 py-6 pr-6">
                      {/* <div className="aspect-square w-full bg-red-500"></div> */}
                    </div>
                  </div>
                </Dialog.Panel>
              )}
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
