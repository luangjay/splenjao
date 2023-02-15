import { string, z } from "zod";
import { Card, Game, Price, Resource, Tokens } from "@prisma/client";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { InventoryKey, TokenColor, CardColor } from "../../../common/types";
import {
  opTokenCount,
  opPriceWColor,
  drawCards,
} from "../../../common/constants";

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

const zPrice = z.object({
  white: z.number(),
  blue: z.number(),
  green: z.number(),
  red: z.number(),
  black: z.number(),
});

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
          card: z
            .object({
              id: z.number(),
              level: z.number(),
              color: z.string(),
              score: z.number(),
              price: zPrice,
            })
            .nullable(),
          cardColor: z.string().nullable(),
          resourceTokens: zTokens,
          inventoryTokens: zTokens,
          tokens: zTokens,
          replaces: zPrice,
          extraTurn: z.boolean(),
          nextTurn: z.boolean(),
          message: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game: Game = await ctx.prisma.game.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
      // const card: Card | null = await ctx.prisma.card.findUnique({
      //   where: {
      //     id: input.playerState.cardId,
      //   },
      // });
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
                      !input.playerState.extraTurn ? "decrement" : "increment",
                      game.resource.tokens,
                      input.playerState.tokens
                    ),
                  }
                : (input.playerState.action === "purchase" ||
                    input.playerState.action === "reserve") &&
                  input.playerState.card
                ? {
                    tokens: opTokenCount(
                      input.playerState.action === "purchase"
                        ? "increment"
                        : "decrement",
                      game.resource.tokens,
                      input.playerState.tokens
                    ),
                    ...drawCards(game.resource, input.playerState.card.id),
                  }
                : undefined,
          },
          [`inventory${game.turnIdx}`]: {
            update:
              input.playerState.action === "take"
                ? {
                    tokens: opTokenCount(
                      !input.playerState.extraTurn ? "increment" : "decrement",
                      game[`inventory${game.turnIdx}` as InventoryKey].tokens,
                      input.playerState.tokens
                    ),
                  }
                : input.playerState.action === "purchase"
                ? {
                    tokens: opTokenCount(
                      "decrement",
                      game[`inventory${game.turnIdx}` as InventoryKey].tokens,
                      input.playerState.tokens
                    ),
                    cards: input.playerState.card
                      ? {
                          push: input.playerState.card.id,
                        }
                      : undefined,
                    discount: input.playerState.card
                      ? opPriceWColor(
                          "increment",
                          game[`inventory${game.turnIdx}` as InventoryKey]
                            .discount,
                          input.playerState.card.color as CardColor
                        )
                      : undefined,
                    score: input.playerState.card
                      ? {
                          increment: input.playerState.card.score,
                        }
                      : undefined,
                  }
                : input.playerState.action === "reserve"
                ? {
                    tokens: opTokenCount(
                      "increment",
                      game[`inventory${game.turnIdx}` as InventoryKey].tokens,
                      input.playerState.tokens
                    ),
                    reserves: input.playerState.card
                      ? {
                          push: input.playerState.card.id,
                        }
                      : undefined,
                  }
                : undefined,
          },
        },
      });
    }),
});
