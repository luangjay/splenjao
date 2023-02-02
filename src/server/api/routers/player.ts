import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const playerRouter = createTRPCRouter({
  createOne: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        image: z.string(),
        gameId: z.string(),
      })
    )
    .mutation(
      async ({ ctx, input }) =>
        await ctx.prisma.player.create({
          data: {
            id: input.id,
            name: input.name,
            image: input.image,
            gameIds: [input.gameId],
          },
        })
    ),

  upsertOne: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        gameId: z.string(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.player.upsert({
        where: {
          id: input.id,
        },
        update: {
          name: undefined,
          gameIds: {
            push: input.gameId,
          },
        },
        create: {
          id: input.id,
          name: input.name,
          image: input.image,
          gameIds: [input.gameId],
        },
      })
    ),
});
