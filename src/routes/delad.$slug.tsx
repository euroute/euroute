import { createFileRoute, Link } from "@tanstack/react-router";
import { MoonStar } from "lucide-react";

import { BookingChecklist } from "@/components/BookingChecklist";
import { JourneyCard } from "@/components/JourneyCard";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { formatClock, formatDay, formatDuration } from "@/lib/journey";
import { cityLabel } from "@/lib/station-name";
import { getSharedTrip } from "@/lib/trips.functions";
import type { TripPlan } from "@/lib/trip-plan";

export const Route = createFileRoute("/delad/$slug")({
  loader: ({ params }) => getSharedTrip({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const title = loaderData?.title
      ? `${loaderData.title} – delad reseplan | Euroute`
      : "Delad reseplan – Euroute";
    const description = loaderData
      ? `Tågresa ${loaderData.from_name} → ${loaderData.to_name} med alla etapper och bokningslänkar.`
      : "Den här reseplanen är inte längre delad.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
        // Delade länkar är privata kapabilitetslänkar – de ska aldrig indexeras.
        { name: "robots", content: "noindex, nofollow" },
      ],
    };
  },
  errorComponent: () => <Missing />,
  notFoundComponent: () => <Missing />,
  component: SharedTrip,
});

function Missing() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold">{t("shared.missingTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("shared.missingText")}</p>
        <Button asChild className="mt-6">
          <Link to="/">{t("trips.searchCta")}</Link>
        </Button>
      </main>
    </div>
  );
}

function SharedTrip() {
  const trip = Route.useLoaderData();
  const { lang, t } = useI18n();

  if (!trip) return <Missing />;

  const plan: TripPlan | null = trip.itinerary ?? null;
  const isPlan = Boolean(plan && Array.isArray(plan.days) && plan.days.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Badge variant="secondary">{t("shared.badge")}</Badge>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          {cityLabel(trip.from_name)} <span className="text-muted-foreground">→</span>{" "}
          {cityLabel(trip.to_name)}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {trip.depart_at ? formatDay(trip.depart_at, lang) : t("trips.noDate")}
          {trip.depart_at ? ` · ${formatClock(trip.depart_at)}` : ""}
          {isPlan && plan && plan.travelDays === 1
            ? ` · ${formatDuration(plan.durationMinutes)}`
            : ""}
          {isPlan && plan && plan.travelDays > 1
            ? ` · ${t("trip.daysN", { n: plan.travelDays })} · ${t("trip.trainTime", { duration: formatDuration(plan.durationMinutes) })}`
            : ""}
        </p>

        {isPlan && plan ? (
          <div className="mt-8 space-y-6">
            <BookingChecklist tripId={null} plan={plan} booked={{}} />

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">{t("trip.itinerary")}</h2>
              {plan.days.map((day, index) => {
                const stay = plan.stays[index];
                return (
                  <div key={`shared-day-${day.day}`} className="space-y-3">
                    {plan.days.length > 1 ? (
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {t("book.dayHeading", { n: day.day, date: formatDay(day.departure, lang) })}
                      </p>
                    ) : null}
                    <JourneyCard journey={day.journey} minTransferMinutes={plan.minTransferMinutes} />
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
            </section>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-secondary/40 p-6">
            <p className="font-medium">{t("trip.legacyTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("trip.legacyText")}</p>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <p className="font-medium">{t("shared.ctaTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("shared.ctaText")}</p>
          <Button asChild className="mt-4">
            <Link to="/">{t("trips.searchCta")}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
