import { Lobby } from "@prisma/client";
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

  // createLobby: protectedProcedure
  //   .input(z.string())
  //   .mutation(({ ctx, input }) => {
  //     // 10 retries for lobby code generation
  //     let code = -1;
  //     const lobbyNotFound = Array(10)
  //       .fill(0)
  //       .some(() => {
  //         code = Math.floor(100000 + Math.random() * 900000);
  //         const existingLobby = ctx.prisma.lobby.findFirst({
  //           where: {
  //             code,
  //           },
  //         });
  //         return existingLobby !== null;
  //       });
  //     if (!lobbyNotFound) return null;
  //     return ctx.prisma.lobby.create({
  //       data: {
  //         code,
  //         hostId: null,
  //         playerCount: 0,
  //         playerIds: Array<string>(),
  //       },
  //     });
  //   }),

  findEmptyLobbyAndUpdate: protectedProcedure.mutation(async ({ ctx }) => {
    const lobby: Lobby = await ctx.prisma.lobby.findFirstOrThrow({
      where: {
        playerCount: 0,
      },
    });
    let code = -1;
    // 10 retries for lobby code generation
    const lobbyNotFound = Array(10)
      .fill(0)
      .some(() => {
        code = Math.floor(100000 + Math.random() * 900000);
        const existingLobby = ctx.prisma.lobby.findFirst({
          where: {
            code,
          },
        });
        return existingLobby !== null;
      });
    if (!lobbyNotFound) return null;
    return ctx.prisma.lobby.update({
      where: {
        id: lobby.id,
      },
      data: {
        code,
      },
    });
  }),

  findPlayer: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) =>
      ctx.prisma.player.findUnique({
        where: {
          id: input,
        },
        include: {
          games: true,
          lobby: true,
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

  findLobbyByCode: protectedProcedure
    .input(z.number())
    .query(({ ctx, input }) =>
      ctx.prisma.lobby.findFirst({
        where: {
          code: input,
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
      const lobby: Lobby = await ctx.prisma.lobby.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
      if (lobby.playerCount >= 4) return null;
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
