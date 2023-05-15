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
  const playerTurn = player.id === game.playerIds[game.turnIdx];
  const isOpen = playerTurn && playerState.currentAction !== null;

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
        leave: false,
      });
    }
  }
  const titleTxt = playerState.hasExtraTurn
    ? "RETURN"
    : playerState.currentAction === "purchase"
    ? "PURCHASE"
    : playerState.currentAction === "reserve"
    ? "RESERVE"
    : "COLLECT";

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
              <div className="absolute left-[-80px] top-[32px] z-[9999] flex flex-col items-end">
                <ActionTab {...props} />
              </div>
              {playerState.currentAction && (
                <Dialog.Panel className="relative flex transform overflow-hidden text-left align-middle drop-shadow-xl transition-all">
                  <div className="flex flex-col rounded-2xl border-4 border-slate-700 bg-gray-100 p-6">
                    <Dialog.Title>
                      <Title size={1}>{titleTxt}</Title>
                    </Dialog.Title>
                    <div className="mt-2 h-[530px] w-[400px]">
                      <Content {...props} />
                    </div>
                  </div>
                  {/* <div className="flex w-[80px] flex-col items-end py-8"></div> */}
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
          onClick={(e) => e.stopPropagation()}
        >
          {/* {idx !== 0 && <div className="h-4 w-2 bg-slate-400"></div>} */}
          <div className="flex items-center">
            <button
              className={`flex aspect-square items-center justify-center rounded-[16px_0_0_16px] text-gray-200 drop-shadow ${
                tab.selected
                  ? "bg-slate-700"
                  : "bg-slate-500 pt-1 pl-1 hover:bg-slate-400"
              }`}
              style={{ width: tab.selected ? "80px" : "60px" }}
              disabled={tab.selected}
              onClick={tab.onClick}
            >
              <tab.Child width="70%" height="70%" />
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
