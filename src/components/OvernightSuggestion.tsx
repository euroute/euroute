import { useState } from "react";
import { Check, ChevronDown, Loader2, MoonStar, TriangleAlert } from "lucide-react";

import { JourneyCard } from "@/components/JourneyCard";
import { StationField } from "@/components/StationField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { formatClock, formatDuration, type Place } from "@/lib/journey";
import {
  displayOvernightBenefits,
  displayOvernightWarnings,
  elapsedTradeoff,
  stationNightReason,
} from "@/lib/overnight-copy";
import { cityName, overnightMode, type OvernightPlan } from "@/lib/overnight";
import { optionalStopPlace } from "@/lib/overnight-optional";
import {
  journeyArrivalZone,
  journeyDepartureZone,
  zoneForPlace,
} from "@/lib/station-timezone";
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
 * Phase D: summary first, details second. One block per travel day plus the
 * night between them, so the traveller can answer "where do I sleep, when do I
 * arrive, when do I leave, how long is each day" without opening anything.
 */
function PlanOverview({ plan }: { plan: OvernightPlan }) {
  const { t } = useI18n();

  return (
    <div className="mt-4">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {t("on.summaryTitle")}
      </p>
      <div className="mt-2 space-y-3">
        {plan.dayStats.map((day, index) => {
          const stay = plan.stays[index];
          const journey = plan.days[index];
          // Each travel day starts and ends at its own station, in its own zone.
          const dayDepZone = journey ? journeyDepartureZone(journey) : undefined;
          const dayArrZone = journey ? journeyArrivalZone(journey) : undefined;
          return (
            <div key={`${plan.id}-day-${day.day}`} className="space-y-3">
              <div className="rounded-xl border border-border bg-background px-4 py-3">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t("on.dayHeading", { n: day.day })}
                </p>
                <p className="mt-1 font-medium break-words">
                  {t("on.dayRoute", { from: cityName(day.fromName), to: cityName(day.toName) })}
                </p>
                <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-sm text-muted-foreground">
                  <span className="clock">
                    {t("on.dayTimes", {
                      dep: formatClock(day.departure, dayDepZone),
                      arr: formatClock(day.arrival, dayArrZone),
                    })}
                  </span>
                  <span>{formatDuration(day.windowMinutes)}</span>
                  {day.trainMinutes < day.windowMinutes - 15 ? (
                    <span>{t("on.trainTime", { time: formatDuration(day.trainMinutes) })}</span>
                  ) : null}
                </p>
              </div>

              {stay ? (
                <div className="rounded-xl border border-primary/40 bg-primary/5 px-4 py-3">
                  <p className="flex items-center gap-2 font-medium break-words">
                    <MoonStar aria-hidden="true" className="size-4 shrink-0 text-primary" />
                    {t("on.nightIn", { city: cityName(stay.station) })}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("on.nightTimes", {
                      arr: formatClock(stay.arrival, zoneForPlace(stay.place)),
                      dep: formatClock(stay.departure, zoneForPlace(stay.place)),
                    })}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {t("on.nightDuration", {
                      time: formatDuration(stay.waitMinutes),
                      city: cityName(stay.station),
                    })}
                    {stay.nights > 1 ? ` · ${t("on.nights", { n: stay.nights })}` : ""}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
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

/**
 * Phase C/D: optional stopovers. Deliberately restrained and never labelled as
 * a recommendation – these make the journey longer and only exist as a
 * traveller preference. Choosing one reuses the requested-stop flow.
 */
function OptionalSplits({
  candidates,
  onChoose,
}: {
  candidates: NonNullable<OvernightResult["optional"]>;
  onChoose: (place: Place) => void;
}) {
  const { t } = useI18n();
  if (candidates.length === 0) return null;

  return (
    <div className="mt-4 border-t border-border/70 pt-4">
      <h4 className="text-sm font-medium">{t("on.optional.title")}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{t("on.optional.intro")}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {candidates.map(({ plan }) => {
          const stay = plan.stays[0];
          if (!stay) return null;
          const city = cityName(stay.station);
          const day1 = plan.dayStats[0];
          const day2 = plan.dayStats[plan.dayStats.length - 1];
          const rows: { label: string; value: string }[] = [];
          if (day1)
            rows.push({
              label: t("on.dayHeading", { n: 1 }),
              value: formatDuration(day1.windowMinutes),
            });
          rows.push({ label: t("on.nightShort"), value: formatDuration(stay.waitMinutes) });
          if (day2)
            rows.push({
              label: t("on.dayHeading", { n: 2 }),
              value: formatDuration(day2.windowMinutes),
            });
          return (
            <div key={plan.id} className="rounded-xl border border-border bg-background px-4 py-3">
              <p className="font-medium break-words">{city}</p>
              <dl className="mt-2 space-y-1 text-sm">
                {rows.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd className="clock tabular-nums">{row.value}</dd>
                  </div>
                ))}
              </dl>
              {plan.addedElapsedMinutes > 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("on.optional.extra", {
                    time: formatDuration(plan.addedElapsedMinutes),
                  })}
                </p>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                className="mt-3 w-full sm:w-auto"
                onClick={() => onChoose(optionalStopPlace(stay))}
              >
                {t("on.optional.cta", { city })}
              </Button>
            </div>
          );
        })}
      </div>
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
        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        {t("on.loading")}
      </div>
    );
  }

  if (!result?.considered) return null;

  // Model 2: a requested split lives on its own result field. Requested wins
  // over recommended for presentation, because the traveller asked for it.
  const plans = [
    result.requested ?? result.recommended,
    ...result.alternatives,
  ].filter(Boolean) as OvernightPlan[];
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
        <Button
          size="sm"
          variant="ghost"
          aria-expanded={false}
          onClick={() => setChooserOpen(true)}
        >
          {t("on.chooseTitle")}
        </Button>
      )}
    </div>
  );

  // A viability rejection is not an availability failure: the journey exists,
  // it just doesn't make a good two-day split. Say why, in plain language, and
  // keep the next useful action within reach.
  if (result.requestedRejection) {
    const rejection = result.requestedRejection;
    const stopName = cityName(rejection.station || result.requestedStopUnavailable || "");
    return (
      <section
        aria-labelledby="overnight-rejected"
        className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5"
      >
        <h3 id="overnight-rejected" className="flex items-start gap-2 text-sm font-medium">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
          {t("on.rejected.title", { city: stopName })}
        </h3>
        {rejection.reasons.length > 0 ? (
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {rejection.reasons.map((code) => (
              <li key={code}>{t(`on.rejected.${code}`)}</li>
            ))}
          </ul>
        ) : null}
        {!chooserOpen ? (
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            aria-expanded={false}
            onClick={() => setChooserOpen(true)}
          >
            {t("on.chooseAnother")}
          </Button>
        ) : null}
        {chooser}
      </section>
    );
  }

  // Route construction failed before viability could even be judged. This says
  // nothing about the city as an overnight stop.
  if (result.requestedStopUnavailable) {
    return (
      <section className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
        <p className="flex items-start gap-2 text-sm">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
          {t("on.unavailableBuild", { city: cityName(result.requestedStopUnavailable) })}
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
        <OptionalSplits candidates={result.optional ?? []} onChoose={onRequestStop} />
        {chooser}
      </section>
    );
  }

  const firstStay = active.stays[0];
  if (!firstStay) return null;

  const city = cityName(firstStay.station);
  const isRequested = overnightMode(active) === "requested";
  // Recommendation emphasis is reserved for plans Euroute actually recommends.
  const strong = !isRequested && active.confidence === "strong";
  const reason = stationNightReason(active);
  const benefits = displayOvernightBenefits(active);
  const warnings = displayOvernightWarnings(active);
  const tradeoff = elapsedTradeoff(active);
  const alternativePlans = plans.filter((plan) => plan.id !== active.id);

  if (dismissed) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-3">
        <Button variant="ghost" size="sm" onClick={() => setDismissed(false)}>
          {t("on.stay", { city })}
        </Button>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="overnight-heading"
      className={`overflow-hidden rounded-xl border bg-card shadow-sm ${
        strong ? "border-primary/60 ring-1 ring-primary/20" : "border-border"
      }`}
    >
      <div className="px-4 py-4 sm:px-5">
        <Badge
          variant={strong ? "default" : "secondary"}
          className="gap-1 tracking-wide uppercase"
        >
          <MoonStar aria-hidden="true" className="size-3.5" />
          {t(isRequested ? "on.titleRequested" : "on.title")}
        </Badge>

        <h3 id="overnight-heading" className="mt-2 text-xl font-semibold break-words sm:text-2xl">
          {t("on.stay", { city })}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          {t(isRequested ? "on.requestedIntro" : "on.intro", { city })}
        </p>

        {/* The time cost of stopping, always visible – never a timestamp puzzle. */}
        <p className="mt-2 text-sm font-medium">{t(tradeoff.key, tradeoff.vars)}</p>

        <PlanOverview plan={active} />

        {benefits.length > 0 ? (
          <div className="mt-4">
            <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("on.benefitsTitle")}
            </h4>
            <ul className="mt-2 space-y-1 text-sm">
              {benefits.map((benefit, index) => (
                <li key={`${benefit.key}-${index}`} className="flex items-start gap-2">
                  <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-rail" />
                  <span>{t(benefit.key, benefit.vars)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {warnings.length > 0 ? (
          <div className="mt-4">
            <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("on.warningsTitle")}
            </h4>
            <ul className="mt-2 space-y-1 text-sm">
              {warnings.map((warning, index) => (
                <li key={`${warning.key}-${index}`} className="flex items-start gap-2">
                  <TriangleAlert
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-accent"
                  />
                  <span>{t(warning.key, warning.vars)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 rounded-xl bg-secondary/30 px-4 py-3">
          <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {/* Requested stops were the traveller's own decision, so this block
                is labelled neutrally instead of as Euroute's rationale. */}
            {isRequested ? t("on.aboutPlan") : t("on.whyCity", { city })}
          </h4>
          {reason ? (
            <>
              <p className="mt-1 text-sm">{t(reason.primary.key, reason.primary.vars)}</p>
              {reason.secondary && !isRequested ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(reason.secondary.key, reason.secondary.vars)}
                </p>
              ) : null}
            </>
          ) : (
            <p className="mt-1 text-sm">{t(active.reason.key, active.reason.vars)}</p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5"
            aria-expanded={open}
            aria-controls="overnight-details"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? t("on.hideDetails") : t("on.showDetails")}
            <ChevronDown
              aria-hidden="true"
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </Button>
          {renderAction ? renderAction(active) : null}
          <Button size="sm" variant="outline" onClick={() => setDismissed(true)}>
            {t("on.continue")}
          </Button>
        </div>

        {alternativePlans.length > 0 ? (
          <div className="mt-4">
            <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("on.chooseTitle")}
            </h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {alternativePlans.map((plan) => {
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
      </div>

      {open ? (
        <div
          id="overnight-details"
          className="border-t border-border/70 bg-secondary/20 p-3 sm:p-4"
        >
          <PlanDetails plan={active} minTransferMinutes={minTransferMinutes} />
        </div>
      ) : null}
    </section>
  );
}
