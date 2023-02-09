import { z } from "zod";
import {
  ActionType,
  Card,
  Color,
  Game,
  Shuffle,
  Status,
  TokenList,
} from "@prisma/client";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { IdxKey, TokenColor } from "../../../common/types";

const addSeconds = (date: Date, seconds: number) => {
  date.setSeconds(date.getSeconds() + seconds);
  return date;
};

// const drawCards = (cardIds: Array<number>, cardId: number) => {
//   let result = [...cardIds]
//   if (result.length > 5) {
//     const drawIdx = result.indexOf(cardId);
//     const drawCardId = result.splice(5, 1)[0] as number;
//     result.splice(drawIdx, 1, drawCardId);
//   } else {
//     const drawIdx = result.indexOf(cardId);
//     result.splice(drawIdx, 1);
//   }
//   return result
// };

const drawCards = (shuffle: Shuffle, cardId: number | null) => {
  if (cardId === null) return { ...shuffle };
  let name;
  let result;
  if (0 <= cardId && cardId < 40) {
    name = "card1_ids";
    result = [...shuffle.card1_ids];
  } else if (40 <= cardId && cardId < 70) {
    name = "card2_ids";
    result = [...shuffle.card2_ids];
  } else if (70 <= cardId && cardId < 90) {
    name = "card3_ids";
    result = [...shuffle.card3_ids];
  } else {
    return { ...shuffle };
  }
  if (result.length > 5) {
    const drawIdx = result.indexOf(cardId);
    const drawCardId = result.splice(5, 1)[0] as number;
    result.splice(drawIdx, 1, drawCardId);
  } else {
    const drawIdx = result.indexOf(cardId);
    result.splice(drawIdx, 1);
  }
  return {
    ...shuffle,
    [name]: result,
  };
};

const opTokenCount = (
  op: "increment" | "decrement",
  tokenList1: TokenList,
  tokenList2?: TokenList
) => {
  const result = { ...tokenList1 };
  (Object.keys(result) as TokenColor[]).forEach((color) => {
    result[color] =
      op === "increment"
        ? tokenList1[color] + (tokenList2 ? tokenList2[color] : 1)
        : tokenList1[color] - (tokenList2 ? tokenList2[color] : 1);
  });
  return result;
};

