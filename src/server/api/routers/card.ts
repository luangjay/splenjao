import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const cardRouter = createTRPCRouter({
  findAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.card.findMany();
  }),

  findById: publicProcedure.input(z.number()).query(({ ctx, input }) =>
    ctx.prisma.card.findUniqueOrThrow({
      where: {
        id: input,
      },
    })
  ),
});
