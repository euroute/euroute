import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { deleteMyAccount, exportMyData } from "@/lib/account.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/konto")({
  head: () => ({
    meta: [
      { title: "Mitt konto – Euroute" },
      { name: "description", content: "Hantera ditt Euroute-konto, exportera eller radera data." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user } = useSession();
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState("");

  const confirmWord = t("account.confirmWord");
  const canDelete = confirmText.trim().toUpperCase() === confirmWord.toUpperCase();

  const exportData = useMutation({
    mutationFn: () => exportMyData(),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "euroute-data.json";
      link.click();
      URL.revokeObjectURL(url);
    },
    onError: () => toast.error(t("account.exportFailed")),
  });

  const remove = useMutation({
    mutationFn: () => deleteMyAccount(),
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
      toast.success(t("account.deleted"));
      void navigate({ to: "/", replace: true });
    },
    onError: () => toast.error(t("account.deleteFailed")),
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold sm:text-3xl">{t("account.h1")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("account.lead")}</p>

        <section className="mt-8 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">{t("account.detailsTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("account.email")}: <span className="text-foreground">{user?.email ?? "–"}</span>
          </p>
        </section>

        <section className="mt-5 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">{t("account.exportTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("account.exportText")}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-1.5"
            disabled={exportData.isPending}
            onClick={() => exportData.mutate()}
          >
            {exportData.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {t("account.exportCta")}
          </Button>
        </section>

        <section className="mt-5 rounded-xl border border-destructive/40 bg-destructive/5 p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ShieldAlert className="size-4 text-destructive" />
            {t("account.deleteTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("account.deleteText")}</p>

          <label className="mt-4 block text-sm font-medium" htmlFor="confirm-delete">
            {t("account.confirmLabel", { word: confirmWord })}
          </label>
          <Input
            id="confirm-delete"
            className="mt-1.5 max-w-xs"
            value={confirmText}
            autoComplete="off"
            onChange={(event) => setConfirmText(event.target.value)}
          />

          <Button
            variant="destructive"
            size="sm"
            className="mt-4 gap-1.5"
            disabled={!canDelete || remove.isPending}
            onClick={() => remove.mutate()}
          >
            {remove.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("account.deleteCta")}
          </Button>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
