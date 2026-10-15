import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type DailyLog = Database["public"]["Tables"]["daily_logs"]["Row"];

export const formatLogDate = (date: string) => {
  const today = new Date();
  const logDate = new Date(`${date}T00:00:00`);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today.getTime() - logDate.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;

  return logDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const useDailyLogs = (days = 7) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - (days - 1));

    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", fromDate.toISOString().split("T")[0])
      .order("log_date", { ascending: false });

    if (!error) setLogs(data ?? []);
    setLoading(false);
  }, [days, user]);

  useEffect(() => {
    fetchLogs();

    const handleDailyLogUpdate = () => fetchLogs();
    window.addEventListener("daily-log-updated", handleDailyLogUpdate);

    if (!user) {
      return () => window.removeEventListener("daily-log-updated", handleDailyLogUpdate);
    }

    const channel = supabase
      .channel(`daily-logs-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_logs", filter: `user_id=eq.${user.id}` },
        handleDailyLogUpdate,
      )
      .subscribe();

    return () => {
      window.removeEventListener("daily-log-updated", handleDailyLogUpdate);
      supabase.removeChannel(channel);
    };
  }, [fetchLogs, user]);

  return { logs, loading, refresh: fetchLogs };
};