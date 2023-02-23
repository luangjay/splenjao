import { createTRPCRouter } from "./trpc";
import { exampleRouter } from "./routers/example";
import { cardRouter } from "./routers/card";
import { playerRouter } from "./routers/player";
import { playRouter } from "./routers/play";
import { homeRouter } from "./routers/home";
import { lobbyRouter } from "./routers/lobby";
import { gameRouter } from "./routers/game";
import { tileRouter } from "./routers/tile";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  home: homeRouter,
  play: playRouter,
  lobby: lobbyRouter,
  game: gameRouter,
  player: playerRouter,
  card: cardRouter,
  tile: tileRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
