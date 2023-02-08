import { Shuffle } from "@prisma/client";
import { SetStateAction, useState } from "react";
import { ClientState, ServerState } from "../common/interfaces";
import Card from "./Card";

interface DeckProps {
  shuffle: Shuffle;
  playerIdx: number;
  clientState: ClientState | undefined;
  setClientState: (value: SetStateAction<ClientState | undefined>) => void;
  serverState: ServerState | undefined;
  setServerState: (value: SetStateAction<ServerState | undefined>) => void;
  setMessage: (value: SetStateAction<string | undefined>) => void;
  isTurnLoading: boolean;
}

export default function Deck({
  shuffle,
  playerIdx,
  clientState,
  setClientState,
  serverState,
  setServerState,
  isTurnLoading,
  setMessage,
}: DeckProps) {
  return (
    <div className="grid w-[660px] grid-rows-3 gap-3">
      <div className="grid grid-cols-5 gap-3">
        {shuffle.card3_ids.map(
          (id, idx) =>
            idx < 5 && (
              <Card
                id={id}
                playerIdx={playerIdx}
                clientState={clientState}
                setClientState={setClientState}
                serverState={serverState}
                setServerState={setServerState}
                isTurnLoading={isTurnLoading}
                setMessage={setMessage}
              />
            )
        )}
      </div>
      <div className="grid grid-cols-5 gap-3">
        {shuffle.card2_ids.map(
          (id, idx) =>
            idx < 5 && (
              <Card
                id={id}
                playerIdx={playerIdx}
                clientState={clientState}
                setClientState={setClientState}
                serverState={serverState}
                setServerState={setServerState}
                isTurnLoading={isTurnLoading}
                setMessage={setMessage}
              />
            )
        )}
      </div>
      <div className="grid grid-cols-5 gap-3">
        {shuffle.card1_ids.map(
          (id, idx) =>
            idx < 5 && (
              <Card
                id={id}
                playerIdx={playerIdx}
                clientState={clientState}
                setClientState={setClientState}
                serverState={serverState}
                setServerState={setServerState}
                isTurnLoading={isTurnLoading}
                setMessage={setMessage}
              />
            )
        )}
      </div>
    </div>
  );
}
