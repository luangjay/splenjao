import { CardColor } from "../../../common/types";
import { api } from "../../../utils/api";

interface TileProps {
  tileId: number;
}

export default function Tile({ tileId }: TileProps) {
  const { data: tile } = api.tile.findById.useQuery(tileId);

  if (!tile || tileId === -1)
    return <div className="mx-auto aspect-square rounded-lg"></div>;
  return (
    <div
      className="relative mx-auto aspect-square w-full rounded-lg border border-gray-300 bg-[url('/ricky.jpg')] bg-cover shadow-md drop-shadow-sm hover:bg-gray-200"
      // disabled={props.isTurnLoading}
    >
      <div className="flex h-full flex-row">
        <div className="z-10 flex h-full w-[33%] flex-col justify-between bg-white/[.5] p-[4px]">
          <ScoreLabel score={tile.score} />
          <div className="flex flex-col gap-[1.5px]">
            {(["white", "blue", "green", "red", "black"] as CardColor[]).map(
              (color) => (
                <PriceLabel color={color} price={tile.price[color]} />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ScoreProps {
  score: number;
}

function ScoreLabel({ score }: ScoreProps) {
  return (
    <div
      className={
        score
          ? "number flex aspect-square w-full items-center justify-center rounded-lg font-mono text-lg font-black leading-tight"
          : undefined
      }
    >
      {score || ""}
    </div>
  );
}

interface PriceProps {
  color: CardColor | undefined;
  price: number | undefined;
}

function PriceLabel({ color, price }: PriceProps) {
  const colorClass =
    color === "white"
      ? "bg-white"
      : color === "blue"
      ? "bg-blue-500"
      : color === "green"
      ? "bg-green-500"
      : color === "red"
      ? "bg-red-500"
      : color === "black"
      ? "bg-gray-800"
      : "";

  if (!price) return <></>;
  return (
    <div
      className={`number-sm mx-auto flex aspect-square w-[80%] items-center justify-center rounded-md font-mono text-[16px] font-black leading-none drop-shadow-md ${colorClass}`}
    >
      {price}
    </div>
  );
}
