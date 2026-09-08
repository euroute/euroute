import { ArrowUpRight, Clock, MoonStar, Repeat, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConnectionBlock } from "@/components/ConnectionBadge";
import { bookingActionLabelKey, bookingPlanForLeg } from "@/lib/booking-actions";
import { useI18n } from "@/lib/i18n";
import { journeyHasNightTrain } from "@/lib/night-train";
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
import {
  journeyArrivalZone,
  journeyDepartureZone,
  legArrivalZone,
  legDepartureZone,
} from "@/lib/station-timezone";

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
  const depZone = journeyDepartureZone(journey);
  const arrZone = journeyArrivalZone(journey);
  const offset = dayOffset(journey.departure, journey.arrival, depZone, arrZone);
  const tightIndex = gaps.findIndex((gap) => gap < minTransferMinutes);
  const evaluated = connections ?? evaluateConnections(journey, minTransferMinutes);
  // Derived from the actual rail legs, so legacy snapshots with a stale
  // hasNightLeg flag do not keep an incorrect badge.
  const hasNightTrain = journeyHasNightTrain(journey);

  return (
    <article
      className={
        "overflow-hidden rounded-xl border bg-card shadow-sm transition-colors " +
        (highlight ? "border-accent ring-1 ring-accent/50" : "border-border")
      }
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-secondary/40 px-4 py-3">
        <div className="flex items-baseline gap-3">
          <span className="clock text-2xl font-semibold">{formatClock(journey.departure, depZone)}</span>
          <span className="text-muted-foreground">→</span>
          <span className="clock text-2xl font-semibold">
            {formatClock(journey.arrival, arrZone)}
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
          {hasNightTrain ? (
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
          {formatDay(journey.departure, lang, depZone)}
        </p>
        <ol className="space-y-4">
          {transit.map((leg, index) => {
            const plan = bookingPlanForLeg(leg);
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
                        <span className="clock mr-2 text-sm">{formatClock(leg.departure, legDepartureZone(leg))}</span>
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
                      <span className="clock mr-2 text-sm">{formatClock(leg.arrival, legArrivalZone(leg))}</span>
                      {stationLabel(leg.toName)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {plan.kind === "local" ? (
                        <p className="text-xs text-muted-foreground">{t("booking.local")}</p>
                      ) : plan.actions.length === 0 ? (
                        <p className="text-xs text-muted-foreground">{t("booking.none")}</p>
                      ) : (
                        plan.actions.map((action, actionIndex) => (
                          <Button
                            key={`${action.target}-${action.url}`}
                            asChild
                            variant={actionIndex === 0 ? "outline" : "ghost"}
                            size="sm"
                            className="gap-1.5"
                          >
                            <a href={action.url} target="_blank" rel="noopener noreferrer">
                              {t(bookingActionLabelKey(action), { operator: action.label })}
                              <ArrowUpRight className="size-3.5" />
                            </a>
                          </Button>
                        ))
                      )}
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
