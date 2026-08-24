import { ChevronDown } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import type { JourneyPreferences } from "@/lib/journey-intelligence";

type Props = {
  value: JourneyPreferences;
  onChange: (next: JourneyPreferences) => void;
  defaultOpen?: boolean | undefined;
};

/**
 * "Avoid buses" is intentionally not offered: every timetable search already
 * asks for rail only, so the toggle promised a filter that never had anything
 * to act on. The preference still exists in the model for scoring of the odd
 * replacement-bus leg the operators publish inside a rail service.
 */
const TOGGLES: { key: keyof JourneyPreferences; label: string }[] = [
  { key: "preferDirect", label: "prefs.preferDirect" },
  { key: "preferHighSpeed", label: "prefs.preferHighSpeed" },
  { key: "avoidNightTrains", label: "prefs.avoidNightTrains" },
  { key: "avoidOvernightTravel", label: "prefs.avoidOvernight" },
  { key: "avoidStationChange", label: "prefs.avoidStationChange" },
  
  { key: "allowOvernightStop", label: "prefs.allowOvernightStop" },
];

export function JourneyPreferencesPanel({ value, onChange, defaultOpen }: Props) {
  const { t } = useI18n();

  function set<K extends keyof JourneyPreferences>(key: K, next: JourneyPreferences[K]) {
    onChange({ ...value, [key]: next });
  }

  return (
    <details
      open={defaultOpen}
      className="group rounded-lg border border-border bg-secondary/30 px-4 py-3"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
        {t("prefs.title")}
        <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <Label className="mb-1.5 block text-xs font-medium tracking-wide uppercase">
            {t("prefs.minTransfer")}
          </Label>
          <Select
            value={String(value.minTransferMinutes)}
            onValueChange={(v) => set("minTransferMinutes", Number(v))}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[15, 20, 30, 45, 60].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {t("form.minutesN", { n })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs font-medium tracking-wide uppercase">
            {t("prefs.maxTransfers")}
          </Label>
          <Select
            value={value.maxTransfers === null ? "any" : String(value.maxTransfers)}
            onValueChange={(v) => set("maxTransfers", v === "any" ? null : Number(v))}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{t("prefs.any")}</SelectItem>
              {[1, 2, 3, 4].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs font-medium tracking-wide uppercase">
            {t("prefs.maxPerDay")}
          </Label>
          <Select
            value={value.maxTravelHoursPerDay === null ? "0" : String(value.maxTravelHoursPerDay)}
            onValueChange={(v) => set("maxTravelHoursPerDay", v === "0" ? null : Number(v))}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">{t("prefs.noLimit")}</SelectItem>
              {[6, 8, 10, 12].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {t("prefs.hoursN", { n })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {TOGGLES.map((toggle) => (
          <div key={toggle.key} className="flex items-center justify-between gap-3">
            <Label htmlFor={`pref-${toggle.key}`} className="text-sm font-normal">
              {t(toggle.label)}
            </Label>
            <Switch
              id={`pref-${toggle.key}`}
              checked={Boolean(value[toggle.key])}
              onCheckedChange={(checked) => set(toggle.key, checked as never)}
            />
          </div>
        ))}
      </div>
    </details>
  );
}
