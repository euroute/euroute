import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";

import { JourneyOptionCard } from "@/components/JourneyOptionCard";
import { SaveTripButton } from "@/components/SaveTripButton";
import { OvernightSuggestion } from "@/components/OvernightSuggestion";
import { SearchForm } from "@/components/SearchForm";
import { SiteHeader } from "@/components/SiteHeader";
import { TravelStyleSelector } from "@/components/TravelStyleSelector";
import { Button } from "@/components/ui/button";
import { planOvernight } from "@/lib/overnight.functions";
import { planTrip } from "@/lib/rail.functions";
import { tripPlanFromOption, tripPlanFromOvernight } from "@/lib/trip-plan";
import { useI18n } from "@/lib/i18n";
import {
  civilDate,
  civilTime,
  formatDay,
  parsePlace,
  placeToString,
  type Place,
} from "@/lib/journey";
import { analyseJourneys, type TravelStyle } from "@/lib/journey-intelligence";
import { parseStyle, preferencesFromSearch } from "@/lib/search-params";

type SokSearch = {
  from: string;
  to: string;
  via: string[];
  depart: string;
  style: string;
  minTransfer: number;
  maxTransfers: string;
  maxPerDay: number;
  flags: string;
  apiMaxTransfers: number;
  /** Overnight stop the traveller asked for, as "name|lat,lon". */
  stay: string;
};

