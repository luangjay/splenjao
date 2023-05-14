import Card from "./Card";
import Token from "./Token";
import { DialogProps } from "./Dialog";
import { CardColor, InventoryKey, TokenColor } from "../common/types";
import {
  opPrice,
  opColorWPrice,
  tokenColors,
  defaultPrice,
  opTokenCount,
  defaultTokens,
  opTokenCountWColor,
} from "../common/constants";
import { cardColors } from "../common/constants";
import { ButtonHTMLAttributes } from "react";
import Title from "./Title";

export default function Content(props: DialogProps) {
  const { game, player, playerState, setPlayerState } = props;

  const cardReserved = playerState.selectedCard
    ? game[`inventory${game.turnIdx}` as InventoryKey].reserves.includes(
        playerState.selectedCard.id
      )
    : false;

  const maxReserved =
    game[`inventory${game.turnIdx}` as InventoryKey].reserves.length >= 3 ||
    game[`inventory${game.turnIdx}` as InventoryKey].tokens.gold >= 3;

  const noTokens = game.resource.tokens.gold <= 0;

  const selectedColorClass =
    playerState.selectedCardColor === "white"
      ? "border-slate-300 border shadow-[0_0_0_0.2rem_rgba(255,255,255,.9)]"
      : playerState.selectedCardColor === "blue"
      ? "border-[#80bdff] shadow-[0_0_0_0.2rem_rgba(0,128,255,.25)]"
      : playerState.selectedCardColor === "green"
      ? "border-[#60eebd] shadow-[0_0_0_0.2rem_rgba(128,255,0,.25)]"
      : playerState.selectedCardColor === "red"
      ? "border-[#ff80bd] shadow-[0_0_0_0.2rem_rgba(255,128,0,.25)]"
      : playerState.selectedCardColor === "black"
      ? "border-[#000000] shadow-[0_0_0_0.2rem_rgba(16,16,16,.25)]"
      : "";

  const colorClass = (color: CardColor) =>
    color === "white"
      ? "border-white bg-gradient-to-bl from-white to-white/[.7] shadow-white"
      : color === "blue"
      ? "border-blue-500 bg-gradient-to-bl from-blue-500 to-blue-500/[.7] shadow-blue-500"
      : color === "green"
      ? "border-green-500 bg-gradient-to-bl from-green-500 to-green-500/[.7] shadow-green-500"
      : color === "red"
      ? "border-red-500 bg-gradient-to-bl from-red-500 to-red-500/[.7] shadow-red-500"
      : color === "black"
      ? "border-gray-800 bg-gradient-to-bl from-gray-800 to-gray-700/[.7] shadow-gray-800"
      : "";

  // if (!playerState.selectedCard || action !== "purchase") return <></>;

  const requiredTokens =
    playerState.selectedCard &&
    (Object.keys(playerState.selectedCard.price) as CardColor[]).filter(
      (cardColor) =>
        playerState.selectedCard &&
        playerState.selectedCard.price[cardColor as CardColor] !== 0
    );

  const { gold: goldToken, ...price } = playerState.playerTokens;
  const replacedPrice =
    playerState.selectedCard &&
    opPrice("increment", price, playerState.priceToReplace);
  const discountedPrice =
    playerState.selectedCard &&
    opPrice(
      "decrement",
      playerState.selectedCard.price,
      game[`inventory${game.turnIdx}` as InventoryKey].discount
    );

  const NoCardShowcase = () => (
    <div className="flex flex-col gap-2">
      <div className="h-[215px]">
        <div className="font-semibold">Card</div>
        <div>Test</div>
      </div>
    </div>
  );

  const CardShowcase = () =>
    playerState.selectedCard && (
      <div className="flex flex-col gap-2">
        {/* <div className="font-semibold">Card</div> */}
        <div className="flex w-full justify-center gap-6">
          <Card
            cardId={playerState.selectedCard.id}
            cardEffect={null}
            big
            {...props}
          />
          {/* CARD STATS */}
          {/* <div className="flex flex-grow flex-col"> */}
          {/* CARD LEVEL */}
          {/* <div className="flex h-1/6 w-full items-center gap-2 px-2">
              <div className="w-[25%]">Level</div>
              <div className="flex h-[30%] flex-grow items-center justify-between gap-[3px]">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      className={`h-full w-1/3 rounded-lg drop-shadow ${
                        playerState.selectedCard &&
                        playerState.selectedCard.level > i
                          ? colorClass(
                              playerState.selectedCard.color as CardColor
                            )
                          : "border"
                      }`}
                    ></div>
                  ))}
              </div>
              <div className="w-5 text-end">
                {playerState.selectedCard.level}
              </div>
            </div> */}
          {/* CARD SCORE */}
          {/* <div className="flex h-1/6 w-full items-center gap-2 px-2">
              <div className="w-[25%]">Score</div>
              <div className="flex h-[30%] flex-grow items-center justify-between gap-[3px]">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      className={`h-full w-1/5 rounded-md drop-shadow ${
                        playerState.selectedCard &&
                        playerState.selectedCard.score > i
                          ? colorClass(
                              playerState.selectedCard.color as CardColor
                            )
                          : "border"
                      }`}
                    ></div>
                  ))}
              </div>
              <div className="w-5 text-end">
                {playerState.selectedCard.score}
              </div>
            </div> */}
          {/* CARD PRICE */}
          {/* {cardColors.map(
              (color) =>
                playerState.selectedCard &&
                playerState.selectedCard.price[color] > 0 && (
                  <div className="flex h-1/6 w-full items-center gap-2 px-2">
                    <div className="w-[25%]">
                      {`${color.slice(0, 1).toUpperCase()}${color
                        .slice(1)
                        .toLowerCase()}`}
                    </div>
                    <div className="flex h-[30%] flex-grow items-center justify-between gap-[3px]">
                      {Array(7)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            className={`h-full w-1/5 rounded-md drop-shadow ${
                              playerState.selectedCard &&
                              playerState.selectedCard?.price[color] > i
                                ? colorClass(color)
                                : "border"
                            }`}
                          ></div>
                        ))}
                    </div>
                    <div className="w-5 text-end">
                      {playerState.selectedCard?.price[color]}
                    </div>
                  </div>
                )
            )}
          </div> */}
        </div>
      </div>
    );

  const RequiredTokensShowcase = () =>
    requiredTokens &&
    discountedPrice &&
    replacedPrice && (
      <div className="mx-4 flex flex-1 flex-col gap-2">
        <Title>REQUIRED TOKENS</Title>
        {/* <hr className="h-[1px] w-full rounded-full bg-[#111827] drop-shadow-md"></hr> */}
        <div className="flex w-full select-none justify-center gap-6">
          {requiredTokens.map((cardColor) => (
            <button
              className={`relative aspect-square w-[20%] cursor-default rounded-md border bg-[linear-gradient(45deg,#f5f5f5,#ffffff)] drop-shadow ${
                cardColor === playerState.selectedCardColor &&
                selectedColorClass
              } ${discountedPrice[cardColor] !== 0 && ""}`}
              disabled={discountedPrice[cardColor] === 0}
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
                        ? "top-4 left-3"
                        : "top-4 left-4"
                    }`}
                  >
                    <Token
                      tokenColor={cardColor}
                      tokenEffect="return"
                      reference="player"
                      flexCol
                      {...props}
                    />
                  </div>
                  <div
                    className={`absolute ${
                      playerState.playerTokens[cardColor] !== 0
                        ? "right-2 top-2"
                        : "top-4 left-4"
                    }`}
                  >
                    <Token
                      tokenColor="gold"
                      tokenEffect="return"
                      reference="player"
                      colorToReplace={cardColor}
                      flexCol
                      {...props}
                    />
                  </div>
                  <div className="absolute right-0.5 bottom-0.5">
                    <span className="text-lg font-medium">
                      {replacedPrice[cardColor]}
                    </span>
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
                  {discountedPrice[cardColor] === 0 && (
                    <div className="flex items-center justify-center text-slate-400">
                      <CompleteIcon />
                    </div>
                  )}
                </>
              )}
            </button>
          ))}
          {/* {Array(4 - requiredTokens.length)
            .fill(0)
            .map(() => (
              <button
                className={`relative aspect-square w-[20%] cursor-default rounded-md border bg-gray-50 drop-shadow`}
                disabled
              >
                <>
                  <div className="absolute right-0.5 bottom-0.5">
                    <span className="text-lg">0</span>
                    <span className="text-sm">/0</span>
                  </div>
                  <div className="flex items-center justify-center text-slate-400">
                    <CompleteIcon />
                  </div>
                </>
              </button>
            ))} */}
        </div>
      </div>
    );

  const AvailableTokensShowcase = () => (
    <div className="mx-4 flex flex-1 flex-col gap-2">
      {playerState.currentAction !== "take" && !playerState.hasExtraTurn && (
        <Title>AVAILABLE TOKENS</Title>
      )}
      <div className="flex w-full flex-1 items-center justify-center">
        {tokenColors.map((tokenColor) => (
          <div className="flex w-1/6 justify-center">
            <Token
              tokenColor={tokenColor}
              tokenEffect={!playerState.hasExtraTurn ? "take" : null}
              reference="resource"
              showCount
              flexCol
              {...props}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const SelectedTokensShowcase = () => (
    <div className="mx-4 flex flex-1 flex-col gap-2">
      <Title>SELECTED TOKENS</Title>
      <div className="flex h-full w-full flex-1 items-center">
        {tokenColors.map((tokenColor) => (
          <div className="flex w-1/6 justify-center">
            <Token
              tokenColor={tokenColor}
              tokenEffect="return"
              reference="player"
              showCount
              flexCol
              {...props}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const YourTokensShowcase = () => (
    <div className="mx-4 flex flex-1 flex-col gap-2">
      <Title>YOUR TOKENS</Title>
      {playerState.currentAction === "purchase" ? (
        <div className="flex w-full flex-1 items-center justify-center gap-6">
          {tokenColors.map((tokenColor) => (
            <Token
              tokenColor={tokenColor}
              tokenEffect={
                !playerState.hasExtraTurn &&
                playerState.currentAction !== "purchase"
                  ? null
                  : "take"
              }
              reference="inventory"
              showCount={true}
              flexCol
              {...props}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-full w-full items-center">
          {tokenColors.map((tokenColor) => (
            <div className="flex w-1/6 justify-center">
              <Token
                tokenColor={tokenColor}
                tokenEffect={
                  !playerState.hasExtraTurn &&
                  playerState.currentAction !== "purchase"
                    ? null
                    : "take"
                }
                reference="inventory"
                showCount={true}
                flexCol
                {...props}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (playerState.currentAction === "take")
    return (
      <div className="relative flex h-full w-full flex-col justify-between gap-6 text-sm">
        <AvailableTokensShowcase />
        <SelectedTokensShowcase />
        <YourTokensShowcase />
        <div className="flex w-full justify-center">
          <Button
            disabled={!playerState.success}
            onClick={() => {
              if (playerState.success) {
                const tokens = !playerState.hasExtraTurn
                  ? opTokenCount(
                      "increment",
                      game[`inventory${game.turnIdx}` as InventoryKey].tokens,
                      playerState.playerTokens
                    )
                  : playerState.inventoryTokens;
                const sumTokenColors = Object.values(tokens).reduce(
                  (a, b) => a + b,
                  0
                );
                if (sumTokenColors > 10) {
                  setPlayerState((prev) => ({
                    ...prev,
                    success: false,
                    hasExtraTurn: true,
                    message: "Return tokens to 10.",
                    playerTokens: defaultTokens,
                    inventoryTokens: tokens,
                  }));
                  return;
                }
                setPlayerState((prev) => ({
                  ...prev,
                  isNextTurn: true,
                }));
              }
            }}
          >
            {playerState.hasExtraTurn ? "Return" : "Collect"}
          </Button>
        </div>
      </div>
    );
  if (playerState.currentAction === "reserve") {
    if (playerState.hasExtraTurn)
      return (
        <div className="relative flex h-full w-full flex-col gap-6 text-sm">
          <AvailableTokensShowcase />
          <SelectedTokensShowcase />
          <YourTokensShowcase />
          <div className="flex w-full justify-center">
            <Button
              disabled={
                !playerState.success || cardReserved || maxReserved || noTokens
              }
              onClick={() => {
                if (
                  playerState.success &&
                  !cardReserved &&
                  !maxReserved &&
                  !noTokens
                ) {
                  const tokens = !playerState.hasExtraTurn
                    ? opTokenCount(
                        "increment",
                        game[`inventory${game.turnIdx}` as InventoryKey].tokens,
                        playerState.playerTokens
                      )
                    : playerState.inventoryTokens;
                  const sumTokenColors = Object.values(tokens).reduce(
                    (a, b) => a + b,
                    0
                  );
                  if (sumTokenColors > 10) {
                    setPlayerState((prev) => ({
                      ...prev,
                      success: false,
                      hasExtraTurn: true,
                      message: "Return tokens to 10.",
                      playerTokens: defaultTokens,
                      inventoryTokens: tokens,
                    }));
                    return;
                  }
                  setPlayerState((prev) => ({
                    ...prev,
                    isNextTurn: true,
                  }));
                }
              }}
            >
              Return
            </Button>
          </div>
        </div>
      );
    return (
      <div className="relative flex h-full w-full flex-col gap-6 text-sm">
        <CardShowcase />
        <AvailableTokensShowcase />
        <YourTokensShowcase />
        <div className="flex w-full justify-center">
          <Button
            disabled={
              !playerState.success || cardReserved || maxReserved || noTokens
            }
            onClick={() => {
              if (
                playerState.success &&
                !cardReserved &&
                !maxReserved &&
                !noTokens
              ) {
                const sumTokenColors = Object.values(
                  playerState.inventoryTokens
                ).reduce((a, b) => a + b, 0);
                // add gold token
                if (sumTokenColors > 9) {
                  setPlayerState((prev) => ({
                    ...prev,
                    success: false,
                    hasExtraTurn: true,
                    message: "Return tokens to 10.",
                    playerTokens: defaultTokens,
                    inventoryTokens: opTokenCountWColor(
                      "increment",
                      playerState.inventoryTokens,
                      "gold"
                    ),
                  }));
                  return;
                }
                setPlayerState((prev) => ({
                  ...prev,
                  isNextTurn: true,
                }));
              }
            }}
          >
            Reserve
          </Button>
        </div>
      </div>
    );
  }
  // Purchase or claim
  return (
    <div className="relative flex h-full w-full flex-col gap-6 text-sm">
      <CardShowcase />
      <RequiredTokensShowcase />
      <YourTokensShowcase />
      <div className="flex w-full justify-center">
        <Button
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
        </Button>
      </div>
    </div>
  );
}

function CompleteIcon() {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 16 16"
      height="32px"
      width="32px"
      className="drop-shadow"
    >
      <path d="M10.067.87a2.89 2.89 0 00-4.134 0l-.622.638-.89-.011a2.89 2.89 0 00-2.924 2.924l.01.89-.636.622a2.89 2.89 0 000 4.134l.637.622-.011.89a2.89 2.89 0 002.924 2.924l.89-.01.622.636a2.89 2.89 0 004.134 0l.622-.637.89.011a2.89 2.89 0 002.924-2.924l-.01-.89.636-.622a2.89 2.89 0 000-4.134l-.637-.622.011-.89a2.89 2.89 0 00-2.924-2.924l-.89.01-.622-.636zm.287 5.984l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 11.708-.708L7 8.793l2.646-2.647a.5.5 0 01.708.708z" />
    </svg>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      className="w-[30%] rounded-md bg-slate-600 p-2 text-base font-semibold text-white hover:bg-slate-700 disabled:bg-slate-400"
      {...props}
    >
      {children}
    </button>
  );
}
