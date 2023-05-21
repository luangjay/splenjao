import Layout from "../components/Layout";

export default function Error404() {
  return (
    <Layout header={false}>
      <div className="flex h-screen items-center justify-center gap-4 text-2xl">
        <div className="font-medium">404</div>
        <div className="h-[40px] w-[2px] bg-slate-600"></div>
        <div>This page could not be found.</div>
      </div>
    </Layout>
  );
}
