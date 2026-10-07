"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import {
  History,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [meta, setMeta] = useState({ actions: [], entity_types: [] });

  const loadMeta = useCallback(async () => {
    try {
      const res = await api.get("/admin/audit-logs/meta");
      setMeta(res.data || { actions: [], entity_types: [] });
    } catch (e) {
      console.error("Failed to load audit metadata", e);
    }
  }, []);

  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = {
          page,
          per_page: 25,
        };
        if (search) params.search = search;
        if (selectedAction) params.action = selectedAction;
        if (selectedEntity) params.entity_type = selectedEntity;

        const res = await api.get("/admin/audit-logs", { params });
        setLogs(res.data.data || []);
        setPagination({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          total: res.data.total,
          from: res.data.from,
          to: res.data.to,
        });
      } catch (err) {
        toast.error("Failed to fetch audit logs");
      } finally {
        setLoading(false);
      }
    },
    [search, selectedAction, selectedEntity]
  );

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  return (
    <div className="min-h-full p-4 sm:p-6 space-y-4">
      {/* Zen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Audit Trails
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable log of state changes, user interactions, and critical operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(pagination.current_page)}
            disabled={loading}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Zen Filter Strip */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search action or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs pl-8 bg-card border-border"
          />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="h-8 px-2.5 text-xs bg-card border border-border rounded-md font-medium text-foreground outline-none focus:border-primary"
        >
          <option value="">All Actions</option>
          {meta.actions.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>

        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          className="h-8 px-2.5 text-xs bg-card border border-border rounded-md font-medium text-foreground outline-none focus:border-primary"
        >
          <option value="">All Entities</option>
          {meta.entity_types.map((ent) => (
            <option key={ent} value={ent}>
              {ent}
            </option>
          ))}
        </select>
      </form>

      {/* Zen Compact Data Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                <th className="py-2.5 px-3.5">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3.5 text-right">Target ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-2.5 px-3.5"><div className="h-3 w-28 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3"><div className="h-3 w-32 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3"><div className="h-3 w-24 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3"><div className="h-3 w-16 bg-muted rounded" /></td>
                    <td className="py-2.5 px-3.5 text-right"><div className="h-3 w-8 bg-muted rounded ml-auto" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No audit logs found matching criteria</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3.5 text-muted-foreground whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-medium text-foreground block">
                        {log.user_name || "System"}
                      </span>
                      {log.user_email && (
                        <span className="text-[10px] text-muted-foreground block">
                          {log.user_email}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      <span className="inline-block px-1.5 py-0.5 text-[10px] bg-muted rounded border border-border/50">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      <span className="font-mono text-[11px] text-foreground">
                        {log.entity_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-muted-foreground font-mono text-[11px]">
                      #{log.entity_id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            Showing {pagination.from || 0}–{pagination.to || 0} of {pagination.total} records
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchLogs(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1 || loading}
              className="h-7 w-7"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="px-2 text-[11px]">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchLogs(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.last_page || loading}
              className="h-7 w-7"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
