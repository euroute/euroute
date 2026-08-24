import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/useSession";
import { useI18n } from "@/lib/i18n";
import { takePendingTrip } from "@/lib/pending-trip";
import { saveTrip } from "@/lib/trips.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Logga in – Euroute" },
      {
        name: "description",
        content: "Logga in för att spara och dela dina tågreseplaner genom Europa.",
      },
      { property: "og:title", content: "Logga in – Euroute" },
      { property: "og:description", content: "Spara dina tågresor och dela dem med resekompisen." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");

  const credentials = z.object({
    email: z
      .string()
      .trim()
      .email({ message: t("auth.invalidEmail") })
      .max(255),
    password: z
      .string()
      .min(8, { message: t("auth.shortPassword") })
      .max(72),
  });

  // A plan the visitor tried to save before signing in is stored automatically
  // as soon as the session exists, then we open that trip.
  useEffect(() => {
    if (loading || !user) return;
    let active = true;
    const pending = takePendingTrip();
    if (!pending) {
      navigate({ to: "/mina-resor", replace: true });
      return;
    }
    saveTrip({ data: pending })
      .then((row) => {
        if (!active) return;
        toast.success(t("save.autoSaved"));
        if (row?.id) navigate({ to: "/resa/$id", params: { id: row.id }, replace: true });
        else navigate({ to: "/mina-resor", replace: true });
      })
      .catch(() => {
        if (!active) return;
        toast.error(t("search.saveFailed"));
        navigate({ to: "/mina-resor", replace: true });
      });
    return () => {
      active = false;
    };
  }, [loading, user, navigate, t]);

  async function signIn() {
    const parsed = credentials.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t("auth.checkFields"));
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) toast.error(t("auth.wrongCredentials"));
  }

  async function signUp() {
    const parsed = credentials.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t("auth.checkFields"));
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      ...parsed.data,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: name.trim().slice(0, 80) },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(
        error.message.includes("already") ? t("auth.emailTaken") : t("auth.signUpFailed"),
      );
      return;
    }
    if (!data.session) {
      toast.success(t("auth.confirmEmail"));
    }
  }

  async function signInWithGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(t("auth.googleFailed"));
      return;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-3xl font-semibold">{t("auth.h1")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("auth.lead")}</p>

        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <Button variant="outline" className="w-full" onClick={signInWithGoogle}>
            {t("auth.google")}
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {t("auth.orEmail")}
            <span className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="w-full">
              <TabsTrigger value="signin" className="flex-1">
                {t("auth.signIn")}
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                {t("auth.signUp")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4 space-y-3">
              <div>
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1.5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  className="mt-1.5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" disabled={busy} onClick={signIn}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : t("auth.signIn")}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="mt-4 space-y-3">
              <div>
                <Label htmlFor="name">{t("auth.name")}</Label>
                <Input
                  id="name"
                  className="mt-1.5"
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email-up">{t("auth.email")}</Label>
                <Input
                  id="email-up"
                  type="email"
                  className="mt-1.5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password-up">{t("auth.password")}</Label>
                <Input
                  id="password-up"
                  type="password"
                  className="mt-1.5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" disabled={busy} onClick={signUp}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : t("auth.signUp")}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
