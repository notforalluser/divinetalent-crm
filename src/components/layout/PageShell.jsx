import Topbar from "./Topbar";

export default function PageShell({ title, searchPlaceholder, onSearch, children }) {
  return (
    <>
      <Topbar title={title} searchPlaceholder={searchPlaceholder} onSearch={onSearch} />
      <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
    </>
  );
}
