import { Game } from "@prisma/client";
import { SetStateAction } from "react";
import { ClientState, ServerState } from "../common/interfaces";
import { Effect, Owner, TokenColor } from "../common/types";
import TokenComponent from "./TokenComponent";

const tokenColors = [
  "white",
  "blue",
  "green",
  "red",
  "black",
  "gold",
] as TokenColor[];

interface TokenContainerProps {
  game: Game;
  clientState: ClientState | undefined;
  setClientState: (value: SetStateAction<ClientState | undefined>) => void;
  serverState: ServerState | undefined;
  setServerState: (value: SetStateAction<ServerState | undefined>) => void;
  setMessage: (value: SetStateAction<string | undefined>) => void;
  isTurnLoading: boolean;
}

export default function TokenContainer(props: TokenContainerProps) {
  if (!props.serverState || !props.serverState.action) return <></>;
  return (
    <>
      <div>
        {tokenColors.map((tokenColor) => (
          <TokenComponent
            owner="game"
            effect={!props.serverState?.action.endTurn ? "take" : null}
            tokenColor={tokenColor}
            {...props}
          />
        ))}
      </div>
      <div>
        {tokenColors.map((tokenColor) => (
          <TokenComponent
            owner="action"
            effect="return"
            tokenColor={tokenColor}
            {...props}
          />
        ))}
      </div>
      <div>
        {tokenColors.map((tokenColor) => (
          <TokenComponent
            owner="player"
            effect={!props.serverState?.action.endTurn ? null : "take"}
            tokenColor={tokenColor}
            {...props}
          />
        ))}
      </div>
      <button className="bg-cyan-400" onClick={() => {}}>
        abcd
      </button>
    </>
  );
}
