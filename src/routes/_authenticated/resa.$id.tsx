import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Copy, Loader2, MoonStar, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { BookingChecklist } from "@/components/BookingChecklist";
import { JourneyCard } from "@/components/JourneyCard";
import { SiteHeader } from "@/components/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { formatClock, formatDay, formatDayRange, formatDuration } from "@/lib/journey";
import { cityLabel } from "@/lib/station-name";
import {
  deleteTrip,
  getTripById,
  setSegmentBooked,
  setTripShared,
  updateTripDetails,
} from "@/lib/trips.functions";
import type { TripPlan, TripSegment } from "@/lib/trip-plan";

export const Route = createFileRoute("/_authenticated/resa/$id")({
  head: () => ({
    meta: [
      { title: "Reseplan – Euroute" },
      {
        name: "description",
        content: "Hela reseplanen dag för dag, med bokningslänkar för varje etapp.",
      },
      { property: "og:title", content: "Reseplan – Euroute" },
      {
        property: "og:description",
        content: "Din sparade tågresa genom Europa med alla etapper och bokningslänkar.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TripDetail,
});

function TripDetail() {
  const { id } = Route.useParams();
  const { lang, t } = useI18n();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<string | null>(null);

  const trip = useQuery({
    queryKey: ["trip", id],
    queryFn: () => getTripById({ data: { id } }),
  });

  const row = trip.data?.trip ?? null;
  const plan = (row?.itinerary ?? null) as TripPlan | null;
  const isPlan = Boolean(plan && Array.isArray(plan.days) && plan.days.length > 0);

  const booked = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const item of trip.data?.bookings ?? []) map[item.segment_key] = item.booked;
    return map;
  }, [trip.data]);

  const toggle = useMutation({
    mutationFn: (args: { segment: TripSegment; next: boolean }) =>
      setSegmentBooked({
        data: {
          tripId: id,
          segmentKey: args.segment.key,
          booked: args.next,
          reference: null,
        },
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["trip", id] }),
    onError: () => toast.error(t("book.markFailed")),
  });

  const share = useMutation({
    mutationFn: (next: boolean) => setTripShared({ data: { id, isShared: next } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["trip", id] });
      void queryClient.invalidateQueries({ queryKey: ["my-trips"] });
    },
    onError: () => toast.error(t("trip.shareFailed")),
  });

  const saveNotes = useMutation({
    mutationFn: (value: string) => updateTripDetails({ data: { id, notes: value } }),
    onSuccess: () => {
      toast.success(t("trip.notesSaved"));
      void queryClient.invalidateQueries({ queryKey: ["trip", id] });
    },
    onError: () => toast.error(t("trip.notesFailed")),
  });

  const remove = useMutation({
    mutationFn: () => deleteTrip({ data: { id } }),
    onSuccess: () => {
      toast.success(t("trips.deleted"));
      void queryClient.invalidateQueries({ queryKey: ["my-trips"] });
      window.location.assign("/mina-resor");
    },
    onError: () => toast.error(t("trips.deleteFailed")),
  });

  if (trip.isLoading) {
    return (
      <Shell>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" /> {t("trip.loading")}
        </div>
      </Shell>
    );
  }

  if (!row) {
    return (
      <Shell>
        <h1 className="text-2xl font-semibold">{t("trip.notFoundTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("trip.notFoundText")}</p>
        <Button asChild className="mt-6">
          <Link to="/mina-resor">{t("trip.back")}</Link>
        </Button>
      </Shell>
    );
  }

  const shareUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}/delad/${row.share_slug}`;

  return (
    <Shell>
      <Link
        to="/mina-resor"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("trip.back")}
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            {cityLabel(row.from_name)} <span className="text-muted-foreground">→</span>{" "}
            {cityLabel(row.to_name)}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {row.depart_at
              ? row.travel_days > 1 && row.arrive_at
                ? formatDayRange(row.depart_at, row.arrive_at, lang)
                : `${formatDay(row.depart_at, lang)} · ${formatClock(row.depart_at)}${
                    row.arrive_at ? ` → ${formatClock(row.arrive_at)}` : ""
                  }${row.duration_minutes ? ` · ${formatDuration(row.duration_minutes)}` : ""}`
              : t("trips.noDate")}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{t(`style.${row.travel_style}`)}</Badge>
            {row.travel_days > 1 ? (
              <Badge variant="outline">{t("trip.daysN", { n: row.travel_days })}</Badge>
            ) : null}
            <Badge variant="outline">{t("trip.changesN", { n: row.changes })}</Badge>
            {row.travel_days > 1 && row.duration_minutes ? (
              <Badge variant="outline">
                {t("trip.trainTime", { duration: formatDuration(row.duration_minutes) })}
              </Badge>
            ) : null}
            {row.is_overnight && row.overnight_cities.length ? (
              <Badge variant="default" className="gap-1">
                <MoonStar className="size-3.5" />
                {row.overnight_cities.map(cityLabel).join(", ")}
              </Badge>
            ) : null}
          </div>
        </div>


        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={share.isPending}
            onClick={() => share.mutate(!row.is_shared)}
          >
            <Share2 className="size-4" />
            {row.is_shared ? t("trip.shareOff") : t("trip.shareOn")}
          </Button>
          {row.is_shared ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                void navigator.clipboard.writeText(shareUrl);
                toast.success(t("trip.linkCopied"));
              }}
            >
              <Copy className="size-4" />
              {t("trip.copyLink")}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-destructive"
            disabled={remove.isPending}
            onClick={() => {
              if (window.confirm(t("trips.confirmDelete"))) remove.mutate();
            }}
          >
            <Trash2 className="size-4" />
            {t("trips.delete")}
          </Button>
        </div>
      </div>

      {isPlan && plan ? (
        <div className="mt-8 space-y-6">
          <BookingChecklist
            tripId={id}
            plan={plan}
            booked={booked}
            pending={toggle.isPending}
            onToggle={(segment, next) => toggle.mutate({ segment, next })}
          />

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">{t("trip.itinerary")}</h2>
            {plan.days.map((day, index) => {
              const stay = plan.stays[index];
              return (
                <div key={`day-${day.day}`} className="space-y-3">
                  {plan.days.length > 1 ? (
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {t("book.dayHeading", { n: day.day, date: formatDay(day.departure, lang) })}
                    </p>
                  ) : null}
                  <JourneyCard
                    journey={day.journey}
                    minTransferMinutes={plan.minTransferMinutes}
                  />
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

      <section className="mt-8 rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="text-lg font-semibold">{t("trip.notes")}</h2>
        <Textarea
          className="mt-3"
          rows={4}
          placeholder={t("trip.notesPlaceholder")}
          value={notes ?? row.notes ?? ""}
          onChange={(event) => setNotes(event.target.value)}
        />
        <Button
          className="mt-3 gap-1.5"
          size="sm"
          disabled={saveNotes.isPending}
          onClick={() => saveNotes.mutate(notes ?? row.notes ?? "")}
        >
          <Check className="size-4" />
          {t("trip.saveNotes")}
        </Button>
      </section>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
    </div>
  );
}
