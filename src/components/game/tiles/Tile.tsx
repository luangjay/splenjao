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
      className="relative mx-auto aspect-[0.95] w-full rounded-lg border border-gray-300 bg-gray-100 shadow-md drop-shadow-sm"
      // disabled={props.isTurnLoading}
    >
      <div className="flex h-full flex-row justify-between p-[4%]">
        <div className="flex h-full w-[30%] flex-col justify-between">
          <ScoreLabel score={tile.score} />
          <div className="">
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
          ? "number flex aspect-square w-full items-center justify-center rounded-lg font-mono text-xl font-black leading-tight"
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
      className={`number mx-auto flex aspect-square w-5/6 items-center justify-center rounded-md border-2 border-gray-100  font-mono text-lg font-black leading-none ${colorClass}`}
    >
      {price}
    </div>
  );
}
