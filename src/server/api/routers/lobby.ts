import { Lobby } from "@prisma/client";
import { z } from "zod";
import { shuffle } from "../../../common/constants";

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
const allTokens = (playerCount: number) => {
  switch (playerCount) {
    case 2:
      return { white: 4, blue: 4, green: 4, red: 4, black: 4, gold: 5 };
    case 3:
      return { white: 5, blue: 5, green: 5, red: 5, black: 5, gold: 5 };
    default:
      return { white: 7, blue: 7, green: 7, red: 7, black: 7, gold: 5 };
  }
};

const newResource = (playerCount: number) => ({
  cardsLv1: shuffle(0, 40),
  cardsLv2: shuffle(40, 70),
  cardsLv3: shuffle(70, 90),
  tiles: shuffle(0, 10).slice(0, playerCount + 1),
  tokens: { ...allTokens(playerCount) },
});

const newInventory = () => ({
  cards: Array<number>(),
  reserves: Array<number>(),
  tiles: Array<number>(),
  tokens: { ...tokens },
  discount: { ...price },
  score: 0,
});

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

  findPlayer: protectedProcedure.input(z.string()).query(({ ctx, input }) =>
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
          status: "starting",
          turnIdx: -1,
          resource: newResource(input.playerCount),
          inventory0: newInventory(),
          inventory1: newInventory(),
          inventory2: newInventory(),
          inventory3: newInventory(),
        },
      })
    ),

  leaveLobby: protectedProcedure
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
      if (input.playerId === lobby.hostId) {
        await ctx.prisma.lobby.update({
          where: {
            id: input.id,
          },
          data: {
            playerIds: [...lobby.playerIds].slice(0, lobby.playerCount - 1),
            playerCount: {
              decrement: 1,
            },
          },
        });
        return ctx.prisma.player.update({
          where: {
            id: input.playerId,
          },
          data: {
            lobbyId: null,
          },
        });
      }
    }),

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

  clearLobby: protectedProcedure
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
