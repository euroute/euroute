import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { stationLabel } from "@/lib/station-name";
import { formatDuration } from "@/lib/journey";
import type { Connection, ConnectionRiskLevel } from "@/lib/journey-intelligence";

const STYLES: Record<ConnectionRiskLevel, { className: string; Icon: typeof CircleCheck }> = {
  comfortable: { className: "text-rail", Icon: CircleCheck },
  tight: { className: "text-accent", Icon: CircleAlert },
  risky: { className: "text-destructive", Icon: TriangleAlert },
};

export function ConnectionLevelLabel({ level }: { level: ConnectionRiskLevel }) {
  const { t } = useI18n();
  const { className, Icon } = STYLES[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium", className)}>
      <Icon className="size-4" />
      {t(`conn.${level}`)}
    </span>
  );
}

/** Full connection block used in the journey timeline. */
export function ConnectionBlock({ connection }: { connection: Connection }) {
  const { t } = useI18n();
  return (
    <div className="my-2 ml-1 border-l-2 border-dashed border-rail pl-4">
      <p className="text-sm">
        {stationLabel(connection.arriveStation)}
        {connection.stationChange ? (
          <span className="text-muted-foreground"> → {stationLabel(connection.departStation)}</span>
        ) : null}
      </p>
      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>
          {connection.longWait
            ? t("conn.longWait", { time: formatDuration(connection.minutes) })
            : t("conn.minutes", { min: connection.minutes })}
        </span>
        {connection.longWait ? null : <ConnectionLevelLabel level={connection.level} />}
      </p>
      {connection.level !== "comfortable" ? (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("conn.recommend", { min: connection.recommendedMinutes })}
        </p>
      ) : null}
      {connection.stationChange ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{t("conn.stationChange")}</p>
      ) : null}
    </div>
  );
}
