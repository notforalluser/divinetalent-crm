import { Outlet } from "react-router-dom";
import { RefreshCw, TriangleAlert } from "lucide-react";
import Sidebar from "./Sidebar";
import PageSkeleton from "./PageSkeleton";
import Button from "../ui/Button";
import { useData } from "../../context/DataContext";

export default function DashboardLayout() {
  const { status, error, refresh } = useData();

  return (
    <div className="flex h-screen w-full bg-cloud overflow-hidden">
      <Sidebar />
      {status === "loading" ? (
        <PageSkeleton />
      ) : status === "error" ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-sm text-center">
            <TriangleAlert className="h-8 w-8 text-crimson-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-ink mb-1">Couldn't load the workbook</p>
            <p className="text-xs text-slate mb-4">{error}</p>
            <Button variant="dark" size="sm" icon={RefreshCw} onClick={refresh}>
              Try again
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          <Outlet />
        </div>
      )}
    </div>
  );
}
