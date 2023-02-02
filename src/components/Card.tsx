import { api } from "../utils/api";

export default function Card({ id }: CardProps) {
  const cardData = api.card.findById.useQuery(id).data;
  return (
    <div className="h-full w-full rounded-md border-2 border-black drop-shadow-md">
      <div className="flex h-full w-full flex-row justify-between p-1">
        <div className="flex h-full w-[30%] flex-col justify-between">
          <div
            className={
              cardData && cardData.score
                ? "flex aspect-square w-full items-center justify-center rounded-md text-xl"
                : undefined
            }
          >
            <code className="number text-sm font-extrabold">
              {cardData && cardData.score ? cardData.score : ""}
            </code>
          </div>
          <div>
            {(["white", "blue", "green", "red", "black"] as Color[]).map(
              (color) => (
                <PriceLabel color={color} price={cardData?.price[color]} />
              )
            )}
          </div>
        </div>
        <div className="flex w-[30%] flex-col justify-between">
          <ColorLabel color={cardData?.color} />
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  id: number;
}

type Color = "white" | "blue" | "green" | "red" | "black";

interface ColorProps {
  color: Color | undefined;
}

function ColorLabel({ color }: ColorProps) {
  let colorClass;
  switch (color) {
    case "white":
      colorClass = "bg-[#edf4f7]";
      break;
    case "blue":
      colorClass = "bg-[#367ec4]";
      break;
    case "green":
      colorClass = "bg-[#0faf60]";
      break;
    case "red":
      colorClass = "bg-[#d2281a]";
      break;
    case "black":
      colorClass = "bg-[#40231d]";
      break;
  }

  if (colorClass)
    return (
      <div
        className={`${colorClass} flex aspect-square w-full items-center justify-center rounded-md border-2`}
      ></div>
    );
  return <></>;
}

interface PriceProps {
  color: Color | undefined;
  price: number | undefined;
}

function PriceLabel({ color, price }: PriceProps) {
  if (price)
    return (
      <div
        className={`flex aspect-square w-full items-center justify-center rounded-full border-2 ${
          color
            ? color === "black"
              ? "bg-black"
              : color === "white"
              ? "bg-white"
              : `bg-${color}-500`
            : undefined
        }`}
      >
        <code className="number px-1 text-sm font-extrabold">
          {price ? price : -1}
        </code>
      </div>
    );
  return <></>;
}
