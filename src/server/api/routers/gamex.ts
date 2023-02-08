import { z } from "zod";
import { ActionType, Card, Game, Shuffle, Status } from "@prisma/client";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

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

const drawCards = (shuffle: Shuffle, cardId: number | null) => {
  if (cardId === null) return { ...shuffle };
  let name;
  let result;
  if (0 <= cardId && cardId < 40) {
    name = "card1_ids";
    result = [...shuffle.card1_ids];
  } else if (40 <= cardId && cardId < 70) {
    name = "card2_ids";
    result = [...shuffle.card2_ids];
  } else if (70 <= cardId && cardId < 90) {
    name = "card3_ids";
    result = [...shuffle.card3_ids];
  } else {
    return { ...shuffle };
  }
  if (result.length > 5) {
    const drawIdx = result.indexOf(cardId);
    const drawCardId = result.splice(5, 1)[0] as number;
    result.splice(drawIdx, 1, drawCardId);
  } else {
    const drawIdx = result.indexOf(cardId);
    result.splice(drawIdx, 1);
  }
  return {
    ...shuffle,
    [name]: result,
  };
};

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
    .query(({ ctx, input }) =>
      ctx.prisma.game.findFirstOrThrow({
        where: {
          id: input.id,
          playerIds: {
            has: input.playerId,
          },
        },
      })
    ),

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

  updateEndTurn: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        playerId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game: Game = await ctx.prisma.game.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
      if (input.playerId !== game.hostId) return;
      const card: Card | null = await ctx.prisma.card.findUnique({
        where: {
          id: game.action.cardId,
        },
      });
      return ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          action: {
            turnEnding: true,
            type: null,
            tokenList: {
              white: 0,
              blue: 0,
              green: 0,
              red: 0,
              black: 0,
              gold: 0,
            },
            cardId: -1,
          },
          nextTurn: {
            playerIdx: (game.nextTurn.playerIdx + 1) % game.playerCount,
            startTime: addSeconds(new Date(), 10),
          },
          playerCard:
            game.action.cardId !== -1 && game.turn.playerIdx >= 0
              ? {
                  update: {
                    [`i${game.turn.playerIdx}`]: { push: game.action.cardId },
                  },
                }
              : undefined,
          playerToken:
            game.action.tokenList && game.turn.playerIdx >= 0
              ? {
                  update: {
                    [`i${game.turn.playerIdx}`]: {
                      update: {
                        white: { increment: game.action.tokenList.white },
                        blue: { increment: game.action.tokenList.blue },
                        green: { increment: game.action.tokenList.green },
                        red: { increment: game.action.tokenList.red },
                        black: { increment: game.action.tokenList.black },
                        gold: { increment: game.action.tokenList.gold },
                      },
                    },
                  },
                }
              : undefined,
          playerScore: card
            ? {
                update: {
                  [`i${game.turn.playerIdx}`]: {
                    increment: card.score,
                  },
                },
              }
            : undefined,
          playerDiscount: card
            ? {
                update: {
                  [`i${game.turn.playerIdx}`]: {
                    update: {
                      [card.color]: {
                        increment: 1,
                      },
                    },
                  },
                },
              }
            : undefined,
          shuffle: drawCards(game.shuffle, game.action.cardId),
        },
      });
    }),

  updateNextTurn: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        playerId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game: Game = await ctx.prisma.game.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
      if (input.playerId !== game.hostId) return;
      const card: Card | null = await ctx.prisma.card.findUnique({
        where: {
          id: game.action.cardId,
        },
      });
      return ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          turn: {
            playerIdx: game.nextTurn.playerIdx,
            // startTime: game.nextTurn.startTime,
            startTime: new Date(),
          },
          endTurn: {
            playerIdx: game.nextTurn.playerIdx,
            startTime: addSeconds(new Date(), 20),
          },
          // nextTurn: {
          //   playerIdx: (game.nextTurn.playerIdx + 1) % game.playerCount,
          //   startTime: addSeconds(new Date(), 32),
          // },
          action: {
            turnEnding: false,
            type: null,
            tokenList: {
              white: 0,
              blue: 0,
              green: 0,
              red: 0,
              black: 0,
              gold: 0,
            },
            cardId: -1,
          },
          playerCard:
            game.action.cardId !== -1 && game.turn.playerIdx >= 0
              ? {
                  update: {
                    [`i${game.turn.playerIdx}`]: { push: game.action.cardId },
                  },
                }
              : undefined,
          playerToken:
            game.action.tokenList && game.turn.playerIdx >= 0
              ? {
                  update: {
                    [`i${game.turn.playerIdx}`]: {
                      update: {
                        white: { increment: game.action.tokenList.white },
                        blue: { increment: game.action.tokenList.blue },
                        green: { increment: game.action.tokenList.green },
                        red: { increment: game.action.tokenList.red },
                        black: { increment: game.action.tokenList.black },
                        gold: { increment: game.action.tokenList.gold },
                      },
                    },
                  },
                }
              : undefined,
          playerScore: card
            ? {
                update: {
                  [`i${game.turn.playerIdx}`]: {
                    increment: card.score,
                  },
                },
              }
            : undefined,
          playerDiscount: card
            ? {
                update: {
                  [`i${game.turn.playerIdx}`]: {
                    update: {
                      [card.color]: {
                        increment: 1,
                      },
                    },
                  },
                },
              }
            : undefined,
          shuffle: drawCards(game.shuffle, game.action.cardId),
        },
      });
    }),

  updateServerState: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        state: z.object({
          take: z.boolean().nullable().optional(),
          color: z.string().nullable().optional(),
          type: z.nativeEnum(ActionType).nullable().optional(),
          cardId: z.number().min(-1).max(89).optional(),
        }),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          action: {
            update: {
              type: input.state.type,
              tokenList: input.state.color
                ? {
                    update: {
                      [input.state.color]: {
                        increment:
                          input.state.take === null
                            ? 0
                            : input.state.take
                            ? 1
                            : -1,
                      },
                    },
                  }
                : undefined,
              cardId: input.state.cardId,
            },
          },
          tokenList: input.state.color
            ? {
                update: {
                  [input.state.color]: {
                    increment:
                      input.state.take === null ? 0 : input.state.take ? -1 : 1,
                  },
                },
              }
            : undefined,
        },
      })
    ),
});
