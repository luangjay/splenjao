import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import Title from "../components/Title";

export default function Home() {
  const session = useSession();
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const { data: player } = api.game.findPlayerById.useQuery(
    session.data?.user.id
  );

  const [page, setPage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY <= 60) {
        setPage(0);
      } else if (window.scrollY >= window.innerHeight - 120) {
        setPage(1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Layout>
      {/* <main className="flex min-h-screen flex-col items-center justify-center"> */}
      <main className="absolute left-0 flex h-full w-full flex-col items-center justify-center text-2xl">
        <Title size={4}>SPLENJAO</Title>
        <div className="mb-8 drop-shadow">
          A web-based game inspired by{" "}
          <Link
            href="https://en.wikipedia.org/wiki/Splendor_(game)"
            rel="noopener noreferrer"
            target="_blank"
            className="text-pink-400 underline"
          >
            Splendor
          </Link>
          .
        </div>
        <Link
          href="https://github.com/luangjay/splenjao"
          target="_blank"
          className="flex items-center rounded-lg bg-gray-50 p-2 shadow"
        >
          <GitHubIcon />
          <div className="ml-2 text-xl font-semibold drop-shadow-sm">
            luangjay<span className="font-normal text-pink-400">/splenjao</span>
          </div>
        </Link>
      </main>
      <div className="relative top-[100vh] flex min-h-full w-full flex-col items-center justify-center gap-6 px-[120px] py-16">
        <div className="flex w-full flex-col items-center justify-center gap-12 px-4">
          <h1 className="text-4xl font-extrabold leading-none tracking-tight drop-shadow sm:text-[4rem]">
            Create <span className="text-pink-500">T3</span> App
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-gray-50 p-4 shadow"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">
                First Steps <span className="max-lg:hidden">→</span>
              </h3>
              <div className="text-lg">
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-gray-50 p-4 shadow"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold drop-shadow-sm">
                Documentation <span className="max-lg:hidden">→</span>
              </h3>
              <div className="text-lg drop-shadow-sm">
                Learn more about Create T3 App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2 drop-shadow">
            <p className="text-xl">
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
            </p>
            <AuthShowcase />
          </div>
        </div>
      </div>
      <div className="fixed top-0 right-[48px] flex h-screen flex-col justify-center gap-4 lg:right-[60px]">
        <button
          className={`h-4 w-4 rounded-full shadow-lg ${
            page === 0 ? "bg-pink-300" : "bg-slate-300"
          }`}
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        ></button>
        <button
          className={`h-4 w-4 rounded-full shadow-lg ${
            page === 1 ? "bg-pink-300" : "bg-slate-300"
          }`}
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight - 30,
              behavior: "smooth",
            });
          }}
        ></button>
      </div>
    </Layout>
  );
}

function AuthShowcase() {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  const user = api.home.findUserById.useQuery(sessionData?.user.id);
  const upsertPlayer = api.home.upsertPlayer.useMutation();

  const [isUpsertDone, setUpsertDone] = useState(false);

  useEffect(() => {
    if (!isUpsertDone && user.data) {
      const playerData = {
        id: user.data.id,
        name: user.data.name,
        image: user.data.image,
      };
      upsertPlayer.mutate(playerData);
      setUpsertDone(true);
    }
  }, [user.data]);

  return (
    <p className="text-center text-xl">
      {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      {secretMessage && <span> - {secretMessage}</span>}
    </p>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 1024 1024"
      fill="currentColor"
      height="40px"
      width="40px"
      // className="fill-pink-300"
    >
      <path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z" />
    </svg>
  );
}
