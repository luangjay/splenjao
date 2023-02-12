import { Card, Game, Player } from "@prisma/client";
import { SetStateAction } from "react";
import { PlayerState } from "../common/interfaces";
import { InventoryKey } from "../common/types";
import { api } from "../utils/api";
import CardComponent from "./CardComponent";
import TokenContainer from "./TokenContainer";

const tokens = {
  white: 0,
  blue: 0,
  green: 0,
  red: 0,
  black: 0,
  gold: 0,
};
interface DialogProps {
  game: Game;
  player: Player;
  playerState: PlayerState;
  setPlayerState: (value: SetStateAction<PlayerState>) => void;
}

export default function ActionDialog({
  game,
  player,
  playerState,
  setPlayerState,
}: DialogProps) {
  const close = () => {
    if (player && game) {
      setPlayerState({
        // reset: false,
        success: false,
        action: null,
        resourceTokens: game ? game.resource.tokens : { ...tokens },
        playerTokens: { ...tokens },
        inventoryTokens:
          game && game.status !== "created"
            ? game[`inventory${game.turnIdx}` as InventoryKey].tokens
            : { ...tokens },
        playerCard: null,
        extraTurn: false,
        nextTurn: false,
        message: "",
      });
    }
  };

  if (playerState.action === null) return <></>;
  return (
    <>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div
          className="fixed inset-0 h-full w-full bg-black opacity-40"
          onClick={close}
        ></div>
        <div className="flex min-h-screen items-center border-2 border-red-500 px-4 py-8">
          <div className="relative mx-auto w-full max-w-lg rounded-md border-2 border-green-500 bg-white p-4 shadow-lg">
            <div className="mt-2 mb-3 sm:flex">
              <div className="mx-auto flex h-12 w-12 flex-none items-center justify-center rounded-full bg-red-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="mt-2 text-center sm:ml-4 sm:text-left">
                <div className="flex items-center">
                  <h4 className="text-lg font-medium text-gray-800">
                    {playerState.action} ?
                  </h4>
                  <button
                    type="button"
                    className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
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
                <p className="mt-2 text-[15px] leading-relaxed text-gray-500">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <div className="mt-3 items-center gap-2 sm:flex">
                  {playerState.action === "take" && (
                    <TokenContainer
                      game={game}
                      player={player}
                      playerState={playerState}
                      setPlayerState={setPlayerState}
                    />
                  )}
                  {playerState.action === "purchase" &&
                    playerState.playerCard && (
                      <>
                        <CardComponent
                          game={game}
                          player={player}
                          cardId={playerState.playerCard.id}
                          cardEffect={null}
                          playerState={playerState}
                          setPlayerState={setPlayerState}
                        />
                        <TokenContainer
                          game={game}
                          player={player}
                          playerState={playerState}
                          setPlayerState={setPlayerState}
                        />
                      </>
                    )}
                  {playerState.action === "reserve" &&
                    playerState.playerCard && (
                      <>
                        <CardComponent
                          game={game}
                          player={player}
                          cardId={playerState.playerCard.id}
                          cardEffect={null}
                          playerState={playerState}
                          setPlayerState={setPlayerState}
                        />
                        <TokenContainer
                          game={game}
                          player={player}
                          playerState={playerState}
                          setPlayerState={setPlayerState}
                        />
                      </>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}