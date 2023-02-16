interface TokenIconProps {
  className?: string | undefined;
}

export default function TokenIcon({ className }: TokenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height="40px"
      width="40px"
      className={`drop-shadow-lg ${className || "fill-slate-50"}`}
    >
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-14.243L7.757 12 12 16.243 16.243 12 12 7.757z" />
    </svg>
  );
}
