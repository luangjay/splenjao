import { Game, Player } from "@prisma/client";
import { SetStateAction } from "react";
import {
  defaultPrice,
  defaultTokens,
  cardColors,
  tokenColors,
  compPrice,
  opPrice,
} from "../common/constants";
import { PlayerState } from "../common/types";
import { CardColor, InventoryKey, Action } from "../common/types";
import { api } from "../utils/api";
import Card from "./Card";
import Content from "./Content";
import Claim from "./Claim";
import TokenContainer from "./TokenContainer";
import Take from "./Take";

interface DialogProps {
  game: Game;
  player: Player;
  playerState: PlayerState;
  setPlayerState: (value: SetStateAction<PlayerState>) => void;
}

export default function ActionDialog(props: DialogProps) {
  const { game, player, playerState, setPlayerState } = props;

  const close = () => {
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
  };

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

  function SideTab() {
    return (
      <>
        <div onClick={() => changeAction("take")}>Take</div>
        <div onClick={() => changeAction("purchase")}>Purchase</div>
        <div onClick={() => changeAction("reserve")}>Reserve</div>
        <div className="h-[30px]"></div>
        <div>{playerState.message}</div>
      </>
    );
  }

  return (
    <div
      className="fixed inset-0 z-10 overflow-y-auto bg-black/[.4] backdrop-blur-sm"
      style={{
        visibility: playerState.currentAction === null ? "hidden" : "visible",
      }}
    >
      {playerState.currentAction === null ? (
        <></>
      ) : (
        <>
          <div className="fixed inset-0 h-full w-full" onClick={close}></div>
          <div className="flex min-h-screen items-center">
            <div className="relative mx-auto flex h-[660px] w-[1082px] items-center justify-center rounded-md bg-gray-100 px-16 py-8 shadow-lg">
              <div className="items-centerzz flex h-full w-full justify-center gap-12">
                <div className="w-[160px]">
                  <SideTab />
                </div>
                <div className="h-full w-[1px] border border-gray-300"></div>
                <div className="w-[500px]">
                  <Content {...props} />
                </div>
                <div className="h-full w-[1px] border border-gray-300"></div>
                <div className="w-[160px]">
                  <div className="w-full">
                    {/* <code className="text-xs">
                  {JSON.stringify(playerState, null, 2)}
                </code> */}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="absolute top-2 right-2 mx-auto flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
                onClick={close}
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
