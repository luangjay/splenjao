import { z } from "zod";
import { ActionType, Game, Status } from "@prisma/client";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

enum TokenColor {
  white,
  blue,
  green,
  red,
  black,
}

const addSeconds = (date: Date, seconds: number) => {
  date.setSeconds(date.getSeconds() + seconds);
  return date;
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
      if (input.playerId === game.hostId && game.nextTurn)
        return ctx.prisma.game.update({
          where: {
            id: input.id,
          },
          data: {
            currentTurn: {
              playerIdx: game.nextTurn.playerIdx,
              startTime: game.nextTurn.startTime,
            },
            nextTurn: {
              playerIdx: (game.nextTurn.playerIdx + 1) % game.playerCount,
              startTime: addSeconds(new Date(), 15),
            },
          },
        });
    }),

  updateToken: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        color: z.string(),
        inc: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) =>
      ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          token: {
            update: {
              [input.color]: {
                increment: input.inc,
              },
            },
          },
        },
      })
    ),

  updateServerState: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        state: z.object({
          take: z.boolean().nullable().optional(),
          color: z.string().optional(),
          type: z.nativeEnum(ActionType).nullable().optional(),
          cardId: z.number().min(0).max(89).optional(),
        }),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          currentAction: {
            update: {
              type: input.state.type,
              token: {
                update: input.state.color
                  ? {
                      [input.state.color]: {
                        increment:
                          input.state.take === null
                            ? 0
                            : input.state.take
                            ? 1
                            : -1,
                      },
                    }
                  : undefined,
              },
              cardId: input.state.cardId,
            },
          },
          token: {
            update: input.state.color
              ? {
                  [input.state.color]: {
                    increment:
                      input.state.take === null ? 0 : input.state.take ? -1 : 1,
                  },
                }
              : undefined,
          },
        },
      })
    ),

  updateCurrentActionToken: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        color: z.string(),
        inc: z.number(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          currentAction: {
            update: {
              token: {
                update: {
                  [input.color]: {
                    increment: input.inc,
                  },
                },
              },
            },
          },
        },
      })
    ),

  updateCurrentActionType: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.nativeEnum(ActionType).nullable(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          currentAction: {
            update: {
              type: input.type,
            },
          },
        },
      })
    ),

  updateCurrentCardId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        color: z.string().optional(),
        inc: z.string(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          currentAction: {
            update: {
              token: {
                update: input.color
                  ? {
                      [input.color]: {
                        increment: input.inc,
                      },
                    }
                  : undefined,
              },
            },
          },
        },
      })
    ),
});
