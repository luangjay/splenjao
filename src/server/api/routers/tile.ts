import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const tileRouter = createTRPCRouter({
  findById: publicProcedure.input(z.number()).query(({ ctx, input }) =>
    ctx.prisma.tile.findUniqueOrThrow({
      where: {
        id: input,
      },
    })
  ),
});
