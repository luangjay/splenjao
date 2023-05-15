import { ReactNode } from "react";
import { Player } from "@prisma/client";
import Image from "next/image";
import Head from "next/head";

interface LayoutProps {
  player: Player;
  children?: ReactNode;
}

export default function Layout({ player, children }: LayoutProps) {
  if (!player)
    return (
      <Head>
        <title>Splenjao</title>
        <meta name="description" content="Splenjao" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    );
  return (
    <>
      <Head>
        <title>Splenjao</title>
        <meta name="description" content="Splenjao" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col bg-gray-100 text-slate-600">
        <div className="fixed top-0 z-10 h-[120px] w-full overflow-hidden p-6 px-[120px] backdrop-blur-md">
          <div className="flex h-full items-center justify-between">
            <div className="flex gap-2">
              <div className="font-mono text-3xl font-bold">SPLENJAO</div>
              <div>beta</div>
            </div>
            <div className="flex h-full items-center gap-4">
              <div className="aspect-square h-[84%]">
                <Image
                  alt=""
                  src={player.image || ""}
                  width={256}
                  height={256}
                  className="aspect-square h-full rounded-full object-cover drop-shadow"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div>Logged in as</div>
                <div className="w-[120px] truncate text-lg font-semibold">
                  {player.name}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center overflow-auto">
          {children}
        </div>
      </div>
    </>
  );
}
