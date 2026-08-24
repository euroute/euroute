import { ArrowUpRight, Check, MoonStar, Train } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { formatClock, formatDay, formatDuration } from "@/lib/journey";
import { trackBookingClick } from "@/lib/trips.functions";
import type { TripPlan, TripSegment } from "@/lib/trip-plan";
import { stationLabel } from "@/lib/station-name";
import { cn } from "@/lib/utils";

type Props = {
  tripId: string | null;
  plan: TripPlan;
  /** segmentKey → booked */
  booked: Record<string, boolean>;
  onToggle?: ((segment: TripSegment, next: boolean) => void) | undefined;
  pending?: boolean | undefined;
};

/**
 * "Boka resan": one row per bookable segment, in travel order, with the
 * operator that actually sells the ticket and a done-marker per segment.
 */
export function BookingChecklist({ tripId, plan, booked, onToggle, pending }: Props) {
  const { lang, t } = useI18n();

  function track(segment: TripSegment, target: string) {
    void trackBookingClick({
      data: {
        tripId,
        segmentKey: segment.key,
        operator: segment.operator,
        fromName: segment.fromName,
        toName: segment.toName,
        departAt: segment.departure,
        target,
        travelStyle: plan.style,
        isOvernight: plan.isOvernight,
      },
    }).catch(() => undefined);
  }

  const segments = plan.days.flatMap((day) => day.segments);
  const doneCount = segments.filter((segment) => booked[segment.key]).length;

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{t("book.title")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("book.lead")}</p>
        </div>
        <Badge variant={doneCount === segments.length ? "default" : "secondary"}>
          {doneCount === segments.length && segments.length > 0
            ? t("book.allMarked")
            : t("book.progress", { done: doneCount, total: segments.length })}
        </Badge>
      </header>

      <div className="mt-4 space-y-5">
        {plan.days.map((day, dayIndex) => {
          const stay = plan.stays[dayIndex];
          return (
            <div key={`book-day-${day.day}`} className="space-y-3">
              {plan.days.length > 1 ? (
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t("book.dayHeading", {
                    n: day.day,
                    date: formatDay(day.departure, lang),
                  })}
                </p>
              ) : null}

              {day.segments.map((segment) => {
                const isBooked = Boolean(booked[segment.key]);
                return (
                  <div
                    key={segment.key}
                    className={cn(
                      "rounded-xl border px-4 py-3",
                      isBooked ? "border-primary/50 bg-primary/5" : "border-border bg-background",
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-medium">
                          <Train className="size-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">
                            {stationLabel(segment.fromName)}{" "}
                            <span className="text-muted-foreground">→</span>{" "}
                            {stationLabel(segment.toName)}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatClock(segment.departure)} – {formatClock(segment.arrival)} ·{" "}
                          {formatDuration(segment.durationMinutes)}
                          {segment.operator ? ` · ${segment.operator}` : ""}
                        </p>
                        {segment.legCount > 1 ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {t("book.legsInside", { n: segment.legCount })}
                          </p>
                        ) : null}
                      </div>

                      {onToggle ? (
                        <Button
                          variant={isBooked ? "outline" : "ghost"}
                          size="sm"
                          className="gap-1.5"
                          disabled={pending}
                          onClick={() => onToggle(segment, !isBooked)}
                        >
                          <Check className="size-4" />
                          {isBooked ? t("book.bookedMark") : t("book.markBooked")}
                        </Button>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild size="sm" className="gap-1.5">
                        <a
                          href={segment.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => track(segment, "planner")}
                        >
                          {t("book.openTimes")}
                          <ArrowUpRight className="size-4" />
                        </a>
                      </Button>
                      {segment.operatorUrl && segment.operatorLabel ? (
                        <Button asChild size="sm" variant="outline" className="gap-1.5">
                          <a
                            href={segment.operatorUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => track(segment, "operator")}
                          >
                            {t("book.atOperator", { operator: segment.operatorLabel })}
                            <ArrowUpRight className="size-4" />
                          </a>
                        </Button>
                      ) : null}
                      <Button asChild size="sm" variant="ghost" className="gap-1.5">
                        <a
                          href={segment.retailerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => track(segment, "retailer")}
                        >
                          Trainline
                          <ArrowUpRight className="size-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}

              {stay ? (
                <p className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-4 py-2.5 text-sm">
                  <MoonStar className="size-4 text-primary" />
                  {t("book.nightIn", {
                    city: stay.city,
                    arr: formatClock(stay.arrival),
                    dep: formatClock(stay.departure),
                  })}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">{t("book.disclaimer")}</p>
    </section>
  );
}
