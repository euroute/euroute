import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { TrainFront, LogOut } from "lucide-react";

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
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TrainFront className="size-5" />
          </span>
          <span className="font-display text-lg leading-none font-semibold">
            Euroute
            <span className="block text-[11px] font-normal tracking-wide text-muted-foreground">
              {t("brand.tagline")}
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
