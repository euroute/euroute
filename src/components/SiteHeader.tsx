import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import brandSymbol from "@/assets/euroute-symbol.svg.asset.json";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, type Lang } from "@/lib/i18n";

const LANGS: { value: Lang; label: string }[] = [
  { value: "sv", label: "SV" },
  { value: "en", label: "EN" },
];

export function SiteHeader() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { lang, setLang, t } = useI18n();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" aria-label="Euroute" className="flex min-w-0 items-center gap-2.5">
          <img
            src={brandSymbol.url}
            alt=""
            aria-hidden="true"
            width={40}
            height={40}
            className="size-9 shrink-0 rounded-[10px] sm:size-10"
          />
          <span className="flex items-center">
            <span className="font-display text-xl leading-none font-semibold tracking-tight whitespace-nowrap sm:text-2xl">
              Euroute
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <div
            className="flex items-center rounded-md border border-border p-0.5"
            role="group"
            aria-label={t("lang.label")}
          >
            {LANGS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={lang === option.value}
                onClick={() => setLang(option.value)}
                className={
                  "rounded-sm px-2 py-1 text-xs font-medium transition-colors " +
                  (lang === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {option.label}
              </button>
            ))}
          </div>

          <Button asChild variant="ghost" size="sm">
            <Link to="/">{t("nav.search")}</Link>
          </Button>
          {loading ? null : user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/mina-resor">{t("nav.myTrips")}</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/konto">{t("nav.account")}</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="size-4" />
                <span className="hidden sm:inline">{t("nav.signOut")}</span>
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">{t("nav.signIn")}</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
