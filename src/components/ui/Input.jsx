import { Search } from "lucide-react";

function cx(...args) {
  return args.filter(Boolean).join(" ");
}

export const FIELD_BASE =
  "w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate " +
  "focus:outline-none focus:ring-2 focus:ring-crimson-500/40 focus:border-crimson-500 transition-colors";

export function Input({ className = "", ...rest }) {
  return <input className={cx(FIELD_BASE, className)} {...rest} />;
}

export function SearchInput({ className = "", ...rest }) {
  return (
    <div className={cx("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
      <input className={cx(FIELD_BASE, "pl-9")} {...rest} />
    </div>
  );
}

export function Select({ className = "", children, ...rest }) {
  return (
    <select className={cx(FIELD_BASE, "pr-8 appearance-none bg-no-repeat", className)} {...rest}>
      {children}
    </select>
  );
}