export const gamexRouter = createTRPCRouter({
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
      ctx.prisma.game.findFirstOrThrow({
        where: {
          id: input.id,
          playerIds: {
            has: input.playerId,
          },
        },
      })
    ),

  findPlayerById: publicProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) =>
      ctx.prisma.player.findUniqueOrThrow({
        where: {
          id: input,
        },
      })
    ),

  updatePlayerLastPlayed: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) =>
      ctx.prisma.player.update({
        where: {
          id: input,
        },
        data: {
          lastPlayed: new Date(),
        },
      })
    ),

  updateEndTurn: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        playerId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game: Game = await ctx.prisma.game.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
      if (input.playerId !== game.hostId) return;
      const card: Card | null = await ctx.prisma.card.findUnique({
        where: {
          id: game.action.cardId,
        },
      });
      return ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          action: {
            endTurn: true,
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
          nextTurn: {
            playerIdx: (game.nextTurn.playerIdx + 1) % game.playerCount,
            startTime: addSeconds(new Date(), 10),
          },
          tokenList:
            card && game.action.type === "purchase"
              ? {
                  update: {
                    white: {
                      increment: Math.max(
                        card.price.white -
                          game.playerDiscount[
                            `i${game.turn.playerIdx}` as IdxKey
                          ].white,
                        0
                      ),
                    },
                    blue: {
                      increment: Math.max(
                        card.price.blue -
                          game.playerDiscount[
                            `i${game.turn.playerIdx}` as IdxKey
                          ].blue,
                        0
                      ),
                    },
                    green: {
                      increment: Math.max(
                        card.price.green -
                          game.playerDiscount[
                            `i${game.turn.playerIdx}` as IdxKey
                          ].green,
                        0
                      ),
                    },
                    red: {
                      increment: Math.max(
                        card.price.red -
                          game.playerDiscount[
                            `i${game.turn.playerIdx}` as IdxKey
                          ].red,
                        0
                      ),
                    },
                    black: {
                      increment: Math.max(
                        card.price.black -
                          game.playerDiscount[
                            `i${game.turn.playerIdx}` as IdxKey
                          ].black,
                        0
                      ),
                    },
                  },
                }
              : undefined,
          playerCard:
            game.turn.playerIdx !== 1 && game.action.cardId !== -1
              ? {
                  update: {
                    [`i${game.turn.playerIdx}`]: { push: game.action.cardId },
                  },
                }
              : undefined,
          playerToken:
            game.turn.playerIdx !== -1 //&&
              ? // (game.action.type === "takeTwo" || game.action.type === "takeThree")
                {
                  update: {
                    [`i${game.turn.playerIdx}`]: {
                      update: {
                        white: { increment: game.action.tokenList.white },
                        blue: { increment: game.action.tokenList.blue },
                        green: { increment: game.action.tokenList.green },
                        red: { increment: game.action.tokenList.red },
                        black: { increment: game.action.tokenList.black },
                        gold: { increment: game.action.tokenList.gold },
                      },
                    },
                  },
                }
              : card && game.action.type === "purchase"
              ? {
                  update: {
                    [`i${game.turn.playerIdx}`]: {
                      update: {
                        white: {
                          decrement: Math.max(
                            card.price.white -
                              game.playerDiscount[
                                `i${game.turn.playerIdx}` as IdxKey
                              ].white,
                            0
                          ),
                        },
                        blue: {
                          decrement: Math.max(
                            card.price.blue -
                              game.playerDiscount[
                                `i${game.turn.playerIdx}` as IdxKey
                              ].blue,
                            0
                          ),
                        },
                        green: {
                          decrement: Math.max(
                            card.price.green -
                              game.playerDiscount[
                                `i${game.turn.playerIdx}` as IdxKey
                              ].green,
                            0
                          ),
                        },
                        red: {
                          decrement: Math.max(
                            card.price.red -
                              game.playerDiscount[
                                `i${game.turn.playerIdx}` as IdxKey
                              ].red,
                            0
                          ),
                        },
                        black: {
                          decrement: Math.max(
                            card.price.black -
                              game.playerDiscount[
                                `i${game.turn.playerIdx}` as IdxKey
                              ].black,
                            0
                          ),
                        },
                      },
                    },
                  },
                }
              : undefined,
          playerScore: card
            ? {
                update: {
                  [`i${game.turn.playerIdx}`]: {
                    increment: card.score,
                  },
                },
              }
            : undefined,
          playerDiscount: card
            ? {
                update: {
                  [`i${game.turn.playerIdx}`]: {
                    update: {
                      [card.color]: {
                        increment: 1,
                      },
                    },
                  },
                },
              }
            : undefined,
          shuffle: drawCards(game.shuffle, game.action.cardId),
        },
      });
    }),

  updateNextTurn: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        playerId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const game: Game = await ctx.prisma.game.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      });
      if (input.playerId !== game.hostId) return;
      const card: Card | null = await ctx.prisma.card.findUnique({
        where: {
          id: game.action.cardId,
        },
      });
      return ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          turn: {
            playerIdx: game.nextTurn.playerIdx,
            // startTime: game.nextTurn.startTime,
            startTime: new Date(),
          },
          endTurn: {
            playerIdx: game.nextTurn.playerIdx,
            startTime: addSeconds(new Date(), 20),
          },
          // nextTurn: {
          //   playerIdx: (game.nextTurn.playerIdx + 1) % game.playerCount,
          //   startTime: addSeconds(new Date(), 32),
          // },
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
          tokenList:
            game.action.tokenList && game.turn.playerIdx >= 0
              ? {
                  update: {
                    white: { increment: game.action.tokenList.white },
                    blue: { increment: game.action.tokenList.blue },
                    green: { increment: game.action.tokenList.green },
                    red: { increment: game.action.tokenList.red },
                    black: { increment: game.action.tokenList.black },
                    gold: { increment: game.action.tokenList.gold },
                  },
                }
              : undefined,
          playerCard:
            game.action.cardId !== -1 && game.turn.playerIdx >= 0
              ? {
                  update: {
                    [`i${game.turn.playerIdx}`]: { push: game.action.cardId },
                  },
                }
              : undefined,
          playerScore: card
            ? {
                update: {
                  [`i${game.turn.playerIdx}`]: {
                    increment: card.score,
                  },
                },
              }
            : undefined,
          playerDiscount: card
            ? {
                update: {
                  [`i${game.turn.playerIdx}`]: {
                    update: {
                      [card.color]: {
                        increment: 1,
                      },
                    },
                  },
                },
              }
            : undefined,
          shuffle: drawCards(game.shuffle, game.action.cardId),
        },
      });
    }),

  updateServerState: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        playerIdx: z.number(),
        isEndTurn: z.boolean(),
        state: z.object({
          effect: z.string().nullable(),
          actionType: z.nativeEnum(ActionType).nullable(),
          tokenColor: z.string().nullable().optional(),
          cardId: z.number().min(-1).max(89).optional(),
        }),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.game.update({
        where: {
          id: input.id,
        },
        data: {
          action: {
            update: {
              type: input.state.actionType,
              tokenList: input.state.tokenColor
                ? {
                    update: {
                      [input.state.tokenColor]: {
                        increment:
                          input.state.effect === "take"
                            ? 1
                            : input.state.effect === "return"
                            ? -1
                            : 0,
                      },
                    },
                  }
                : undefined,
              cardId: input.state.cardId,
            },
          },
          playerToken:
            input.state.tokenColor && input.isEndTurn
              ? {
                  update: {
                    [`i${input.playerIdx}`]: {
                      update: {
                        [input.state.tokenColor]: {
                          increment:
                            input.state.effect === "take"
                              ? -1
                              : input.state.effect === "return"
                              ? 1
                              : 0,
                        },
                      },
                    },
                  },
                }
              : undefined,
          tokenList:
            input.state.tokenColor && !input.isEndTurn
              ? {
                  update: {
                    [input.state.tokenColor]: {
                      increment:
                        input.state.effect === "take"
                          ? -1
                          : input.state.effect === "return"
                          ? 1
                          : 0,
                    },
                  },
                }
              : undefined,
        },
      })
    ),
});
