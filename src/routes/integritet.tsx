import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/lib/i18n";

const SECTIONS = ["data", "why", "keep", "third", "rights", "cookies", "contact"] as const;

export const Route = createFileRoute("/integritet")({
  head: () => ({
    meta: [
      { title: "Integritet & personuppgifter – Euroute" },
      {
        name: "description",
        content:
          "Vilka uppgifter Euroute sparar när du planerar tågresor i Europa, varför, hur länge – och hur du raderar dem själv.",
      },
      { property: "og:title", content: "Integritet & personuppgifter – Euroute" },
      {
        property: "og:description",
        content: "Så hanterar Euroute konto, sparade reseplaner och statistik.",
      },
      { property: "og:url", content: "https://euroute.lovable.app/integritet" },
    ],
    links: [{ rel: "canonical", href: "https://euroute.lovable.app/integritet" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold sm:text-4xl">{t("privacy.h1")}</h1>
        <p className="mt-4 text-muted-foreground">{t("privacy.lead")}</p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((key) => (
            <section key={key}>
              <h2 className="text-lg font-semibold">{t(`privacy.${key}.title`)}</h2>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {t(`privacy.${key}.text`)}
              </p>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
