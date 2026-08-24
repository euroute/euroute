import { Link } from "@tanstack/react-router";

import { useI18n } from "@/lib/i18n";

/**
 * Gemensam sidfot: datakällor, tydlighet om att Euroute inte säljer biljetter,
 * och länk till integritetspolicyn.
 */
export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="mt-16 border-t border-border py-8">
      <div className="mx-auto max-w-6xl space-y-2 px-4 text-xs text-muted-foreground">
        <p>
          {t("footer.sourcesPrefix")}
          <a
            href="https://transitous.org/sources/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {t("footer.sourcesLink")}
          </a>
          {t("footer.sourcesSuffix")}
        </p>
        <p>
          {t("footer.osmPrefix")}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {t("footer.osmLink")}
          </a>
          {t("footer.osmSuffix")}
        </p>
        <p>{t("footer.noTickets")}</p>
        <p className="flex flex-wrap gap-3">
          <Link to="/integritet" className="underline underline-offset-2 hover:text-foreground">
            {t("footer.privacy")}
          </Link>
          <Link to="/" className="underline underline-offset-2 hover:text-foreground">
            {t("nav.search")}
          </Link>
        </p>
      </div>
    </footer>
  );
}
