import { useState } from "react";
import Card from "./Card";

const x = Array(10);
for (let i = 0; i < 10; i++) x[i] = (Math.random() * 90) | 0;

export default function Deck() {
  return (
    <div className="grid w-[750px] grid-rows-3 gap-2">
      <div className="grid grid-cols-5 gap-2">
        <Card id={7} />
        <Card id={17} />
        <Card id={27} />
        <Card id={37} />
        <Card id={47} />
      </div>
      <div className="grid grid-cols-5 gap-2">
        <Card id={x[0]} />
        <Card id={x[1]} />
        <Card id={x[2]} />
        <Card id={x[3]} />
        <Card id={x[4]} />
      </div>
      <div className="grid grid-cols-5 gap-2">
        <Card id={x[5]} />
        <Card id={x[6]} />
        <Card id={x[7]} />
        <Card id={x[8]} />
        <Card id={x[4]} />
      </div>
    </div>
  );
}
