import { Game, PlayerDiscount, Shuffle } from "@prisma/client";
import { SetStateAction, useState } from "react";
import { ClientState, ServerState } from "../common/interfaces";
import CardComponent from "./CardComponent";

interface CardContainerProps {
  game: Game;
  clientState: ClientState | undefined;
  setClientState: (value: SetStateAction<ClientState | undefined>) => void;
  serverState: ServerState | undefined;
  setServerState: (value: SetStateAction<ServerState | undefined>) => void;
  setMessage: (value: SetStateAction<string | undefined>) => void;
  isTurnLoading: boolean;
}

export default function CardContainer(props: CardContainerProps) {
  return (
    <div className="relative grid w-[660px] grid-rows-3 gap-3">
      <div className="grid grid-cols-5 gap-3">
        {props.game.shuffle.card3_ids.map(
          (id, idx) => idx < 5 && <CardComponent id={id} {...props} />
        )}
      </div>
      <div className="grid grid-cols-5 gap-3">
        {props.game.shuffle.card2_ids.map(
          (id, idx) => idx < 5 && <CardComponent id={id} {...props} />
        )}
      </div>
      <div className="-z-10 grid grid-cols-5 gap-3 backdrop-blur-xl">
        {props.game.shuffle.card1_ids.map(
          (id, idx) => idx < 5 && <CardComponent id={id} {...props} />
        )}
      </div>
      <div className="absolute left-0 top-0 hidden h-full w-full bg-black opacity-80">
        <button>abcd</button>
      </div>
    </div>
  );
}
