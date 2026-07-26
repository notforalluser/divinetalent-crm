import { useMemo, useState } from "react";
import {
  Activity as ActivityIcon,
  User,
  Calendar,
  Clock,
  FileText,
  Users,
  Briefcase,
  UserCheck,
  Mail,
  Phone,
  Filter,
  ChevronRight
} from "lucide-react";
import PageShell from "../components/layout/PageShell";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Heading, Text } from "../components/ui/Typography";
import { Select } from "../components/ui/Input";
import DataTable from "../components/ui/DataTable";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import { useData } from "../context/DataContext";

export default function Activity() {
  const { visible: data } = useData();
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");

  const allActivities = data.Activity || [];

  // Get unique actions and entities for filters
  const actions = ["All", ...new Set(allActivities.map((a) => a.Action).filter(Boolean))];
  const entities = ["All", ...new Set(allActivities.map((a) => a.Entity).filter(Boolean))];

  const filteredRows = useMemo(() => {
    return allActivities
      .filter((a) => actionFilter === "All" || a.Action === actionFilter)
      .filter((a) => entityFilter === "All" || a.Entity === entityFilter)
      .sort((a, b) => new Date(b.Date) - new Date(a.Date));
  }, [allActivities, actionFilter, entityFilter]);

  // Stats
  const totalEvents = allActivities.length;
  const uniqueUsers = new Set(allActivities.map((a) => a.User)).size;
  const uniqueActions = new Set(allActivities.map((a) => a.Action)).size;
  const todayEvents = allActivities.filter((a) => {
    const today = new Date();
    const eventDate = new Date(a.Date);
    return eventDate.toDateString() === today.toDateString();
  }).length;

  const columns = [
    {
      key: "Date",
      label: "Date",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-slate" />
          <span className="text-sm">{new Date(r.Date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: "Time",
      label: "Time",
      render: (r) => {
        const date = new Date(r.Date);
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate" />
            <span className="text-sm">{date.toLocaleTimeString()}</span>
          </div>
        );
      },
    },
    {
      key: "User",
      label: "User",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-slate" />
          <span className="font-medium text-ink">{r.User}</span>
        </div>
      ),
    },
    {
      key: "Action",
      label: "Action",
      render: (r) => {
        const actionColors = {
          "Created": "emerald",
          "Updated": "blue",
          "Deleted": "crimson",
          "Viewed": "gray",
          "Applied": "purple",
          "Interview": "orange",
          "Hired": "green",
          "Rejected": "red",
        };
        const color = actionColors[r.Action] || "default";
        return <Badge tone={color}>{r.Action}</Badge>;
      },
    },
    {
      key: "Entity",
      label: "Entity",
      render: (r) => {
        const entityIcons = {
          "Candidate": Users,
          "Job": Briefcase,
          "Recruiter": UserCheck,
          "Interview": Calendar,
        };
        const Icon = entityIcons[r.Entity] || FileText;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-slate" />
            <span className="text-sm">{r.Entity}</span>
          </div>
        );
      },
    },
    { key: "Details", label: "Details", render: (r) => <span className="text-sm text-slate">{r.Details}</span> },
    {
      key: "_view",
      label: "",
      render: (r) => (
        <button className="text-slate hover:text-crimson-600 transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      ),
    },
  ];

  // Filter fields for the filter bar
  const filterFields = [
    { value: actionFilter, set: setActionFilter, options: actions, prefix: "Action" },
    { value: entityFilter, set: setEntityFilter, options: entities, prefix: "Entity" },
  ];

  function cx(...args) {
    return args.filter(Boolean).join(" ");
  }

  return (
    <PageShell title="Activity" searchPlaceholder="Search activity log..." onSearch={setQuery}>
      <div className="max-w-7xl mx-auto space-y-5 bg-white">
        {/* Heading */}
        <div className="relative overflow-hidden bg-gradient-to-r from-white via-white to-white px-6 py-6">
          <div className="pointer-events-none absolute bottom-0 left-1 h-24 w-20 rounded-full bg-crimson-600/30 blur-xl" />
          <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-20 rounded-full bg-crimson-600/60 blur-2xl" />
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="mt-1 flex items-center gap-2.5 text-2xl font-extrabold text-ink">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-crimson-600 shadow-sm ring-1 ring-crimson-700/30">
                  <ActivityIcon className="h-5 w-5 text-white" />
                </span>
                Activity Log
              </h2>
              <Text variant="body" color="muted" className="mt-1">
                Complete audit trail of all user actions across the platform
              </Text>
            </div>
            <div className="flex items-center gap-1.5 text-crimson-700 text-xs font-semibold bg-white/70 rounded-full px-3 py-1.5 ring-1 ring-crimson-200">
              <Clock className="h-3.5 w-3.5" />
              {totalEvents} events recorded
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="m-5 lg:m-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-line p-4 shadow-sm border-l-4 border-l-crimson-500">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="font-semibold text-slate">Total Events</Text>
                  <Text variant="stat" className="mt-1">{totalEvents.toLocaleString()}</Text>
                </div>
                <div className="p-2 rounded-lg bg-crimson-50">
                  <ActivityIcon className="h-5 w-5 text-crimson-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-line p-4 shadow-sm border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="font-semibold text-slate">Unique Users</Text>
                  <Text variant="stat" className="mt-1">{uniqueUsers}</Text>
                </div>
                <div className="p-2 rounded-lg bg-blue-50">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-line p-4 shadow-sm border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="font-semibold text-slate">Action Types</Text>
                  <Text variant="stat" className="mt-1">{uniqueActions}</Text>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50">
                  <FileText className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-line p-4 shadow-sm border-l-4 border-l-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="font-semibold text-slate">Today's Events</Text>
                  <Text variant="stat" className="mt-1">{todayEvents}</Text>
                </div>
                <div className="p-2 rounded-lg bg-orange-50">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Table with Filters */}
          <Card>
            <div className="flex items-center flex-nowrap gap-2 px-3 py-2.5 border-b border-line bg-gradient-to-r from-cloud/70 to-cloud/30 rounded-t-xl overflow-x-auto scrollbar-thin">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-slate shrink-0 pr-1">
                <Filter className="h-3.5 w-3.5" />
                Filters
              </span>
              {filterFields.map((f) => (
                <Select
                  key={f.prefix}
                  value={f.value}
                  title={`${f.prefix}: ${f.value}`}
                  onChange={(e) => f.set(e.target.value)}
                  className={cx(
                    "!py-1 !pl-2 !pr-5 !text-[10px] !rounded-full !border-line truncate",
                    "shrink-0 shadow-sm hover:shadow transition-shadow hover:border-crimson-300",
                    "hover:ring-2 hover:ring-crimson-500/20 focus:ring-2 focus:ring-crimson-500/30"
                  )}
                  style={{ width: 96 }}
                >
                  {f.options.map((s) => (
                    <option key={s} value={s}>
                      {f.prefix}: {s}
                    </option>
                  ))}
                </Select>
              ))}
              <div className="flex-1" />
              <Badge tone="default" className="shrink-0">
                {filteredRows.length} events
              </Badge>
            </div>
            <DataTable
              columns={columns}
              rows={filteredRows}
              searchTerm={query}
              emptyLabel="No activity recorded yet"
            />
          </Card>

          {/* Empty State Tip */}
          {totalEvents === 0 && (
            <Card className="bg-gradient-to-r from-cloud/50 to-cloud/30 border-dashed border-2 border-line">
              <CardBody className="text-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 rounded-full bg-crimson-50">
                    <ActivityIcon className="h-8 w-8 text-crimson-500" />
                  </div>
                  <Heading variant="h4" className="text-ink">No activity recorded</Heading>
                  <Text variant="body" color="muted" className="max-w-md">
                    Activity will appear here as users interact with the platform.
                  </Text>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
}