import { GameStatus } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

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

  createGame: protectedProcedure
    .input(
      z.object({
        hostId: z.string(),
        playerCount: z.number(),
        playerIds: z.array(z.string()),
        shuffle: z.object({
          lv1_ids: z.array(z.number().min(0).max(39)),
          lv2_ids: z.array(z.number().min(40).max(69)),
          lv3_ids: z.array(z.number().min(70).max(89)),
          noble_ids: z.array(z.number().min(0).max(9)),
        }),
        status: z.nativeEnum(GameStatus),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.game.create({
        data: {
          hostId: input.hostId,
          playerCount: input.playerCount,
          playerIds: input.playerIds,
          shuffle: input.shuffle,
          status: input.status,
        },
      })
    ),

  updatePlayers: protectedProcedure
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
            // push: input.gameId,
          },
        },
      });
    }),

  clearThisLobby: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) => {
      ctx.prisma.lobby.update({
        where: {
          id: input,
        },
        data: {
          playerCount: 0,
          playerIds: Array<string>(),
          hostId: null,
        },
      });
    }),
});
