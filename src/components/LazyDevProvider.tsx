import Layout from "./Layout";

export default function LazyDevProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  children;

  return (
    <>
      <div className="md:hidden">
        <Layout header={false}>
          <div className="flex h-screen flex-col items-center justify-center text-center text-[12px]">
            <div>Your screen size is currently not supported.</div>
            <div>THE DEVELOPER IS LAZY!</div>
          </div>
        </Layout>
      </div>
      <div className="max-md:hidden">{children}</div>
    </>
  );
}
