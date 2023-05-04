import { Card, Price, Resource, Tokens } from "@prisma/client";
import { CardColor, TokenColor } from "./types";

export const defaultPrice: Price = {
  white: 0,
  blue: 0,
  green: 0,
  red: 0,
  black: 0,
};

export const defaultTokens: Tokens = {
  white: 0,
  blue: 0,
  green: 0,
  red: 0,
  black: 0,
  gold: 0,
};

export const tokenColors: TokenColor[] = [
  "white",
  "blue",
  "green",
  "red",
  "black",
  "gold",
];

export const cardColors: CardColor[] = [
  "white",
  "blue",
  "green",
  "red",
  "black",
];

export const shuffle = (begin: number, end: number) => {
  return shuffleArray(Array.from({ length: end - begin }, (_, i) => begin + i));
};

// DON'T TOUCH: Durstenfeld shuffle
const shuffleArray = (array: number[]) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    let j = (Math.random() * (i + 1)) | 0;
    [result[i], result[j]] = [result[j] as number, result[i] as number];
  }
  return result;
};

export function opTokenCount(
  op: "increment" | "decrement" | null,
  tokens1: Tokens,
  tokens2?: Tokens
): Tokens {
  const result = { ...tokens1 };
  if (op === null) return result;
  (Object.keys(result) as TokenColor[]).forEach((color) => {
    result[color] = Math.max(
      op === "increment"
        ? tokens1[color] + (tokens2 ? tokens2[color] : 1)
        : tokens1[color] - (tokens2 ? tokens2[color] : 1),
      0
    );
  });
  return result;
}

export function opTokenCountWColor(
  op: "increment" | "decrement" | null,
  tokens: Tokens,
  tokenColor: TokenColor
): Tokens {
  if (op === null) return { ...tokens };
  const result = {
    ...tokens,
    [tokenColor]:
      op === "increment" ? tokens[tokenColor] + 1 : tokens[tokenColor] - 1,
  };
  return result;
}

export function opPrice(
  op: "increment" | "decrement" | null,
  price1: Price,
  price2?: Price
): Price {
  const result = { ...price1 };
  if (op === null) return result;
  (Object.keys(result) as CardColor[]).forEach((color) => {
    result[color] = Math.max(
      op === "increment"
        ? price1[color] + (price2 ? price2[color] : 1)
        : price1[color] - (price2 ? price2[color] : 1),
      0
    );
  });
  return result;
}

export function opPriceWColor(
  op: "increment" | "decrement" | null,
  price: Price,
  cardColor: CardColor
): Price {
  if (op === null) return { ...price };
  const result = {
    ...price,
    [cardColor]:
      op === "increment" ? price[cardColor] + 1 : price[cardColor] - 1,
  };
  return result;
}

export function opColorWPrice(
  price1: Price,
  price2: Price,
  cardColor: CardColor
): number {
  return Math.max(price1[cardColor] - price2[cardColor], 0);
}

export function compPrice(price1: Price, price2: Price): boolean {
  return (["white", "blue", "green", "red", "black"] as CardColor[]).every(
    (color) => {
      if (price1[color] !== price2[color]) return false;
      return true;
    }
  );
}

export function drawCards(resource: Resource, cardId: number) {
  // if (cardId === null) return { cardsLv1: undefined };
  let name: string;
  let result: number[];
  if (0 <= cardId && cardId < 40) {
    name = "cardsLv1";
    result = [...resource.cardsLv1];
  } else if (40 <= cardId && cardId < 70) {
    name = "cardsLv2";
    result = [...resource.cardsLv2];
  } else if (70 <= cardId && cardId < 90) {
    name = "cardsLv3";
    result = [...resource.cardsLv3];
  } else {
    return { cardsLv1: undefined };
  }
  const drawIdx = result.indexOf(cardId);
  const drawCard = result.splice(4, 1)[0];
  if (drawIdx >= 4) {
    return { cardsLv1: undefined };
  }
  result.splice(drawIdx, 1, drawCard ?? -1);
  return {
    [name]: result,
  };
}

// export function takeTile(tiles: number[], tileId: number) {
//   const result = [...tiles];
//   const tileIdx = result.indexOf(tileId);
//   result.splice(tileIdx, 1, -1);
//   return result;
// }

export function takeTiles(resTiles: number[], tileIds: number[]) {
  let result = [...resTiles];
  tileIds.forEach((tileId) => {
    const tileIdx = result.indexOf(tileId);
    result.splice(tileIdx, 1, -1);
  });
  return result;
}

export function cardCount(cards: number[]) {
  return [...cards].reduce((count, x) => (x !== -1 ? count + 1 : count), 0);
}
