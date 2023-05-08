export default function LazyDevProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  children;

  return (
    <>
      <div className="sm:hidden">
        <div>Your screen size is currently not supported.</div>
        <div>THE DEV IS LAZY!</div>
      </div>
      <div className="max-sm:hidden">{children}</div>
    </>
  );
}
