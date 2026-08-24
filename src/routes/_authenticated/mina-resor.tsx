import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2, MoonStar, Share2 } from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listMyTrips } from "@/lib/trips.functions";
import { useI18n } from "@/lib/i18n";
import { formatClock, formatDay, formatDayRange, formatDuration } from "@/lib/journey";
import { cityLabel } from "@/lib/station-name";

export const Route = createFileRoute("/_authenticated/mina-resor")({
  head: () => ({
    meta: [
      { title: "Mina resor – Euroute" },
      { name: "description", content: "Dina sparade tågreseplaner genom Europa." },
      { property: "og:title", content: "Mina resor – Euroute" },
      { property: "og:description", content: "Alla dina sparade tågreseplaner på ett ställe." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MyTrips,
});

type Trip = Awaited<ReturnType<typeof listMyTrips>>[number];

function isUpcoming(trip: Trip): boolean {
  const reference = trip.arrive_at ?? trip.depart_at;
  if (!reference) return true;
  return new Date(reference).getTime() >= Date.now() - 6 * 3600_000;
}

function TripRow({ trip }: { trip: Trip }) {
  const { lang, t } = useI18n();
  const multiDay = trip.travel_days > 1;
  const nights = trip.overnight_cities.length;

  const when = trip.depart_at
    ? multiDay && trip.arrive_at
      ? formatDayRange(trip.depart_at, trip.arrive_at, lang)
      : `${formatDay(trip.depart_at, lang)} · ${formatClock(trip.depart_at)}${
          trip.arrive_at ? ` → ${formatClock(trip.arrive_at)}` : ""
        }${trip.duration_minutes ? ` · ${formatDuration(trip.duration_minutes)}` : ""}`
    : t("trips.noDate");

  return (
    <li className="rounded-xl border border-border bg-card px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-semibold">
            {cityLabel(trip.from_name)} <span className="text-muted-foreground">→</span>{" "}
            {cityLabel(trip.to_name)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{when}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {multiDay ? (
              <Badge variant="outline">{t("trip.daysN", { n: trip.travel_days })}</Badge>
            ) : null}
            <Badge variant="outline">{t("trip.changesN", { n: trip.changes })}</Badge>
            {multiDay && trip.duration_minutes ? (
              <Badge variant="outline">
                {t("trip.trainTime", { duration: formatDuration(trip.duration_minutes) })}
              </Badge>
            ) : null}
            {trip.is_overnight && nights ? (
              <Badge className="gap-1">
                <MoonStar className="size-3.5" />
                {trip.overnight_cities.map(cityLabel).join(", ")}
              </Badge>
            ) : null}
            {trip.bookedSegments > 0 ? (
              <Badge variant="secondary">
                {trip.bookedSegments === 1
                  ? t("trips.booked1")
                  : t("trips.bookedN", { n: trip.bookedSegments })}
              </Badge>
            ) : null}
            {trip.is_shared ? (
              <Badge variant="secondary" className="gap-1">
                <Share2 className="size-3.5" />
                {t("trips.shared")}
              </Badge>
            ) : null}
          </div>
        </div>


        <Button asChild size="sm" className="gap-1.5">
          <Link to="/resa/$id" params={{ id: trip.id }}>
            {t("trips.open")}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </li>
  );
}

function MyTrips() {
  const { t } = useI18n();
  const trips = useQuery({ queryKey: ["my-trips"], queryFn: () => listMyTrips() });

  const all = trips.data ?? [];
  const upcoming = all.filter(isUpcoming);
  const past = all.filter((trip) => !isUpcoming(trip)).reverse();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-semibold">{t("trips.h1")}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("trips.lead")}</p>

        {trips.isLoading ? (
          <div className="mt-8 flex items-center gap-3 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" /> {t("trips.loading")}
          </div>
        ) : all.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-secondary/40 p-6">
            <p className="font-medium">{t("trips.emptyTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("trips.emptyText")}</p>
            <Button asChild className="mt-4">
              <Link to="/">{t("trips.searchCta")}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {upcoming.length ? (
              <section>
                <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                  {t("trips.upcoming")}
                </h2>
                <ul className="mt-3 space-y-3">
                  {upcoming.map((trip) => (
                    <TripRow key={trip.id} trip={trip} />
                  ))}
                </ul>
              </section>
            ) : null}

            {past.length ? (
              <section>
                <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                  {t("trips.past")}
                </h2>
                <ul className="mt-3 space-y-3 opacity-80">
                  {past.map((trip) => (
                    <TripRow key={trip.id} trip={trip} />
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
