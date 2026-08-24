import { useState } from "react";
import { Check, ChevronDown, Loader2, MoonStar, TriangleAlert } from "lucide-react";

import { JourneyCard } from "@/components/JourneyCard";
import { StationField } from "@/components/StationField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { formatClock, formatDuration, type Place } from "@/lib/journey";
import { cityName, type OvernightPlan } from "@/lib/overnight";
import type { OvernightResult } from "@/lib/overnight.server";

type Props = {
  result: OvernightResult | null;
  loading: boolean;
  minTransferMinutes: number;
  requestedStop: Place | null;
  onRequestStop: (place: Place | null) => void;
  /** Save action for the currently shown multi-day plan. */
  renderAction?: ((plan: OvernightPlan) => React.ReactNode) | undefined;
};

/**
 * Collapsed overview of the multi-day plan: one line per travel day plus the
 * overnight block. Individual legs stay behind "Visa detaljer".
 */
function PlanOverview({ plan }: { plan: OvernightPlan }) {
  const { t } = useI18n();

  return (
    <div className="mt-4 space-y-3">
      {plan.dayStats.map((day, index) => {
        const stay = plan.stays[index];
        return (
          <div key={`${plan.id}-day-${day.day}`} className="space-y-3">
            <div className="rounded-xl border border-border bg-background px-4 py-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {t("on.dayHeading", { n: day.day })}
              </p>
              <p className="mt-1 font-medium">
                {t("on.dayRoute", { from: cityName(day.fromName), to: cityName(day.toName) })}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t("on.dayTimes", {
                  dep: formatClock(day.departure),
                  arr: formatClock(day.arrival),
                })}{" "}
                · {formatDuration(day.windowMinutes)}
                {day.trainMinutes < day.windowMinutes - 15
                  ? ` · ${t("on.trainTime", { time: formatDuration(day.trainMinutes) })}`
                  : ""}
              </p>
            </div>

            {stay ? (
              <div className="rounded-xl border border-primary/40 bg-primary/5 px-4 py-3">
                <p className="flex items-center gap-2 font-medium">
                  <MoonStar className="size-4 text-primary" />
                  {t("on.nightIn", { city: cityName(stay.station) })}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("on.nightArrival", { time: formatClock(stay.arrival) })} ·{" "}
                  {t("on.nightDeparture", { time: formatClock(stay.departure) })} ·{" "}
                  {t("on.betweenTrains", { time: formatDuration(stay.waitMinutes) })}
                  {stay.nights > 1 ? ` · ${t("on.nights", { n: stay.nights })}` : ""}
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** Full timelines, revealed on demand. Station names stay intact here. */
function PlanDetails({
  plan,
  minTransferMinutes,
}: {
  plan: OvernightPlan;
  minTransferMinutes: number;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      {plan.days.map((day, index) => (
        <div key={day.id} className="space-y-2">
          <Badge variant="secondary" className="tracking-wide uppercase">
            {t("on.dayHeading", { n: index + 1 })}
          </Badge>
          <JourneyCard journey={day} minTransferMinutes={minTransferMinutes} />
        </div>
      ))}
    </div>
  );
}

export function OvernightSuggestion({
  result,
  loading,
  minTransferMinutes,
  requestedStop,
  onRequestStop,
  renderAction,
}: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [draftStop, setDraftStop] = useState<Place | null>(requestedStop);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {t("on.loading")}
      </div>
    );
  }

  if (!result?.considered) return null;

  const plans = [result.recommended, ...result.alternatives].filter(Boolean) as OvernightPlan[];
  const active = plans.find((p) => p.id === activePlanId) ?? plans[0] ?? null;

  const chooser = (
    <div className="mt-4 border-t border-border/70 pt-4">
      {chooserOpen ? (
        <div className="space-y-3">
          <StationField
            id="overnight-stop"
            label={t("on.chooseTitle")}
            value={draftStop}
            onChange={setDraftStop}
          />
          <p className="text-xs text-muted-foreground">{t("on.chooseHint")}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={!draftStop} onClick={() => onRequestStop(draftStop)}>
              {t("on.chooseSubmit")}
            </Button>
            {requestedStop ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraftStop(null);
                  onRequestStop(null);
                }}
              >
                {t("on.chooseClear")}
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setChooserOpen(true)}>
          {t("on.chooseTitle")}
        </Button>
      )}
    </div>
  );

  if (result.requestedStopUnavailable) {
    return (
      <section className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
        <p className="flex items-start gap-2 text-sm">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-accent" />
          {t("on.unavailable", { city: cityName(result.requestedStopUnavailable) })}
        </p>
        {chooser}
      </section>
    );
  }

  // No plan made the journey meaningfully better – say so instead of
  // presenting a mediocre split as an improvement.
  if (!active) {
    return (
      <section className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
        <p className="text-sm text-muted-foreground">{t("on.noneFound")}</p>
        {result.maxHoursPerDay && !result.maxPerDayAchievable ? (
          <p className="mt-2 text-sm">
            {t("on.limitMissed", { h: result.maxHoursPerDay })}{" "}
            {result.closestLongestDayMinutes
              ? t("on.limitClosest", {
                  time: formatDuration(result.closestLongestDayMinutes),
                })
              : ""}
          </p>
        ) : null}
        {chooser}
      </section>
    );
  }

  const city = cityName(active.stays[0]!.station);
  const strong = active.confidence === "strong";

  if (dismissed) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-3">
        <Button variant="ghost" size="sm" onClick={() => setDismissed(false)}>
          {strong ? t("on.stay", { city }) : t("on.headingAlt", { city })}
        </Button>
      </div>
    );
  }

  return (
    <section
      className={`overflow-hidden rounded-xl border bg-card shadow-sm ${
        strong ? "border-primary/60 ring-1 ring-primary/20" : "border-border"
      }`}
    >
      <div className="px-4 py-4 sm:px-5">
        <Badge variant={strong ? "default" : "secondary"} className="gap-1 tracking-wide uppercase">
          <MoonStar className="size-3.5" />
          {strong ? t("on.title") : t("on.badgeAlt")}
        </Badge>

        <h3 className="mt-2 text-xl font-semibold sm:text-2xl">
          {strong ? t("on.stay", { city }) : t("on.headingAlt", { city })}
        </h3>

        {!strong && active.tradeoff ? (
          <p className="mt-1 text-sm">{t(active.tradeoff.key, active.tradeoff.vars)}</p>
        ) : null}

        <PlanOverview plan={active} />

        {active.benefits.length > 0 || active.warnings.length > 0 ? (
          <ul className="mt-4 space-y-1 text-sm">
            {active.benefits.slice(0, 3).map((benefit, index) => (
              <li key={`${benefit.key}-${index}`} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-rail" />
                <span>{t(benefit.key, benefit.vars)}</span>
              </li>
            ))}
            {active.warnings.slice(0, 3).map((warning, index) => (
              <li key={`${warning.key}-${index}`} className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{t(warning.key, warning.vars)}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 rounded-xl bg-secondary/30 px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("on.whyCity", { city })}
          </p>
          <p className="mt-1 text-sm">{t(active.reason.key, active.reason.vars)}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => setOpen((v) => !v)}>
            {open ? t("on.hideDetails") : t("on.showDetails")}
            <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
            {t("on.continue")}
          </Button>
          {renderAction ? renderAction(active) : null}
        </div>

        {plans.length > 1 ? (
          <div className="mt-4">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("on.others")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {plans.map((plan) => {
                const label = plan.stays.map((s) => cityName(s.station)).join(" + ");
                const isActive = plan.id === active.id;
                return (
                  <Button
                    key={plan.id}
                    size="sm"
                    variant={isActive ? "secondary" : "outline"}
                    aria-pressed={isActive}
                    onClick={() => {
                      setActivePlanId(plan.id);
                      setOpen(false);
                    }}
                  >
                    {t("on.otherOption", { city: label })} ·{" "}
                    {plan.dayStats.map((d) => formatDuration(d.windowMinutes)).join(" + ")}
                  </Button>
                );
              })}
            </div>
          </div>
        ) : null}

        {chooser}
      </div>

      {open ? (
        <div className="border-t border-border/70 bg-secondary/20 p-3 sm:p-4">
          <PlanDetails plan={active} minTransferMinutes={minTransferMinutes} />
        </div>
      ) : null}
    </section>
  );
}
