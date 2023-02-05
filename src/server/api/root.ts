import { createTRPCRouter } from "./trpc";
import { exampleRouter } from "./routers/example";
import { cardRouter } from "./routers/card";
import { gameRouter } from "./routers/game";
import { playerRouter } from "./routers/player";
import { userRouter } from "./routers/user";
import { lobbyRouter } from "./routers/lobby";
import { playRouter } from "./routers/play";
import { homeRouter } from "./routers/home";
import { lobbyxRouter } from "./routers/lobbyx";
import { gamexRouter } from "./routers/gamex";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  user: userRouter,
  home: homeRouter,
  play: playRouter,
  lobbyx: lobbyxRouter,
  gamex: gamexRouter,
  player: playerRouter,
  lobby: lobbyRouter,
  game: gameRouter,
  card: cardRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
