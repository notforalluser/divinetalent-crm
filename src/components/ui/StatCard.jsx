import { Heading, Text } from "./Typography";
import { Card } from "./Card";

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
  compact = false,
  className = "",
}) {
  return (
    <Card
      className={[
        "group relative overflow-hidden transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-crimson-500/10",
        compact ? "p-3" : "p-5",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-crimson-50/0 to-crimson-50/0 group-hover:from-crimson-50/60 group-hover:to-transparent transition-colors duration-200" />

      <div className="relative flex items-start justify-between">
        <Text
          variant="eyebrow"
          color="muted"
          className={compact ? "text-[9px] tracking-wide leading-tight" : undefined}
        >
          {label}
        </Text>
        {Icon && (
          <span
            className={[
              "flex items-center justify-center rounded-lg transition-colors duration-200 shrink-0",
              compact ? "h-6 w-6" : "h-8 w-8",
              accent
                ? "bg-crimson-50 text-crimson-600 group-hover:bg-crimson-100"
                : "bg-cloud text-slate group-hover:bg-crimson-50 group-hover:text-crimson-500",
            ].join(" ")}
          >
            <Icon className={compact ? "h-3 w-3" : "h-4 w-4"} />
          </span>
        )}
      </div>

      <Heading
        variant="stat"
        color={accent ? "accent" : "primary"}
        className="relative mt-1.5"
        style={compact ? { fontSize: "1.25rem", lineHeight: "1.5rem" } : undefined}
      >
        {value}
      </Heading>

      {sub && (
        <Text variant="small" color="muted" className={`relative mt-0.5 ${compact ? "text-[10px]" : ""}`}>
          {sub}
        </Text>
      )}
    </Card>
  );
}