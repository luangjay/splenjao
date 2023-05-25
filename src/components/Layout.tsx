import { ReactNode, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import Link from "next/link";

interface LayoutProps {
  header?: boolean;
  children?: ReactNode;
}

export default function Layout({ header = true, children }: LayoutProps) {
  const session = useSession();
  const router = useRouter();
  const { data: player, isFetched: playerFetched } =
    api.game.findPlayerById.useQuery(session.data?.user.id, { retry: false });
  const [navOpen, setNavOpen] = useState(false);
  const pagename =
    router.pathname === "/"
      ? "Home"
      : router.pathname === "/about"
      ? "About"
      : router.pathname === "/lobby/[id]"
      ? "Lobby"
      : router.pathname === "/game/[id]"
      ? "Game"
      : "Page";

  return (
    <>
      <Head>
        <title>Splenjao</title>
        <meta name="description" content="Splenjao" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen select-none flex-col bg-gray-100 text-slate-600">
        {header && (
          <div className="fixed top-0 z-10 h-[96px] w-full overflow-hidden py-4 px-[96px] backdrop-blur-md lg:h-[120px] lg:px-[120px] lg:py-6">
            <div className="flex h-full items-center justify-between drop-shadow">
              <Link href="/" className="flex gap-2">
                <div className="font-mono text-2xl font-bold lg:text-3xl">
                  SPLENJAO
                </div>
                <div className="relative top-0 text-[13px] lg:text-base">
                  beta
                </div>
              </Link>
              <div className="flex h-full items-center gap-4">
                {player && (
                  <div className="aspect-square h-[80%]">
                    <Image
                      alt=""
                      src={player.image || ""}
                      width={256}
                      height={256}
                      className="aspect-square h-full rounded-full object-cover drop-shadow"
                    />
                  </div>
                )}
                {!playerFetched ? (
                  <></>
                ) : player ? (
                  <div className="flex max-w-[140px] flex-col gap-1 text-[13px] lg:text-base">
                    <div>Logged in as</div>
                    <div className="truncate text-base font-semibold lg:text-xl">
                      {player.name}
                    </div>
                  </div>
                ) : (
                  <div className="flex max-w-[140px] flex-col gap-1 text-[13px] lg:text-base">
                    Not logged in
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {header && (
          <div className="fixed bottom-0 z-20 flex w-full items-center justify-center">
            <button
              className="absolute flex w-[72px] justify-center rounded-[8px_8px_0_0] bg-gray-200/[.5] drop-shadow backdrop-blur transition-all duration-150 hover:bg-gray-200/[.25]"
              style={{ bottom: !navOpen ? 0 : "200px" }}
              onClick={() => setNavOpen((prev) => !prev)}
            >
              {!navOpen ? <UpIcon /> : <DownIcon />}
            </button>
            <div
              className="fixed bottom-0 z-20 flex w-[342px] flex-col items-center justify-between overflow-hidden rounded-[12px_12px_0_0] bg-gray-200/[.5] text-xl drop-shadow backdrop-blur transition-all"
              style={{ height: !navOpen ? 0 : "200px" }}
            >
              <div className="flex h-full flex-col items-center justify-between p-6">
                <div className="font-medium drop-shadow">{pagename}</div>
                <button
                  className="w-[112px] rounded-lg bg-slate-600 p-1.5 text-lg font-medium text-slate-100 drop-shadow-sm hover:bg-slate-700 disabled:bg-gray-400"
                  disabled={pagename === "About"}
                  onClick={() => {
                    const newTab = window.open("/about", "_blank");
                    newTab?.focus();
                  }}
                >
                  About
                </button>
                <button
                  className="w-[112px] rounded-lg bg-slate-600 p-1.5 text-lg font-medium text-slate-100 drop-shadow-sm hover:bg-slate-700"
                  onClick={
                    session.data
                      ? () => void signOut({ callbackUrl: "/" })
                      : () => void signIn()
                  }
                >
                  {session.data ? "Logout" : "Login"}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className={header ? "h-screen" : ""}>{children}</div>
      </div>
    </>
  );
}

const UpIcon = () => {
  return (
    <svg fill="currentColor" viewBox="0 0 16 16" height="36px" width="36px">
      <path
        fillRule="evenodd"
        d="M7.646 4.646a.5.5 0 01.708 0l6 6a.5.5 0 01-.708.708L8 5.707l-5.646 5.647a.5.5 0 01-.708-.708l6-6z"
      />
    </svg>
  );
};

const DownIcon = () => {
  return (
    <svg fill="currentColor" viewBox="0 0 16 16" height="36px" width="36px">
      <path
        fillRule="evenodd"
        d="M1.646 4.646a.5.5 0 01.708 0L8 10.293l5.646-5.647a.5.5 0 01.708.708l-6 6a.5.5 0 01-.708 0l-6-6a.5.5 0 010-.708z"
      />
    </svg>
  );
};
