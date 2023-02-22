import { Game, Player } from "@prisma/client";
import { SetStateAction, useState } from "react";
import { PlayerState } from "../../../common/types";
import { CardEffect } from "../../../common/types";
import CardComponent from "../cards/Card";

interface CardContainerProps {
  game: Game;
  player: Player;
  cardEffect: CardEffect | null;
  playerState: PlayerState;
  setPlayerState: (value: SetStateAction<PlayerState>) => void;
}

export default function CardContainer(props: CardContainerProps) {
  const { game, player, cardEffect, playerState, setPlayerState } = props;

  return (
    <div className="grid min-w-max grid-rows-3 gap-2">
      <div className="grid grid-cols-5 gap-2">
        {game.resource.cardsLv3.map(
          (cardId, idx) =>
            idx < 4 && <CardComponent cardId={cardId} {...props} />
        )}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {game.resource.cardsLv2.map(
          (cardId, idx) =>
            idx < 4 && <CardComponent cardId={cardId} {...props} />
        )}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {game.resource.cardsLv1.map(
          (cardId, idx) =>
            idx < 4 && <CardComponent cardId={cardId} {...props} />
        )}
      </div>
    </div>
  );
}
