import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const homeRouter = createTRPCRouter({
  findUserById: publicProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input)
        return ctx.prisma.user.findUniqueOrThrow({
          where: {
            id: input,
          },
        });
    }),

  upsertPlayer: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.player.upsert({
        where: {
          id: input.id,
        },
        update: {
          name: input.name,
          image: input.image,
        },
        create: {
          id: input.id,
          name: input.name,
          image: input.image,
          gameCount: 0,
          gameIds: Array<string>(),
          lobbyId: null,
          lastPlayed: null,
        },
      })
    ),
});
