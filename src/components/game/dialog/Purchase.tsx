import Card from "../cards/Card";
import Token from "../tokens/Token";
import { DialogProps } from "./Dialog";
import { CardColor, InventoryKey } from "../../../common/types";
import {
  opPrice,
  opColorWPrice,
  tokenColors,
  defaultPrice,
} from "../../../common/constants";
import { cardColors } from "../../../common/constants";

export default function Purchase(props: DialogProps) {
  const { game, player, playerState, setPlayerState } = props;

  const selectedColorClass =
    playerState.selectedCardColor === "white"
      ? "border-[#ffffff] shadow-[0_0_0_0.2rem_rgba(192,192,192,.25)]"
      : playerState.selectedCardColor === "blue"
      ? "border-[#80bdff] shadow-[0_0_0_0.2rem_rgba(0,128,255,.25)]"
      : playerState.selectedCardColor === "green"
      ? "border-[#40ffbd] shadow-[0_0_0_0.2rem_rgba(128,255,0,.25)]"
      : playerState.selectedCardColor === "red"
      ? "border-[#ff80bd] shadow-[0_0_0_0.2rem_rgba(255,128,0,.25)]"
      : playerState.selectedCardColor === "black"
      ? "border-[#000000] shadow-[0_0_0_0.2rem_rgba(16,16,16,.25)]"
      : "";

  const colorClass = (color: CardColor) =>
    color === "white"
      ? "border-gray-50 bg-white"
      : color === "blue"
      ? "border-blue-500 bg-gradient-to-bl from-blue-500 to-blue-300"
      : color === "green"
      ? "border-green-500 bg-gradient-to-bl from-green-500 to-green-300"
      : color === "red"
      ? "border-red-500 bg-gradient-to-bl from-red-500 to-red-300"
      : color === "black"
      ? "border-gray-800 bg-gradient-to-bl from-gray-800 to-gray-600"
      : "";

  if (!playerState.selectedCard || playerState.currentAction !== "purchase")
    return <></>;

  const requiredTokens = (
    Object.keys(playerState.selectedCard.price) as CardColor[]
  ).filter(
    (cardColor) =>
      playerState.selectedCard &&
      playerState.selectedCard.price[cardColor as CardColor] !== 0
  );

  const { gold: goldToken, ...price } = playerState.playerTokens;
  const replacedPrice = opPrice("increment", price, playerState.priceToReplace);
  const discountedPrice = opPrice(
    "decrement",
    playerState.selectedCard.price,
    game[`inventory${game.turnIdx}` as InventoryKey].discount
  );

  return (
    <div className="flex w-full flex-col gap-8 text-base text-[#111827]">
      <div className="flex flex-col gap-2">
        <div className="text-base font-semibold leading-none">Card</div>
        <div className="flex w-full gap-6">
          <Card
            cardId={playerState.selectedCard.id}
            cardEffect={null}
            {...props}
          />
          {/* CARD STATS */}
          <div className="flex flex-grow flex-col">
            {/* CARD LEVEL */}
            <div className="flex h-1/6 w-full items-center gap-2 px-2 hover:bg-gray-100">
              <div className="w-[25%]">Level</div>
              <div className="flex h-1/3 flex-grow items-center justify-between gap-[3px]">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      className={`h-full w-1/3 rounded-md border border-gray-300 drop-shadow ${
                        playerState.selectedCard &&
                        playerState.selectedCard.level > i
                          ? colorClass(
                              playerState.selectedCard.color as CardColor
                            )
                          : "bg-gray-100"
                      }`}
                    ></div>
                  ))}
              </div>
              <div className="w-3 text-center">
                {playerState.selectedCard.level}
              </div>
            </div>
            {/* CARD SCORE */}
            <div className="flex h-1/6 w-full items-center gap-2 px-2 hover:bg-gray-100">
              <div className="w-[25%]">Score</div>
              <div className="flex h-1/3 flex-grow items-center justify-between gap-[3px]">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      className={`h-full w-1/5 rounded-md border border-gray-300 drop-shadow ${
                        playerState.selectedCard &&
                        playerState.selectedCard.score > i
                          ? colorClass(
                              playerState.selectedCard.color as CardColor
                            )
                          : "bg-gray-100"
                      }`}
                    ></div>
                  ))}
              </div>
              <div className="w-3 text-center">
                {playerState.selectedCard.score}
              </div>
            </div>
            {/* CARD PRICE */}
            {cardColors.map(
              (color) =>
                playerState.selectedCard &&
                playerState.selectedCard.price[color] > 0 && (
                  <div className="flex h-1/6 w-full items-center gap-2 px-2 hover:bg-gray-100">
                    <div className="w-[25%]">
                      {`${color.slice(0, 1).toUpperCase()}${color
                        .slice(1)
                        .toLowerCase()}`}
                    </div>
                    <div className="flex h-1/3 flex-grow items-center justify-between gap-[3px]">
                      {Array(7)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            className={`h-full w-1/5 rounded-md border border-gray-300 drop-shadow ${
                              playerState.selectedCard &&
                              playerState.selectedCard?.price[color] > i
                                ? colorClass(color)
                                : "bg-gray-100"
                            }`}
                          ></div>
                        ))}
                    </div>
                    <div className="w-3 text-center">
                      {playerState.selectedCard?.price[color]}
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      </div>
      {/* PURCHASE WITH TOKENS */}
      <div className="flex flex-col gap-2">
        <div className="text-base font-semibold leading-none">
          Required tokens
        </div>
        {/* <hr className="h-[1px] w-full rounded-full bg-[#111827] drop-shadow-md"></hr> */}
        <div className="flex w-full justify-between gap-6">
          {requiredTokens.map((cardColor) => (
            <button
              className={`aspect-square w-1/4 cursor-default rounded-md border bg-white drop-shadow hover:bg-gray-100 ${
                cardColor === playerState.selectedCardColor &&
                selectedColorClass
              }`}
              onClick={() => {
                if (discountedPrice[cardColor] !== 0) {
                  setPlayerState((prev) => ({
                    ...prev,
                    selectedCardColor: cardColor,
                  }));
                }
              }}
            >
              {playerState.selectedCard && (
                <>
                  <div
                    className={`absolute ${
                      playerState.priceToReplace[cardColor] !== 0
                        ? "top-6 left-4"
                        : "top-5 left-5"
                    }`}
                  >
                    <Token
                      tokenColor={cardColor}
                      tokenEffect="return"
                      reference="player"
                      {...props}
                    />
                  </div>
                  <div
                    className={`absolute z-10 ${
                      playerState.playerTokens[cardColor] !== 0
                        ? "right-2 top-2"
                        : "top-5 left-5"
                    }`}
                  >
                    <Token
                      tokenColor="gold"
                      tokenEffect="return"
                      reference="player"
                      colorToReplace={cardColor}
                      {...props}
                    />
                  </div>
                  <div className="absolute right-0.5 bottom-0.5">
                    <span className="text-md">{replacedPrice[cardColor]}</span>
                    <span className="text-sm">
                      /
                      {
                        opPrice(
                          "decrement",
                          playerState.selectedCard.price,
                          game[`inventory${game.turnIdx}` as InventoryKey]
                            .discount
                        )[cardColor]
                      }
                    </span>
                  </div>
                </>
              )}
            </button>
          ))}
          {Array(4 - requiredTokens.length)
            .fill(0)
            .map(() => (
              <button
                className={`aspect-square w-1/4 cursor-default rounded-md border bg-white drop-shadow hover:bg-gray-100`}
              >
                {playerState.selectedCard && (
                  <>
                    <div className="absolute right-0.5 bottom-0.5">
                      <span className="text-md">0</span>
                      <span className="text-sm">/0</span>
                    </div>
                  </>
                )}
              </button>
            ))}
        </div>
      </div>
      {/* <div className="flex w-full">
        {tokenColors.map((tokenColor) => (
          <Token
            tokenColor={tokenColor}
            tokenEffect="return"
            reference="player"
            {...props}
          />
        ))}
      </div> */}
      <div className="flex flex-col gap-2">
        <div className="text-base font-semibold leading-none">Your tokens</div>
        <div className="flex w-full">
          {tokenColors.map((tokenColor) => (
            <div className="flex w-1/6 justify-center">
              <Token
                tokenColor={tokenColor}
                tokenEffect="take"
                reference="inventory"
                showCount={true}
                // effect={!props.serverState?.action.endTurn ? null : "take"}
                {...props}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-full justify-center">
        <button
          className="w-1/3 rounded-md bg-[#213951] p-2 font-semibold text-white hover:bg-[#3b6691] disabled:bg-[#213951]/[.5]"
          disabled={!playerState.success}
          onClick={() => {
            if (playerState.success)
              setPlayerState((prev) => ({
                ...prev,
                isNextTurn: true,
              }));
          }}
        >
          Purchase
        </button>
      </div>
    </div>
  );
}

function TokenBox() {}
