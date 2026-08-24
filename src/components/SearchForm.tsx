import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import { StationField } from "@/components/StationField";
import { TravelStyleSelector } from "@/components/TravelStyleSelector";
import { JourneyPreferencesPanel } from "@/components/JourneyPreferencesPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/useSession";
import { useI18n } from "@/lib/i18n";
import { civilDate, civilToIso, placeToString, type Place } from "@/lib/journey";
import {
  DEFAULT_PREFERENCES,
  type JourneyPreferences,
  type TravelStyle,
} from "@/lib/journey-intelligence";
import { apiMaxTransfers, encodeFlags } from "@/lib/search-params";
import { getTravelPreferences, saveTravelPreferences } from "@/lib/prefs.functions";

function defaultDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  // Civil date in the journey time zone – a UTC slice can land on the wrong day.
  return civilDate(d.toISOString());
}

export type SearchFormValues = {
  from: Place | null;
  to: Place | null;
  via: (Place | null)[];
  date: string;
  time: string;
  style: TravelStyle;
  preferences: JourneyPreferences;
};

export function SearchForm({
  initial,
  preferencesOpen,
}: {
  initial?: Partial<SearchFormValues>;
  preferencesOpen?: boolean;
}) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useSession();
  const [touchedPrefs, setTouchedPrefs] = useState(false);
  const [values, setValues] = useState<SearchFormValues>({
    from: initial?.from ?? null,
    to: initial?.to ?? null,
    via: initial?.via ?? [],
    date: initial?.date ?? defaultDate(),
    time: initial?.time ?? "08:00",
    style: initial?.style ?? "recommended",
    preferences: initial?.preferences ?? DEFAULT_PREFERENCES,
  });

  // Saved preferences for signed-in travellers. URL/initial values win, and we
  // never overwrite something the traveller has just changed by hand.
  const saved = useQuery({
    queryKey: ["travel-preferences", user?.id],
    enabled: Boolean(user),
    queryFn: () => getTravelPreferences(),
  });

  useEffect(() => {
    if (!saved.data || touchedPrefs || initial?.preferences) return;
    setValues((prev) => ({
      ...prev,
      style: (saved.data!.travelStyle as TravelStyle) ?? prev.style,
      preferences: { ...DEFAULT_PREFERENCES, ...(saved.data!.preferences as object) },
    }));
  }, [saved.data, touchedPrefs, initial?.preferences]);

  const persist = useMutation({
    mutationFn: (input: { style: TravelStyle; preferences: JourneyPreferences }) =>
      saveTravelPreferences({
        data: { travelStyle: input.style, preferences: input.preferences },
      }),
  });

  function set<K extends keyof SearchFormValues>(key: K, value: SearchFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    if (!values.from || !values.to) {
      toast.error(t("form.missingStations"));
      return;
    }
    const via = values.via.filter((v): v is Place => Boolean(v));
    // The traveller means 08:00 local railway time, so build the instant with
    // that date's actual offset instead of trusting the browser's zone.
    const departAt = civilToIso(values.date, values.time);
    const prefs = values.preferences;

    if (user) {
      persist.mutate({ style: values.style, preferences: prefs });
    }

    navigate({
      to: "/sok",
      search: {
        from: placeToString(values.from),
        to: placeToString(values.to),
        via: via.map(placeToString),
        depart: departAt,
        style: values.style,
        minTransfer: prefs.minTransferMinutes,
        maxTransfers: prefs.maxTransfers === null ? "any" : String(prefs.maxTransfers),
        maxPerDay: prefs.maxTravelHoursPerDay ?? 0,
        flags: encodeFlags(prefs),
        apiMaxTransfers: apiMaxTransfers(prefs),
        stay: "",
      },
    });
  }

  return (
    <form
      className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <StationField
          id="from"
          label={t("form.from")}
          placeholder={t("form.fromPlaceholder")}
          value={values.from}
          onChange={(place) => set("from", place)}
        />
        <StationField
          id="to"
          label={t("form.to")}
          placeholder={t("form.toPlaceholder")}
          value={values.to}
          onChange={(place) => set("to", place)}
        />
      </div>

      {values.via.length > 0 ? (
        <div className="mt-4 space-y-3 rounded-lg border border-dashed border-border bg-secondary/40 p-3">
          {values.via.map((place, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <StationField
                  id={`via-${index}`}
                  label={`${t("form.viaLabel")} ${index + 1}`}
                  placeholder={t("form.viaPlaceholder")}
                  value={place}
                  onChange={(next) =>
                    set(
                      "via",
                      values.via.map((v, i) => (i === index ? next : v)),
                    )
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("form.removeVia")}
                onClick={() =>
                  set(
                    "via",
                    values.via.filter((_, i) => i !== index),
                  )
                }
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label
            htmlFor="date"
            className="mb-1.5 block text-xs font-medium tracking-wide uppercase"
          >
            {t("form.date")}
          </Label>
          <Input
            id="date"
            type="date"
            className="h-11"
            value={values.date}
            onChange={(event) => set("date", event.target.value)}
          />
        </div>
        <div>
          <Label
            htmlFor="time"
            className="mb-1.5 block text-xs font-medium tracking-wide uppercase"
          >
            {t("form.time")}
          </Label>
          <Input
            id="time"
            type="time"
            className="h-11"
            value={values.time}
            onChange={(event) => set("time", event.target.value)}
          />
        </div>
      </div>

      <div className="mt-5">
        <TravelStyleSelector
          value={values.style}
          onChange={(style) => {
            setTouchedPrefs(true);
            set("style", style);
          }}
        />
      </div>

      <div className="mt-4">
        <JourneyPreferencesPanel
          value={values.preferences}
          defaultOpen={preferencesOpen}
          onChange={(next) => {
            setTouchedPrefs(true);
            set("preferences", next);
          }}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" className="gap-2">
          <Search className="size-4" />
          {t("form.submit")}
        </Button>
        {values.via.length < 3 ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => set("via", [...values.via, null])}
          >
            <Plus className="size-4" />
            {t("form.addVia")}
          </Button>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {t("form.viaHint")}
          <ArrowRight className="ml-1 inline size-3.5" />
        </p>
      </div>
    </form>
  );
}
