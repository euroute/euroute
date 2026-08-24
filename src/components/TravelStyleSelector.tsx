import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { VISIBLE_STYLES, type TravelStyle } from "@/lib/journey-intelligence";

type Props = {
  value: TravelStyle;
  onChange: (style: TravelStyle) => void;
  /** Compact segmented control, used above the result list. */
  compact?: boolean | undefined;
};

export function TravelStyleSelector({ value, onChange, compact }: Props) {
  const { t } = useI18n();

  if (compact) {
    return (
      <div
        className="inline-flex rounded-lg border border-border bg-card p-1"
        role="group"
        aria-label={t("style.title")}
      >
        {VISIBLE_STYLES.map((style) => (
          <button
            key={style}
            type="button"
            aria-pressed={value === style}
            onClick={() => onChange(style)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              value === style
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(`style.${style}`)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <fieldset>
      <Label asChild>
        <legend className="mb-2 block text-xs font-medium tracking-wide uppercase">
          {t("style.title")}
        </legend>
      </Label>
      <div className="grid gap-2 sm:grid-cols-3">
        {VISIBLE_STYLES.map((style) => {
          const active = value === style;
          return (
            <button
              key={style}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(style)}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-left transition-colors",
                active
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40",
              )}
            >
              <span className="block text-sm font-medium">{t(`style.${style}`)}</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                {t(`style.${style}.desc`)}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
