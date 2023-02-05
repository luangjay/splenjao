import { Shuffle } from "@prisma/client";
import { useState } from "react";
import Card from "./Card";

const x = Array(10);
for (let i = 0; i < 10; i++) x[i] = (Math.random() * 90) | 0;

interface GameProps {
  shuffle: Shuffle;
}

export default function Deck({ shuffle }: GameProps) {
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
