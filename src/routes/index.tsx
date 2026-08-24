import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Route as RouteIcon, Sparkles, Ticket } from "lucide-react";

import { SearchForm } from "@/components/SearchForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Euroute – planera tågresor i hela Europa" },
      {
        name: "description",
        content:
          "Sök tågresor över landsgränser i ett svep, se alla byten och bolag, och få resan rangordnad efter dina preferenser.",
      },
      { property: "og:title", content: "Euroute – planera tågresor i hela Europa" },
      {
        property: "og:description",
        content:
          "En sökning ger dig hela resan – från SJ till DSB och DB – med bokningslänkar för varje etapp.",
      },
      { property: "og:url", content: "https://euroute.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://euroute.lovable.app/" }],
  }),
  component: Index,
});

const FEATURES = [
  { icon: RouteIcon, key: "f1" },
  { icon: Compass, key: "f2" },
  { icon: Sparkles, key: "f3" },
  { icon: Ticket, key: "f4" },
];

function Index() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="border-b border-border bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
            <h1 className="max-w-3xl text-4xl leading-[1.05] font-semibold sm:text-6xl">
              {t("home.h1")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg opacity-85">{t("home.lead")}</p>
          </div>
        </section>

        <section className="mx-auto -mt-10 max-w-5xl px-4">
          <SearchForm />
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold">{t("home.featuresTitle")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div key={feature.key} className="rounded-xl border border-border bg-card p-5">
                <feature.icon className="size-5 text-accent" />
                <h3 className="mt-3 text-base font-semibold">{t(`home.${feature.key}.title`)}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t(`home.${feature.key}.text`)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-dashed border-border bg-secondary/40 p-6">
            <h2 className="text-lg font-semibold">{t("home.saveTitle")}</h2>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{t("home.saveText")}</p>
            <Link
              to="/auth"
              className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("home.createAccount")}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
