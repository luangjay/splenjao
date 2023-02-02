import { z } from "zod";
import { GameStatus } from "@prisma/client";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const gameRouter = createTRPCRouter({
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

  createOne: publicProcedure
    .input(
      z.object({
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
          playerCount: input.playerCount,
          playerIds: input.playerIds,
          shuffle: input.shuffle,
          status: input.status,
        },
      })
    ),
});
