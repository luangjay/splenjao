import { string, z } from "zod";
import { Card, Game, Resource, Tokens } from "@prisma/client";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { InventoryKey, TokenColor } from "../../../common/types";

const addSeconds = (date: Date, seconds: number) => {
  date.setSeconds(date.getSeconds() + seconds);
  return date;
};

// const drawCards = (cardIds: Array<number>, cardId: number) => {
//   let result = [...cardIds]
//   if (result.length > 5) {
//     const drawIdx = result.indexOf(cardId);
//     const drawCardId = result.splice(5, 1)[0] as number;
//     result.splice(drawIdx, 1, drawCardId);
//   } else {
//     const drawIdx = result.indexOf(cardId);
//     result.splice(drawIdx, 1);
//   }
//   return result
// };

// const drawCards = (gameResource: GameResource, cardId: number | null) => {
//   if (cardId === null) return { ...gameResource };
//   let name;
//   let result;
//   if (0 <= cardId && cardId < 40) {
//     name = "card1_ids";
//     result = [...gameResource.card1_ids];
//   } else if (40 <= cardId && cardId < 70) {
//     name = "card2_ids";
//     result = [...gameResource.card2_ids];
//   } else if (70 <= cardId && cardId < 90) {
//     name = "card3_ids";
//     result = [...gameResource.card3_ids];
//   } else {
//     return { ...gameResource };
//   }
//   if (result.length > 5) {
//     const drawIdx = result.indexOf(cardId);
//     const drawCardId = result.splice(5, 1)[0] as number;
//     result.splice(drawIdx, 1, drawCardId);
//   } else {
//     const drawIdx = result.indexOf(cardId);
//     result.splice(drawIdx, 1);
//   }
//   return {
//     ...gameResource,
//     [name]: result,
//   };
// };

function opTokenCount(
  op: "increment" | "decrement" | null,
  tokens1: Tokens,
  tokens2?: Tokens
): Tokens | undefined {
  if (!op) return undefined;
  const result: Tokens = { ...tokens1 };
  (Object.keys(result) as TokenColor[]).forEach((color) => {
    result[color] =
      op === "increment"
        ? tokens1[color] + (tokens2 ? tokens2[color] : 1)
        : tokens1[color] - (tokens2 ? tokens2[color] : 1);
  });
  return result;
}

const drawCards = (resource: Resource, cardId: number | null) => {
  if (cardId === null) return { cardsLv1: undefined };
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
  const drawCard = result.splice(5, 0);
  if (drawIdx >= 5) return { cardsLv1: undefined };
  if (drawCard[0]) {
    result.splice(drawIdx, 1, drawCard[0]);
  } else {
    result.splice(drawIdx, 1, -1);
  }
  return {
    [name]: result,
  };
};

const zTokens = z.object({
  white: z.number(),
  blue: z.number(),
  green: z.number(),
  red: z.number(),
  black: z.number(),
  gold: z.number(),
});

// function drawCards(cards: number[], cardId: number) {
//   const result = [...cards]
//   const head = result.splice(0, 5)
//   if (!head.includes(cardId)) {
//     return result;
//   }

// };

export const gamexRouter = createTRPCRouter({
  // findAll: publicProcedure.query(({ ctx }) => {
  //   return ctx.prisma.card.findMany();
  // }),

  // findById: publicProcedure.input(z.number()).query(({ ctx, input }) =>
  //   ctx.prisma.card.findUnique({
  //     where: {
  //       id: input,
  //     },
  //   })
  // ),
  findAndAuthorize: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        playerId: z.string().optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.game.findFirstOrThrow({
        where: {
          id: input.id,
          playerIds: input.playerId
            ? {
                has: input.playerId,
              }
            : undefined,
        },
      });
    }),

  findPlayerById: publicProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) =>
      ctx.prisma.player.findUniqueOrThrow({
        where: {
          id: input,
        },
      })
    ),

  updatePlayerLastPlayed: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) =>
      ctx.prisma.player.update({
        where: {
          id: input,
        },
        data: {
          lastPlayed: new Date(),
        },
      })
    ),

  updateNextTurn: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        playerId: z.string(),
        playerState: z.object({
          success: z.boolean(),
          action: z.string().nullable(),
          cardId: z.number().nullable(),
          resourceTokens: zTokens,
          playerTokens: zTokens,
          inventoryTokens: zTokens,
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game: Game = await ctx.prisma.game.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
      if (game.status === "created")
        return ctx.prisma.game.update({
          where: {
            id: input.id,
          },
          data: {
            status: "started",
            turnIdx: (game.turnIdx + 1) % game.playerCount,
          },
        });
      if (
        !input.id ||
        !input.playerState.success ||
        input.playerId !== game.playerIds[game.turnIdx]
      ) {
        return;
      }
      return ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          // status: game.status === "created" ? "started" : undefined,
          turnIdx: (game.turnIdx + 1) % game.playerCount,
          resource: {
            update:
              input.playerState.action === "take"
                ? {
                    tokens: opTokenCount(
                      "decrement",
                      game.resource.tokens,
                      input.playerState.playerTokens
                    ),
                  }
                : input.playerState.action === "purchase" ||
                  input.playerState.action === "reserve"
                ? {
                    ...drawCards(game.resource, input.playerState.cardId),
                  }
                : undefined,
          },
          [`inventory${game.turnIdx}`]: {
            update:
              input.playerState.action === "take"
                ? {
                    tokens: opTokenCount(
                      "increment",
                      game[`inventory${game.turnIdx}` as InventoryKey].tokens,
                      input.playerState.playerTokens
                    ),
                  }
                : input.playerState.action === "purchase"
                ? {
                    tokens: opTokenCount(
                      "decrement",
                      game[`inventory${game.turnIdx}` as InventoryKey].tokens,
                      input.playerState.playerTokens
                    ),
                    cards: {
                      push: input.playerState.cardId,
                    },
                  }
                : input.playerState.action === "reserve"
                ? {
                    tokens: opTokenCount(
                      "increment",
                      game[`inventory${game.turnIdx}` as InventoryKey].tokens,
                      input.playerState.playerTokens
                    ),
                    cards: {
                      push: input.playerState.cardId,
                    },
                  }
                : undefined,
          },
        },
      });
    }),
});
