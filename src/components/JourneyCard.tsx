import { ArrowUpRight, Clock, MoonStar, Repeat, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConnectionBlock } from "@/components/ConnectionBadge";
import { bookingTargetForLeg, operatorTargetForLeg, retailerTargetForLeg } from "@/lib/operators";
import { useI18n } from "@/lib/i18n";
import { stationLabel } from "@/lib/station-name";
import { evaluateConnections, type Connection } from "@/lib/journey-intelligence";
import {
  dayOffset,
  formatClock,
  formatDay,
  formatDuration,
  modeLabel,
  transferMinutes,
  type Journey,
} from "@/lib/journey";

type Props = {
  journey: Journey;
  minTransferMinutes: number;
  /** Pre-evaluated connections; computed from the journey when omitted. */
  connections?: Connection[];
  highlight?: boolean;
  action?: React.ReactNode;
};

export function JourneyCard({
  journey,
  minTransferMinutes,
  connections,
  highlight,
  action,
}: Props) {
  const { lang, t } = useI18n();
  const transit = journey.legs.filter((leg) => leg.kind !== "walk");
  const gaps = transferMinutes(journey);
  const offset = dayOffset(journey.departure, journey.arrival);
  const tightIndex = gaps.findIndex((gap) => gap < minTransferMinutes);
  const evaluated = connections ?? evaluateConnections(journey, minTransferMinutes);

  return (
    <article
      className={
        "overflow-hidden rounded-xl border bg-card shadow-sm transition-colors " +
        (highlight ? "border-accent ring-1 ring-accent/50" : "border-border")
      }
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-secondary/40 px-4 py-3">
        <div className="flex items-baseline gap-3">
          <span className="clock text-2xl font-semibold">{formatClock(journey.departure)}</span>
          <span className="text-muted-foreground">→</span>
          <span className="clock text-2xl font-semibold">
            {formatClock(journey.arrival)}
            {offset > 0 ? <sup className="ml-0.5 text-xs">+{offset}d</sup> : null}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary" className="gap-1">
            <Clock className="size-3.5" />
            {formatDuration(journey.durationMinutes)}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Repeat className="size-3.5" />
            {journey.transfers === 0
              ? t("journey.direct")
              : t("journey.transfersN", { n: journey.transfers })}
          </Badge>
          {journey.hasNightLeg ? (
            <Badge className="gap-1 bg-primary text-primary-foreground">
              <MoonStar className="size-3.5" />
              {t("journey.night")}
            </Badge>
          ) : null}
        </div>
      </header>

      {tightIndex >= 0 ? (
        <p className="flex items-start gap-2 border-b border-border/70 bg-destructive/10 px-4 py-2 text-sm text-foreground">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
          {t("journey.tightTransfer", {
            min: gaps[tightIndex] ?? 0,
            station: stationLabel(transit[tightIndex]?.toName ?? ""),
          })}
        </p>
      ) : null}

      <div className="px-4 py-4">
        <p className="mb-3 text-xs tracking-wide text-muted-foreground uppercase">
          {formatDay(journey.departure, lang)}
        </p>
        <ol className="space-y-4">
          {transit.map((leg, index) => {
            const booking = bookingTargetForLeg(leg);
            const operatorTarget = operatorTargetForLeg(leg);
            const connection = index > 0 ? evaluated[index - 1] : undefined;
            return (
              <li key={`${leg.departure}-${leg.fromName}-${index}`}>
                {connection ? <ConnectionBlock connection={connection} /> : null}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center pt-1">
                    <span className="size-2.5 rounded-full bg-primary" />
                    <span className="my-1 w-0.5 flex-1 bg-rail" />
                    <span className="size-2.5 rounded-full border-2 border-primary bg-card" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium">
                        <span className="clock mr-2 text-sm">{formatClock(leg.departure)}</span>
                        {stationLabel(leg.fromName)}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(leg.durationMinutes)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {modeLabel(leg.mode, lang, leg.modeLabel)}
                      {leg.trainName ? ` ${leg.trainName}` : ""}
                      {leg.operator ? ` · ${leg.operator}` : ""}
                      {leg.headsign ? ` · ${t("journey.towards", { headsign: leg.headsign })}` : ""}
                    </p>
                    <p className="mt-1 font-medium">
                      <span className="clock mr-2 text-sm">{formatClock(leg.arrival)}</span>
                      {stationLabel(leg.toName)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="gap-1.5">
                        <a href={booking.url} target="_blank" rel="noopener noreferrer">
                          {t("journey.bookLeg")}
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      </Button>
                      {operatorTarget ? (
                        <a
                          href={operatorTarget.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                        >
                          {t("journey.bookWith", {
                            operator: operatorTarget.label || t("journey.operatorFallback"),
                          })}
                        </a>
                      ) : null}
                      <a
                        href={retailerTargetForLeg(leg).url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                      >
                        Trainline
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </article>
  );
}
