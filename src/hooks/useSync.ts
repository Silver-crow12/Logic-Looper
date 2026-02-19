import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getUnsyncedActivities, markAsSynced } from "@/lib/db";

export function useSync() {
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const syncData = async () => {
      
      const unsynced = await getUnsyncedActivities();
      if (unsynced.length === 0) return;

      try {
        console.log(`Syncing ${unsynced.length} records...`);
        
        
        const res = await fetch("/api/sync-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: unsynced }),
        });

        if (res.ok) {
          
          const syncedDates = unsynced.map((u) => u.date);
          await markAsSynced(syncedDates);
          console.log(`✅ Synced ${syncedDates.length} records successfully.`);
        }
      } catch (error) {
        console.error("⚠️ Sync failed, will retry later:", error);
      }
    };

    syncData();
    window.addEventListener("focus", syncData);
    return () => window.removeEventListener("focus", syncData);
  }, [user]);
}