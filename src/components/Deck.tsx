import { Shuffle } from "@prisma/client";
import { useState } from "react";
import Card from "./Card";

interface DeckProps {
  shuffle: Shuffle;
}

export default function Deck({ shuffle }: DeckProps) {
  return (
    <div className="grid w-[750px] grid-rows-3 gap-2">
      <div className="grid grid-cols-5 gap-2">
        {shuffle.cardLv3_ids.map((id, idx) => idx < 5 && <Card id={id} />)}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {shuffle.cardLv2_ids.map((id, idx) => idx < 5 && <Card id={id} />)}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {shuffle.cardLv1_ids.map((id, idx) => idx < 5 && <Card id={id} />)}
      </div>
    </div>
  );
}
