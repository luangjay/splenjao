import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const playerRouter = createTRPCRouter({
  createOne: publicProcedure
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
        update: {},
        create: {
          id: input.id,
          name: input.name,
          image: input.image,
          gameCount: 0,
          gameIds: Array<string>(),
          lobbyId: null,
        },
      })
    ),

  upsertOneOnLobbyJoin: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        lobbyId: z.string(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.player.upsert({
        where: {
          id: input.id,
        },
        update: {
          name: undefined,
          lobbyId: input.lobbyId,
        },
        create: {
          id: input.id,
          name: input.name,
          image: input.image,
          gameCount: 0,
          gameIds: Array<string>(),
          lobbyId: input.lobbyId,
        },
      })
    ),

  updateManyOnGameJoin: publicProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        gameId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      ctx.prisma.player.updateMany({
        where: {
          id: {
            in: input.ids,
          },
        },
        data: {
          gameIds: {
            push: input.gameId,
          },
        },
      });
    }),
});
