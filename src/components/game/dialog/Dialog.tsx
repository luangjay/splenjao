import { Game, Player } from "@prisma/client";
import { SetStateAction } from "react";
import {
  defaultPrice,
  defaultTokens,
  cardColors,
  tokenColors,
} from "../../../common/constants";
import { PlayerState } from "../../../common/types";
import { CardColor, InventoryKey } from "../../../common/types";
import { api } from "../../../utils/api";
import Card from "../cards/Card";
import Purchase from "./Purchase";
import Claim from "./Claim";
import TokenContainer from "../TokenContainer";
import Take from "./Take";

export interface DialogProps {
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

  if (playerState.currentAction === null) return <></>;
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto opacity-100 backdrop-blur-md">
      <div
        className="fixed inset-0 h-full w-full bg-black opacity-20"
        onClick={close}
      ></div>
      <div className="flex min-h-screen items-center">
        <div className="relative mx-auto flex h-[660px] w-[600px] items-center justify-center rounded-md bg-gray-50 px-16 py-8 shadow-lg">
          <div className="mt-2 w-full items-center justify-center gap-2 sm:flex">
            <Take {...props} />
            <Purchase {...props} />
            <Claim {...props} />
            {playerState.currentAction === "reserve" &&
              playerState.selectedCard && (
                <>
                  <Card
                    cardId={playerState.selectedCard.id}
                    cardEffect={null}
                    {...props}
                  />
                  <TokenContainer {...props} />
                </>
              )}
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
    </div>
  );
}
