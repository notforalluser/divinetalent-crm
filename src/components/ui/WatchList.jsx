import { Link } from "react-router-dom";
import { RefreshCw, Clock } from "lucide-react";
import { Card, CardHeader, CardBody } from "./Card";
import { Heading, Text } from "./Typography";
import Badge from "./Badge";
import { useData } from "../../context/DataContext";
import { nowIST } from "../../lib/time";

function lastInterviewDate(candidateName, interviews) {
  const rows = interviews.filter((i) => i.CandidateName === candidateName);
  if (rows.length === 0) return null;
  return rows.reduce((max, r) => {
    const d = new Date(r.InterviewDate);
    return !isNaN(d) && d > max ? d : max;
  }, new Date(0));
}

export default function WatchList({ limit = 6 }) {
  const { visible: data, refresh } = useData();
  const now = nowIST();

  const watchlist = data.Candidates.filter((c) => c.Status === "Active" || c.Status === "In Marketing")
    .map((c) => {
      const last = lastInterviewDate(c.Name, data.Interviews);
      const daysSince = last ? Math.round((now - last) / 86400000) : Infinity;
      return { ...c, daysSince };
    })
    .filter((c) => c.daysSince >= 10)
    .sort((a, b) => b.daysSince - a.daysSince)
    .slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <div>
          <Text variant="eyebrow" color="accent">
            Ongoing watch list
          </Text>
          <Heading variant="h4" className="mt-0.5">
            {watchlist.length} active
          </Heading>
        </div>
        <button onClick={refresh} className="text-slate hover:text-crimson-600">
          <RefreshCw className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardBody className="!p-0">
        <Text variant="small" color="muted" className="px-5 pt-3">
          Candidates with no interview in 10+ days.
        </Text>
        <div className="divide-y divide-line mt-2">
          {watchlist.length === 0 && (
            <Text variant="small" color="muted" className="px-5 py-6 text-center block">
              Everyone's on track.
            </Text>
          )}
          {watchlist.map((c) => (
            <Link
              key={c.CandidateID}
              to={`/candidates/${c.CandidateID}`}
              className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-cloud/60"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{c.Name}</p>
                <p className="text-xs text-slate truncate">{c.Recruiter}</p>
              </div>
              <div className="text-right shrink-0">
                <Badge tone={c.Status}>{c.Status}</Badge>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-slate justify-end">
                  <Clock className="h-3 w-3" /> {c.daysSince === Infinity ? "no interviews" : `${c.daysSince}d in mkt`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
