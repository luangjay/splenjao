export default function Error500() {
  return (
    <div className="flex h-screen items-center justify-center gap-4 bg-gray-100 text-2xl text-slate-600">
      <div className="font-medium">500</div>
      <div className="h-[40px] w-[2px] bg-slate-600"></div>
      <div>Internal server error.</div>
    </div>
  );
}
