import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const lobbyRouter = createTRPCRouter({
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

  // createEmptyOne: publicProcedure.mutation(async ({ ctx }) =>
  //   ctx.prisma.lobby.create({
  //     data: {
  //       playerCount: 0,
  //       playerIds: Array<string>(),
  //     },
  //   })
  // ),

  findEmptyOne: publicProcedure.query(
    async ({ ctx }) =>
      await ctx.prisma.lobby.findFirst({
        where: {
          playerCount: 0,
        },
      })
  ),

  findById: publicProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) =>
      ctx.prisma.lobby.findUniqueOrThrow({
        where: {
          id: input,
        },
      })
    ),

  findByIdAndAuthorize: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        playerId: z.string().optional(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.lobby.findFirstOrThrow({
        where: {
          id: input.id,
          playerIds: {
            has: input.playerId,
          },
        },
      })
    ),

  updateOneOnLobbyJoin: publicProcedure
    .input(
      z.object({
        id: z.string(),
        playerId: z.string(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.lobby.update({
        where: {
          id: input.id,
        },
        data: {
          playerIds: {
            push: input.playerId,
          },
          playerCount: {
            increment: 1,
          },
        },
      })
    ),
});
