import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const playRouter = createTRPCRouter({
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
  findPlayerById: publicProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input)
        return ctx.prisma.player.findUniqueOrThrow({
          where: {
            id: input,
          },
        });
    }),

  createLobby: protectedProcedure.input(z.string()).mutation(({ ctx, input }) =>
    ctx.prisma.lobby.create({
      data: {
        hostId: null,
        playerCount: 0,
        playerIds: Array<string>(),
      },
    })
  ),

  findLobby: protectedProcedure.query(
    async ({ ctx }) =>
      await ctx.prisma.lobby.findFirstOrThrow({
        where: {
          playerCount: 0,
        },
      })
  ),

  findLobbyById: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) =>
      ctx.prisma.lobby.findUniqueOrThrow({
        where: {
          id: input,
        },
      })
    ),

  updateLobby: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        playerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lobby = await ctx.prisma.lobby.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
      if (lobby.playerCount >= 4) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Lobby full, max 4 players",
        });
      }
      return ctx.prisma.lobby.update({
        where: {
          id: input.id,
        },
        data: {
          hostId: lobby.playerCount == 0 ? input.playerId : undefined,
          playerIds: {
            push: input.playerId,
          },
          playerCount: {
            increment: 1,
          },
        },
      });
    }),

  updatePlayer: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        lobbyId: z.string(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.player.update({
        where: {
          id: input.id,
        },
        data: {
          lobbyId: input.lobbyId,
        },
      })
    ),
});
