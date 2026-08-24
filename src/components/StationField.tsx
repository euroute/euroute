import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { searchStations } from "@/lib/rail.functions";
import { useI18n } from "@/lib/i18n";
import type { Place } from "@/lib/journey";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  placeholder?: string;
  value: Place | null;
  onChange: (place: Place | null) => void;
};

export function StationField({ id, label, placeholder, value, onChange }: Props) {
  const [text, setText] = useState(value?.name ?? "");
  const [options, setOptions] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const { lang } = useI18n();

  useEffect(() => {
    setText(value?.name ?? "");
  }, [value?.name]);

  useEffect(() => {
    if (text.trim().length < 2 || text === value?.name) {
      setOptions([]);
      return;
    }
    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await searchStations({ data: { text: text.trim(), language: lang } });
        if (!active) return;
        setOptions(result.places);
        setOpen(result.places.length > 0);
      } finally {
        if (active) setLoading(false);
      }
    }, 280);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [text, value?.name, lang]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={boxRef}>
      <Label htmlFor={id} className="mb-1.5 block text-xs font-medium tracking-wide uppercase">
        {label}
      </Label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          autoComplete="off"
          value={text}
          placeholder={placeholder}
          className="h-11 pl-9"
          onChange={(event) => {
            setText(event.target.value);
            if (value) onChange(null);
          }}
          onFocus={() => options.length > 0 && setOpen(true)}
        />
        {loading ? (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {open && options.length > 0 ? (
        <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-lg">
          {options.map((option) => (
            <li key={`${option.name}-${option.place}`}>
              <button
                type="button"
                className={cn(
                  "w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                )}
                onClick={() => {
                  onChange(option);
                  setText(option.name);
                  setOpen(false);
                }}
              >
                {option.name}
                {option.country ? (
                  <span className="ml-2 text-xs text-muted-foreground">{option.country}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
