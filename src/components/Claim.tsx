import Card from "./Card";
import Token from "./Token";
import { DialogProps } from "./LegacyDialog";
import { CardColor, InventoryKey } from "../common/types";
import { opPrice, opColorWPrice, tokenColors } from "../common/constants";

export default function Claim(props: DialogProps) {
  const { game, player, playerState, setPlayerState } = props;
  const colorClass =
    playerState.selectedCardColor === "white"
      ? "ring-gray-100/[.5]"
      : playerState.selectedCardColor === "blue"
      ? "ring-blue-600/[.5]"
      : playerState.selectedCardColor === "green"
      ? "ring-green-600/[.5]"
      : playerState.selectedCardColor === "red"
      ? "ring-red-600/[.5]"
      : playerState.selectedCardColor === "black"
      ? "ring-black/[.5]"
      : "";

  if (!playerState.selectedCard || playerState.currentAction !== "claim")
    return <></>;

  const { gold: goldToken, ...price } = playerState.playerTokens;
  const replacedPrice = opPrice("increment", price, playerState.priceToReplace);
  const discountedPrice = opPrice(
    "decrement",
    playerState.selectedCard.price,
    game[`inventory${game.turnIdx}` as InventoryKey].discount
  );
  return (
    <div className="flex h-[600px] w-full flex-col gap-8 sm:mx-16">
      <div className="mx-auto">
        <Card
          cardId={playerState.selectedCard.id}
          cardEffect={null}
          {...props}
        />
      </div>
      <div className="flex w-full justify-center gap-4">
        {(Object.keys(playerState.selectedCard.price) as CardColor[])
          .filter(
            (cardColor) =>
              playerState.selectedCard &&
              playerState.selectedCard.price[cardColor as CardColor] !== 0
          )
          .map((cardColor) => (
            <>
              <button
                className={`h-20 w-20 rounded-md shadow-sm drop-shadow-md ${
                  cardColor === playerState.selectedCardColor
                    ? `ring ${colorClass}`
                    : "border-2"
                }`}
                onClick={() => {
                  setPlayerState((prev) => ({
                    ...prev,
                    selectedCardColor:
                      cardColor === playerState.selectedCardColor
                        ? null
                        : cardColor,
                  }));
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
                      className={`absolute -z-10 ${
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
                      <span className="text-md">
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
                  </>
                )}
              </button>
            </>
          ))}
      </div>
      <div>
        <Token
          tokenColor="gold"
          tokenEffect="special"
          reference="resource"
          {...props}
        />
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
      <div className="flex w-full border-2">
        {tokenColors.map((tokenColor) => (
          <div className="w-1/6">
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
      <button
        className="w-1/2 bg-cyan-400 p-2"
        onClick={() => {
          if (playerState.success)
            setPlayerState((prev) => ({
              ...prev,
              isNextTurn: true,
            }));
        }}
      >
        NEXT TURN
      </button>
    </div>
  );
}

function TokenBox() {}
