import { Lobby, Status, Turn, Action } from "@prisma/client";
import { z } from "zod";
import { shuffle } from "../../../common/functions";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

const addSeconds = (date: Date, seconds: number) => {
  date.setSeconds(date.getSeconds() + seconds);
  return date;
};

const price = {
  white: 0,
  blue: 0,
  green: 0,
  red: 0,
  black: 0,
};
const tokenList = {
  white: 0,
  blue: 0,
  green: 0,
  red: 0,
  black: 0,
  gold: 0,
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

  createGame: protectedProcedure
    .input(
      z.object({
        hostId: z.string(),
        playerCount: z.number(),
        playerIds: z.array(z.string()),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.game.create({
        data: {
          hostId: input.hostId,
          playerCount: input.playerCount,
          playerIds: input.playerIds,
          shuffle: {
            card1_ids: shuffle(0, 40),
            card2_ids: shuffle(40, 70),
            card3_ids: shuffle(70, 90),
            tile_ids: shuffle(0, 10),
          },
          status: "initial" as Status,
          turn: {
            playerIdx: -1,
            startTime: new Date(),
          },
          endTurn: {
            playerIdx: -1,
            startTime: addSeconds(new Date(), 22),
          },
          nextTurn: {
            playerIdx: 0,
            startTime: addSeconds(new Date(), 32),
          },
          action: {
            endTurn: false,
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
          tokenList: { white: 7, blue: 7, green: 7, red: 7, black: 7, gold: 5 },
          playerScore: {
            i0: 0,
            i1: 0,
            i2: 0,
            i3: 0,
          },
          playerDiscount: {
            i0: { ...price },
            i1: { ...price },
            i2: { ...price },
            i3: { ...price },
          },
          playerCard: {
            i0: Array<number>(),
            i1: Array<number>(),
            i2: Array<number>(),
            i3: Array<number>(),
          },
          playerReserve: {
            i0: Array<number>(),
            i1: Array<number>(),
            i2: Array<number>(),
            i3: Array<number>(),
          },
          playerTile: {
            i0: Array<number>(),
            i1: Array<number>(),
            i2: Array<number>(),
            i3: Array<number>(),
          },
          playerToken: {
            i0: { ...tokenList },
            i1: { ...tokenList },
            i2: { ...tokenList },
            i3: { ...tokenList },
          },
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
