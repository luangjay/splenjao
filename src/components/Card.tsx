import { api } from "../utils/api";

export default function Card({ id }: CardProps) {
  const cardData = api.card.findById.useQuery(id).data;
  if (!cardData) return <></>;
  return (
    <div className=" rounded-lg border-2 border-black">
      <div className="flex flex-row justify-between p-[4%]">
        <div className="flex aspect-[0.185] w-[30%] flex-col justify-between">
          <div
            className={
              cardData.score
                ? "flex aspect-square w-full items-center justify-center rounded-lg "
                : undefined
            }
          >
            <code className="number text-3xl font-black">
              {cardData.score || ""}
            </code>
          </div>
          <div>
            {(["white", "blue", "green", "red", "black"] as Color[]).map(
              (color) => (
                <PriceLabel color={color} price={cardData.price[color]} />
              )
            )}
          </div>
        </div>
        <div className="flex aspect-[0.185] w-[30%] flex-col justify-between">
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
        className={`${colorClass} flex aspect-square w-full items-center justify-center rounded-lg drop-shadow-lg`}
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
          color && price
            ? color === "black"
              ? "bg-black"
              : color === "white"
              ? "bg-white"
              : ` bg-${color}-500`
            : undefined
        }`}
      >
        <code className="number text-2xl font-black">{price || -1}</code>
      </div>
    );
  return <></>;
}

function TailwindBugFix() {
  return (
    <>
      <div className="hidden bg-red-500"></div>
      <div className="hidden bg-green-500"></div>
      <div className="hidden bg-blue-500"></div>
    </>
  );
}
