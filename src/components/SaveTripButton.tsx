import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { useI18n } from "@/lib/i18n";
import { saveTrip } from "@/lib/trips.functions";
import { buildSaveInput, storePendingTrip } from "@/lib/pending-trip";
import type { TripPlan } from "@/lib/trip-plan";

type Props = {
  /** Built on demand so the snapshot is created at the moment of saving. */
  buildPlan: () => TripPlan;
  searchParams?: Record<string, unknown>;
};

/**
 * One save action for every journey card. Signed-out visitors keep the plan in
 * the session and it is stored automatically right after they sign in.
 */
export function SaveTripButton({ buildPlan, searchParams }: Props) {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const save = useMutation({
    mutationFn: () => saveTrip({ data: buildSaveInput(buildPlan(), searchParams ?? {}) }),
    onSuccess: (row) => {
      void queryClient.invalidateQueries({ queryKey: ["my-trips"] });
      toast.success(row?.duplicate ? t("trips.alreadySaved") : t("search.saved"), {
        action: row
          ? {
              label: t("save.viewTrip"),
              onClick: () => void navigate({ to: "/resa/$id", params: { id: row.id } }),
            }
          : undefined,
      });
    },
    onError: () => toast.error(t("search.saveFailed")),
  });

  if (!user) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="gap-1.5"
        onClick={() => {
          storePendingTrip(buildSaveInput(buildPlan(), searchParams ?? {}));
          toast.info(t("save.signInToSave"));
          void navigate({ to: "/auth" });
        }}
      >
        <Bookmark className="size-4" />
        {t("search.saveTrip")}
      </Button>
    );
  }

  return (
    <Button
      variant={save.isSuccess ? "outline" : "secondary"}
      size="sm"
      className="gap-1.5"
      disabled={save.isPending}
      onClick={() => save.mutate()}
    >
      {save.isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : save.isSuccess ? (
        <BookmarkCheck className="size-4" />
      ) : (
        <Bookmark className="size-4" />
      )}
      {save.isSuccess ? t("save.savedShort") : t("search.saveTrip")}
    </Button>
  );
}
