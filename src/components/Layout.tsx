import { ReactNode } from "react";
import Image from "next/image";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { api } from "../utils/api";
import Link from "next/link";

interface LayoutProps {
  header?: boolean;
  children?: ReactNode;
}

export default function Layout({ header = true, children }: LayoutProps) {
  const session = useSession();
  const { data: player } = api.game.findPlayerById.useQuery(
    session.data?.user.id
  );

  return (
    <>
      <Head>
        <title>Splenjao</title>
        <meta name="description" content="Splenjao" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen select-none flex-col bg-gray-100 text-slate-600">
        {header && (
          <div className="fixed top-0 z-10 h-[120px] w-full overflow-hidden p-6 px-[120px] backdrop-blur-md">
            <div className="flex h-full items-center justify-between drop-shadow">
              <Link href="/" className="flex gap-2">
                <div className="font-mono text-3xl font-bold">SPLENJAO</div>
                <div className="relative top-0">beta</div>
              </Link>
              {player && (
                <div className="flex h-full items-center gap-4">
                  <div className="aspect-square h-[80%]">
                    <Image
                      alt=""
                      src={player.image || ""}
                      width={256}
                      height={256}
                      className="aspect-square h-full rounded-full object-cover drop-shadow"
                    />
                  </div>
                  <div className="flex max-w-[140px] flex-col gap-1">
                    <div>Logged in as</div>
                    <div className="truncate text-xl font-semibold">
                      {player.name}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className={header ? "h-screen px-[120px]" : ""}>{children}</div>
      </div>
    </>
  );
}
