import { Lobby } from "@prisma/client";
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
const tokens = {
  white: 0,
  blue: 0,
  green: 0,
  red: 0,
  black: 0,
  gold: 0,
};
const allTokens = {
  white: 7,
  blue: 7,
  green: 7,
  red: 7,
  black: 7,
  gold: 5,
};

const newResource = () => ({
  cardsLv1: shuffle(0, 40),
  cardsLv2: shuffle(40, 70),
  cardsLv3: shuffle(70, 90),
  tiles: shuffle(0, 10),
  tokens: { ...allTokens },
});

const newInventory = () => ({
  cards: Array<number>(),
  reserves: Array<number>(),
  tiles: Array<number>(),
  tokens: { ...tokens },
  discount: { ...price },
});

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
          createdAt: new Date(),
          status: "created",
          turnIdx: -1,
          resource: newResource(),
          inventory0: newInventory(),
          inventory1: newInventory(),
          inventory2: newInventory(),
          inventory3: newInventory(),
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