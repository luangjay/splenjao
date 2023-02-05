import { z } from "zod";
import { Game, Status } from "@prisma/client";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

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
        id: z.string(),
        playerId: z.string(),
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
});
