import { useState } from "react";
import { Check, ChevronDown, Clock, Repeat, Star, TriangleAlert } from "lucide-react";

import { JourneyCard } from "@/components/JourneyCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { formatClock, formatDuration } from "@/lib/journey";
import { transitLegs, type JourneyOption } from "@/lib/journey-intelligence";

type Props = {
  option: JourneyOption;
  minTransferMinutes: number;
  action?: React.ReactNode | undefined;
  defaultOpen?: boolean | undefined;
};

function routeStations(journey: JourneyOption["journey"]): string[] {
  const transit = transitLegs(journey);
  const names = transit.map((leg) => leg.fromName);
  const last = transit[transit.length - 1];
  if (last) names.push(last.toName);
  return names.map((name) => name.split(",")[0]!.trim());
}

export function JourneyOptionCard({ option, minTransferMinutes, action, defaultOpen }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const { journey, facts, score, breakdown, highlights, category, reason, alsoFastest } = option;
  const isRecommended = category === "recommended";
  const stations = routeStations(journey);
  const warnings = highlights.filter((h) => h.tone === "warn");
  const goods = highlights.filter((h) => h.tone === "good");

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-sm",
        isRecommended ? "border-primary/60 ring-1 ring-primary/20" : "border-border",
      )}
    >
      <div className="px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          {category ? (
            <Badge
              variant={isRecommended ? "default" : "secondary"}
              className="gap-1 tracking-wide uppercase"
            >
              {isRecommended ? <Star className="size-3.5" /> : null}
              {t(`cat.${category}`)}
            </Badge>
          ) : null}
          {alsoFastest && !isRecommended && category !== "fastest" ? (
            <Badge variant="outline">{t("cat.alsoFastest")}</Badge>
          ) : null}
        </div>

        {/* Decision layer: where, how long, how many changes. */}
        <h3 className={cn("mt-2 font-semibold", isRecommended ? "text-xl sm:text-2xl" : "text-lg")}>
          {stations[0]} <span className="text-muted-foreground">→</span>{" "}
          {stations[stations.length - 1]}
        </h3>

        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="clock font-medium">
            {formatClock(journey.departure)} – {formatClock(journey.arrival)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-muted-foreground" />
            <span className="font-medium">{formatDuration(journey.durationMinutes)}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Repeat className="size-3.5 text-muted-foreground" />
            {journey.transfers === 0
              ? t("journey.direct")
              : t("journey.transfersN", { n: journey.transfers })}
          </span>
        </p>

        {reason ? (
          <p className={cn("mt-2 text-sm", isRecommended ? "" : "text-muted-foreground")}>
            {t(reason.key, reason.vars)}
          </p>
        ) : null}

        {/* Warning layer first, then the positives. */}
        {warnings.length > 0 ? (
          <ul className="mt-3 space-y-1 text-sm">
            {warnings.slice(0, 3).map((highlight, index) => (
              <li key={`${highlight.key}-${index}`} className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{t(highlight.key, highlight.vars)}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {goods.length > 0 ? (
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {goods.slice(0, isRecommended ? 3 : 2).map((highlight, index) => (
              <li key={`${highlight.key}-${index}`} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-rail" />
                <span>{t(highlight.key, highlight.vars)}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant={isRecommended ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            {open ? t("option.hide") : t("option.view")}
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </Button>

          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">
              {t("score.label")} {score}/100 · {t("score.why")}
            </summary>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
              {(
                [
                  ["score.time", breakdown.time, 30],
                  ["score.changes", breakdown.changes, 20],
                  ["score.connections", breakdown.connections, 25],
                  ["score.simplicity", breakdown.simplicity, 10],
                  ["score.dayComfort", breakdown.dayComfort, 10],
                  ["score.preferenceFit", breakdown.preferenceFit, 10],
                ] as const
              ).map(([key, value, max]) => (
                <div key={key} className="flex justify-between gap-2">
                  <dt>{t(key)}</dt>
                  <dd className="clock">
                    {value}/{max}
                  </dd>
                </div>
              ))}
              {breakdown.extreme < 0 ? (
                <div className="flex justify-between gap-2">
                  <dt>{t("score.extreme")}</dt>
                  <dd className="clock">{breakdown.extreme}</dd>
                </div>
              ) : null}
            </dl>
            <p className="mt-2">{t("score.note")}</p>
          </details>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/70 bg-secondary/20 p-3 sm:p-4">
          <JourneyCard
            journey={journey}
            minTransferMinutes={minTransferMinutes}
            connections={facts.connections}
            action={action}
          />
        </div>
      ) : null}
    </article>
  );
}