export const Route = createFileRoute("/sok")({
  validateSearch: (search: Record<string, unknown>): SokSearch => ({
    from: String(search["from"] ?? ""),
    to: String(search["to"] ?? ""),
    via: Array.isArray(search["via"])
      ? (search["via"] as unknown[]).map(String)
      : search["via"]
        ? [String(search["via"])]
        : [],
    depart: String(search["depart"] ?? ""),
    style: parseStyle(search["style"]),
    minTransfer: Number(search["minTransfer"] ?? 15),
    maxTransfers: String(search["maxTransfers"] ?? "any"),
    maxPerDay: Number(search["maxPerDay"] ?? 0),
    flags: String(search["flags"] ?? ""),
    apiMaxTransfers: Number(search["apiMaxTransfers"] ?? 6),
    stay: String(search["stay"] ?? ""),
  }),

  head: () => ({
    meta: [
      { title: "Reseförslag – Euroute tågplanerare" },
      {
        name: "description",
        content:
          "Jämför tågresor över hela Europa, se byten och bolag per etapp och hitta det bästa alternativet.",
      },
      { property: "og:title", content: "Reseförslag – Euroute tågplanerare" },
      {
        property: "og:description",
        content: "Alla etapper, alla bolag och bokningslänkar i samma vy.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SokPage,
});

function SokPage() {
  const search = Route.useSearch();
  const { lang, t } = useI18n();
  const navigate = Route.useNavigate();
  const [showMore, setShowMore] = useState(false);

  const from = useMemo(() => parsePlace(search.from), [search.from]);
  const to = useMemo(() => parsePlace(search.to), [search.to]);
  const via = useMemo<Place[]>(
    () =>
      (search.via as string[])
        .map((value: string) => parsePlace(value))
        .filter((place): place is Place => Boolean(place)),
    [search.via],
  );

  const preferences = useMemo(() => preferencesFromSearch(search), [search]);
  const style = parseStyle(search.style);

  const query = useQuery({
    queryKey: ["plan", search],
    enabled: Boolean(from && to && search.depart),
    queryFn: () =>
      planTrip({
        data: {
          from: from!,
          to: to!,
          via,
          departAt: search.depart,
          maxTransfers: search.apiMaxTransfers,
          minTransferMinutes: search.minTransfer,
        },
      }),
  });

  const journeys = query.data?.journeys ?? [];
  const analysis = useMemo(
    () => analyseJourneys({ journeys, preferences, style }),
    [journeys, preferences, style],
  );

  // Smart overnight is evaluated after the normal results are on screen, so
  // the extra timetable searches never delay the primary journey list.
  const baseOption = analysis.options[0];
  const requestedStop = useMemo(() => parsePlace(search.stay), [search.stay]);

  const overnight = useQuery({
    queryKey: [
      "overnight",
      baseOption?.journey.id ?? null,
      style,
      search.flags,
      search.minTransfer,
      search.maxPerDay,
      search.maxTransfers,
      search.stay,
    ],
    enabled: Boolean(baseOption && from && to),
    staleTime: 5 * 60_000,
    queryFn: () =>
      planOvernight({
        data: {
          base: baseOption!.journey,
          from: from!,
          to: to!,
          departAt: search.depart,
          preferences,
          style,
          requestedStop,
          maxTransfers: search.apiMaxTransfers,
        },
      }),
  });

  function setRequestedStop(place: Place | null) {
    void navigate({
      to: ".",
      search: (prev) => ({ ...prev, stay: place ? placeToString(place) : "" }),
    });
  }

  if (!from || !to || !search.depart) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="text-2xl font-semibold">{t("search.incompleteTitle")}</h1>
          <p className="mt-2 text-muted-foreground">{t("search.incompleteText")}</p>
          <Button asChild className="mt-6">
            <Link to="/">{t("search.toSearch")}</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("search.newSearch")}
        </Link>

        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          {from.name} <span className="text-muted-foreground">→</span> {to.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(search.maxTransfers === "any" ? "search.summaryAny" : "search.summary", {
            day: formatDay(search.depart, lang),
            max: search.maxTransfers,
            min: search.minTransfer,
          })}
          {via.length ? t("search.via", { list: via.map((v) => v.name).join(", ") }) : ""}
        </p>
        <div className="mt-4">
          <TravelStyleSelector
            compact
            value={style}
            onChange={(next: TravelStyle) => {
              void navigate({ to: ".", search: (prev) => ({ ...prev, style: next }) });
            }}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {query.isLoading ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-8 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                {t("search.loading")}
              </div>
            ) : query.data?.error ? (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6">
                <p className="font-medium">{t("search.failedTitle")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{query.data.error}</p>
              </div>
            ) : journeys.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="font-medium">{t("search.emptyTitle")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("search.emptyText")}</p>
              </div>
            ) : (
              <>
                {analysis.options.map((option, index) => (
                  <JourneyOptionCard
                    key={option.journey.id}
                    option={option}
                    minTransferMinutes={search.minTransfer}
                    defaultOpen={index === 0}
                    action={
                      <SaveTripButton
                        buildPlan={() =>
                          tripPlanFromOption({
                            option,
                            style,
                            minTransferMinutes: search.minTransfer,
                          })
                        }
                        searchParams={search}
                      />
                    }
                  />
                ))}

                <OvernightSuggestion
                  result={overnight.data?.result ?? null}
                  loading={overnight.isPending}
                  minTransferMinutes={search.minTransfer}
                  requestedStop={requestedStop}
                  onRequestStop={setRequestedStop}
                  renderAction={(plan) => (
                    <SaveTripButton
                      buildPlan={() =>
                        tripPlanFromOvernight({
                          plan,
                          style,
                          minTransferMinutes: search.minTransfer,
                          score: baseOption?.score ?? null,
                        })
                      }
                      searchParams={search}
                    />
                  )}
                />

                {analysis.more.length > 0 ? (
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setShowMore((value) => !value)}
                    >
                      {showMore
                        ? t("option.showLess")
                        : `${t("option.showMore")} · ${t("option.moreCount", { n: analysis.more.length })}`}
                    </Button>
                    {showMore
                      ? analysis.more.map((item) => (
                          <JourneyOptionCard
                            key={item.journey.id}
                            option={item}
                            minTransferMinutes={search.minTransfer}
                            action={
                              <SaveTripButton
                                buildPlan={() =>
                                  tripPlanFromOption({
                                    option: item,
                                    style,
                                    minTransferMinutes: search.minTransfer,
                                  })
                                }
                                searchParams={search}
                              />
                            }
                          />
                        ))
                      : null}
                  </div>
                ) : null}
              </>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <details className="rounded-xl border border-border bg-card p-4">
              <summary className="cursor-pointer text-sm font-medium">
                {t("search.editSearch")}
              </summary>
              <div className="mt-3">
                <SearchForm
                  initial={{
                    from,
                    to,
                    via,
                    date: civilDate(search.depart),
                    time: civilTime(search.depart),
                    style,
                    preferences,
                  }}
                />
              </div>
            </details>
          </aside>
        </div>
      </main>
    </div>
  );
}
