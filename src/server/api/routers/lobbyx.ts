import { Lobby, Status, Turn } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

const addSeconds = (date: Date, seconds: number) => {
  date.setSeconds(date.getSeconds() + seconds);
  return date;
};

export const lobbyxRouter = createTRPCRouter({
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
      ctx.prisma.lobby.findFirstOrThrow({
        where: {
          id: input.id,
          playerIds: {
            has: input.playerId,
          },
        },
      })
    ),

  findPlayerGames: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) =>
      ctx.prisma.player
        .findUnique({
          where: {
            id: input,
          },
        })
        .games()
    ),

  createGame: protectedProcedure
    .input(
      z.object({
        hostId: z.string(),
        playerCount: z.number(),
        playerIds: z.array(z.string()),
        shuffle: z.object({
          cardLv1_ids: z.array(z.number().min(0).max(39)),
          cardLv2_ids: z.array(z.number().min(40).max(69)),
          cardLv3_ids: z.array(z.number().min(70).max(89)),
          tile_ids: z.array(z.number().min(0).max(9)),
        }),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.game.create({
        data: {
          hostId: input.hostId,
          playerCount: input.playerCount,
          playerIds: input.playerIds,
          shuffle: input.shuffle,
          status: "initial" as Status,
          currentTurn: {
            playerIdx: -1,
            startTime: new Date(),
          },
          nextTurn: {
            playerIdx: 0,
            startTime: addSeconds(new Date(), 30),
          },
          scores: Array.from({ length: input.playerCount }, () => 0),
          playerCards: {
            idx0_cardIds: Array<number>(),
            idx1_cardIds: Array<number>(),
            idx2_cardIds: Array<number>(),
            idx3_cardIds: Array<number>(),
          },
          playerTiles: {
            idx0_tileIds: Array<number>(),
            idx1_tileIds: Array<number>(),
            idx2_tileIds: Array<number>(),
            idx3_tileIds: Array<number>(),
          },
          playerTokens: Array.from({ length: input.playerCount }, () => ({
            white: 0,
            blue: 0,
            green: 0,
            red: 0,
            black: 0,
            gold: 0,
          })),
        },
      })
    ),

  /**
   * Returns the average of two numbers.
   *
   * @param x - The first input number
   * @param y - The second input number
   * @returns The arithmetic mean of `x` and `y`
   */
  updatePlayers: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
        playerId: z.string(),
        lobbyId: z.string(),
        gameId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lobby: Lobby = await ctx.prisma.lobby.findUniqueOrThrow({
        where: {
          id: input.lobbyId,
        },
      });
      if (input.playerId === lobby.hostId)
        return ctx.prisma.player.updateMany({
          where: {
            id: {
              in: input.ids,
            },
          },
          data: {
            lobbyId: null,
            gameCount: {
              increment: 1,
            },
            gameIds: {
              push: input.gameId,
            },
          },
        });
    }),

  clearThisLobby: protectedProcedure
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
      if (input.playerId === lobby.hostId)
        return ctx.prisma.lobby.update({
          where: {
            id: input.id,
          },
          data: {
            playerCount: 0,
            playerIds: Array<string>(),
            hostId: null,
          },
        });
    }),
});
