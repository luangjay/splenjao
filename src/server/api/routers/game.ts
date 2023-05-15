import { string, z } from "zod";
import { Card, Game, Price, Resource, Tile, Tokens } from "@prisma/client";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { InventoryKey, TokenColor, CardColor } from "../../../common/types";
import {
  opTokenCount,
  opPriceWColor,
  drawCards,
  takeTiles,
  opTokenCountWColor,
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

export const gameRouter = createTRPCRouter({
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

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: z.string() }))
    .mutation(async ({ ctx, input }) =>
      ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
        },
      })
    ),

  updateWinner: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) =>
      ctx.prisma.game.update({
        where: {
          id: input,
        },
        data: {},
      })
    ),

  updateLeave: protectedProcedure
    .input(z.object({ id: z.string(), playerId: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          status: "stopped",
          stopperId: input.playerId,
          endedAt: new Date(),
        },
      })
    ),

  // BAD SMELL: GOD METHOD LOL
  updateNextTurn: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        playerId: z.string(),
        playerState: z.object({
          success: z.boolean(),
          currentAction: z.string().nullable(),
          selectedCard: z
            .object({
              id: z.number(),
              level: z.number(),
              color: z.string(),
              score: z.number(),
              price: zPrice,
            })
            .nullable(),
          selectedCardColor: z.string().nullable(),
          resourceTokens: zTokens,
          inventoryTokens: zTokens,
          playerTokens: zTokens,
          priceToReplace: zPrice,
          hasExtraTurn: z.boolean(),
          isNextTurn: z.boolean(),
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
      const nPrice = input.playerState.selectedCard?.color
        ? opPriceWColor(
            "increment",
            game[`inventory${game.turnIdx}` as InventoryKey].discount,
            input.playerState.selectedCard.color as CardColor
          )
        : null;
      const tiles: Tile[] =
        input.playerState.selectedCard?.color && nPrice
          ? await ctx.prisma.tile.findMany({
              where: {
                id: {
                  in: game.resource.tiles,
                },
                price: {
                  is: {
                    AND: {
                      white: {
                        lte: nPrice.white,
                      },
                      blue: {
                        lte: nPrice.blue,
                      },
                      green: {
                        lte: nPrice.green,
                      },
                      red: {
                        lte: nPrice.red,
                      },
                      black: {
                        lte: nPrice.black,
                      },
                    },
                  },
                },
              },
            })
          : [];
      const tileIds = tiles.map((tile) => tile.id);
      const tileScores = tiles.map((tile) => tile.score);
      // const card: Card | null = await ctx.prisma.card.findUnique({
      //   where: {
      //     id: input.playerState.cardId,
      //   },
      // });
      if (game.status === "starting") {
        await ctx.prisma.game.update({
          where: {
            id: input.id,
          },
          data: {
            status: "started",
            turnIdx: (game.turnIdx + 1) % game.playerCount,
          },
        });
        return;
      }
      if (
        !input.id ||
        !input.playerState.success ||
        input.playerId !== game.playerIds[game.turnIdx]
      ) {
        return;
      }
      const updatedGame = await ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          // status: game.status === "created" ? "started" : undefined,
          resource: {
            update:
              input.playerState.currentAction === "take"
                ? {
                    tokens: !input.playerState.hasExtraTurn
                      ? input.playerState.resourceTokens
                      : opTokenCount(
                          "increment",
                          input.playerState.resourceTokens,
                          input.playerState.playerTokens
                        ),
                  }
                : (input.playerState.currentAction === "purchase" ||
                    input.playerState.currentAction === "reserve") &&
                  input.playerState.selectedCard
                ? {
                    tokens: opTokenCount(
                      input.playerState.currentAction === "purchase" ||
                        input.playerState.hasExtraTurn
                        ? "increment"
                        : "decrement",
                      input.playerState.currentAction === "reserve"
                        ? opTokenCountWColor(
                            "decrement",
                            game.resource.tokens,
                            "gold"
                          )
                        : game.resource.tokens,
                      input.playerState.playerTokens
                    ),
                    tiles:
                      input.playerState.currentAction === "purchase" && tiles
                        ? takeTiles(game.resource.tiles, tileIds)
                        : undefined,
                    ...drawCards(
                      game.resource,
                      input.playerState.selectedCard.id
                    ),
                  }
                : undefined,
          },
          [`inventory${game.turnIdx}`]: {
            update:
              input.playerState.currentAction === "take"
                ? !input.playerState.hasExtraTurn
                  ? {
                      tokens: opTokenCount(
                        "increment",
                        game[`inventory${game.turnIdx}` as InventoryKey].tokens,
                        input.playerState.playerTokens
                      ),
                    }
                  : { tokens: input.playerState.inventoryTokens }
                : input.playerState.currentAction === "purchase"
                ? {
                    tokens: opTokenCount(
                      "decrement",
                      game[`inventory${game.turnIdx}` as InventoryKey].tokens,
                      input.playerState.playerTokens
                    ),
                    cards: input.playerState.selectedCard
                      ? {
                          push: input.playerState.selectedCard.id,
                        }
                      : undefined,
                    reserves: input.playerState.selectedCard
                      ? game[
                          `inventory${game.turnIdx}` as InventoryKey
                        ].reserves.filter(
                          (cardId) =>
                            cardId !== input.playerState.selectedCard?.id
                        )
                      : undefined,
                    tiles: tiles
                      ? {
                          push: tileIds,
                        }
                      : undefined,
                    discount: input.playerState.selectedCard
                      ? opPriceWColor(
                          "increment",
                          game[`inventory${game.turnIdx}` as InventoryKey]
                            .discount,
                          input.playerState.selectedCard.color as CardColor
                        )
                      : undefined,
                    score: input.playerState.selectedCard
                      ? {
                          increment:
                            input.playerState.selectedCard.score +
                            (tiles
                              ? tileScores.reduce(
                                  (acc, score) => acc + score,
                                  0
                                )
                              : 0),
                        }
                      : undefined,
                  }
                : input.playerState.currentAction === "reserve"
                ? {
                    tokens: !input.playerState.hasExtraTurn
                      ? opTokenCountWColor(
                          "increment",
                          game[`inventory${game.turnIdx}` as InventoryKey]
                            .tokens,
                          "gold"
                        )
                      : input.playerState.inventoryTokens,
                    reserves: input.playerState.selectedCard
                      ? {
                          push: input.playerState.selectedCard.id,
                        }
                      : undefined,
                  }
                : undefined,
          },
        },
      });

      const { maxIdx, maxScore } = calculateWinner(updatedGame);

      return ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          turnIdx: (updatedGame.turnIdx + 1) % updatedGame.playerCount,
          status:
            updatedGame.status === "started"
              ? updatedGame[`inventory${updatedGame.turnIdx}` as InventoryKey]
                  .score >= 15
                ? updatedGame.turnIdx === updatedGame.playerCount - 1
                  ? "ended"
                  : "ending"
                : undefined
              : updatedGame.status === "ending" &&
                updatedGame.turnIdx === updatedGame.playerCount - 1
              ? "ended"
              : undefined,
          winnerId:
            updatedGame.status === "started"
              ? updatedGame[`inventory${updatedGame.turnIdx}` as InventoryKey]
                  .score >= 15 &&
                updatedGame.turnIdx === updatedGame.playerCount - 1
                ? maxIdx === -1
                  ? null
                  : updatedGame.playerIds[maxIdx]
                : undefined
              : updatedGame.status === "ending" &&
                updatedGame.turnIdx === updatedGame.playerCount - 1
              ? maxIdx === -1
                ? null
                : updatedGame.playerIds[maxIdx]
              : undefined,
          winnerScore:
            updatedGame.status === "started"
              ? updatedGame[`inventory${updatedGame.turnIdx}` as InventoryKey]
                  .score >= 15 &&
                updatedGame.turnIdx === updatedGame.playerCount - 1
                ? maxIdx === -1
                  ? null
                  : maxScore
                : undefined
              : updatedGame.status === "ending" &&
                updatedGame.turnIdx === updatedGame.playerCount - 1
              ? maxIdx === -1
                ? null
                : maxScore
              : undefined,
          endedAt:
            updatedGame.status === "started"
              ? updatedGame[`inventory${updatedGame.turnIdx}` as InventoryKey]
                  .score >= 15
                ? updatedGame.turnIdx === updatedGame.playerCount - 1
                  ? new Date()
                  : undefined
                : undefined
              : updatedGame.status === "ending" &&
                updatedGame.turnIdx === updatedGame.playerCount - 1
              ? new Date()
              : undefined,
        },
      });
    }),
});

function calculateWinner(game: Game) {
  const players = Array(game.playerCount)
    .fill(0)
    .map((_, idx) => {
      const inventory = game[`inventory${idx}` as InventoryKey];
      return {
        idx,
        score: inventory.score,
        purchaseCount: inventory.cards.length,
        reserveCount: inventory.reserves.length,
      };
    });

  const sortedPlayers = players.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score; // Sort by maximum points
    } else if (a.purchaseCount !== b.purchaseCount) {
      return a.purchaseCount - b.purchaseCount; // Sort by least cards purchased
    } else {
      return a.reserveCount - b.reserveCount; // Sort by least cards reserved
    }
  });

  const winner = sortedPlayers[0] ?? {
    idx: -1,
    score: -1,
    purchaseCount: -1,
    reserveCount: -1,
  };
  const isTie =
    sortedPlayers.filter(
      (player) =>
        player.score === winner.score &&
        player.purchaseCount === winner.purchaseCount &&
        player.reserveCount === winner.reserveCount
    ).length > 1;

  return {
    maxIdx: winner.idx !== -1 && !isTie ? winner.idx : -1,
    maxScore: winner.idx !== -1 && !isTie ? winner.score : -1,
  };
}
