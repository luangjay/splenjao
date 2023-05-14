import { useState, Fragment, SetStateAction } from "react";
import { Dialog, Tab, Transition } from "@headlessui/react";
import { Game, Player } from "@prisma/client";
import { Action, InventoryKey, PlayerState } from "../common/types";
import Title from "./Title";
import {
  compPrice,
  defaultPrice,
  defaultTokens,
  opPrice,
} from "../common/constants";
import Content from "./Content";
import { CardIcon, ReserveIcon, TokenIcon } from "./Me";

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
      ? "PURCHASE"
      : playerState.currentAction === "reserve"
      ? "RESERVE"
      : "COLLECT";

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
                <Dialog.Panel className="flex transform overflow-hidden text-left align-middle drop-shadow-xl transition-all">
                  <div className="flex flex-col items-end py-[72px]">
                    <ActionTab {...props} />
                  </div>
                  <div className="flex flex-col gap-2 rounded-2xl border-4 border-slate-700 bg-gray-100 p-6">
                    <Dialog.Title>
                      <Title size={1}>{titleTxt}</Title>
                    </Dialog.Title>
                    <div className="h-[530px] w-[400px]">
                      <Content {...props} />
                    </div>
                  </div>
                  <div className="w-[100px]"></div>
                </Dialog.Panel>
              )}
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function ActionTab(props: DialogProps) {
  const { game, player, playerState, setPlayerState } = props;

  const cardReserved = playerState.selectedCard
    ? game[`inventory${game.turnIdx}` as InventoryKey].reserves.includes(
        playerState.selectedCard.id
      )
    : false;

  const maxReserved =
    game[`inventory${game.turnIdx}` as InventoryKey].reserves.length >= 3 ||
    game[`inventory${game.turnIdx}` as InventoryKey].tokens.gold >= 3;

  const noTokens = game.resource.tokens.gold <= 0;

  const changeAction = (action: Action) => {
    if (action !== playerState.currentAction && player && game) {
      setPlayerState((prev) => ({
        ...prev,
        success:
          action === "reserve"
            ? game[`inventory${game.turnIdx}` as InventoryKey].reserves.length <
              3
            : playerState.selectedCard && action === "purchase"
            ? compPrice(
                playerState.playerTokens,
                opPrice(
                  "decrement",
                  playerState.selectedCard.price,
                  game[`inventory${game.turnIdx}` as InventoryKey].discount
                )
              )
            : false,
        currentAction: action,
        resourceTokens: game ? game.resource.tokens : { ...defaultTokens },
        inventoryTokens:
          game && game.status !== "created"
            ? game[`inventory${game.turnIdx}` as InventoryKey].tokens
            : { ...defaultTokens },
        playerTokens: { ...defaultTokens },
        priceToReplace: { ...defaultPrice },
        // selectedCard: null,
        selectedCardColor: null,
        hasExtraTurn: false,
        isNextTurn: false,
        message: "",
      }));
    }
  };

  const tabs =
    playerState.currentAction === "take"
      ? [{ Child: TokenIcon, selected: true, onClick: () => {} }]
      : cardReserved
      ? [
          {
            Child: CardIcon,
            selected: playerState.currentAction === "purchase",
            onClick: () => changeAction("purchase"),
          },
        ]
      : [
          {
            Child: CardIcon,
            selected: playerState.currentAction === "purchase",
            onClick: () => changeAction("purchase"),
          },
          {
            Child: ReserveIcon,
            selected: playerState.currentAction === "reserve",
            onClick: () => changeAction("reserve"),
          },
        ];

  if (playerState.currentAction === null) return <></>;
  return (
    <>
      {tabs.map((tab, idx) => (
        <div
          className={`flex flex-col items-center justify-center ${
            tab.selected ? "w-[80px]" : "w-[60px]"
          }`}
        >
          {/* {idx !== 0 && <div className="h-4 w-2 bg-slate-400"></div>} */}
          <div className="flex items-center">
            {tab.selected ? (
              <button
                className="flex aspect-square w-[80px] items-center justify-center rounded-[16px_0_0_16px] bg-slate-700 text-gray-200 drop-shadow"
                disabled={tab.selected}
                onClick={tab.onClick}
              >
                <tab.Child width="70%" height="70%" />
              </button>
            ) : (
              <button
                className="flex aspect-square w-[60px] items-center justify-center rounded-[16px_0_0_16px] bg-slate-500 pt-1 pl-1 text-gray-200 drop-shadow hover:bg-slate-400"
                disabled={tab.selected}
                onClick={tab.onClick}
              >
                <tab.Child width="70%" height="70%" />
              </button>
            )}
            {/* <div className="h-2 w-4 bg-slate-400"></div> */}
          </div>
        </div>
      ))}
    </>
  );
}
