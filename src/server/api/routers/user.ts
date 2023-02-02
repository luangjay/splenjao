import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  findById: publicProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input)
        return ctx.prisma.user.findUnique({
          where: {
            id: input,
          },
        });
    }),
});
