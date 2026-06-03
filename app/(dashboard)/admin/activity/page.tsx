"use client";

import React from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface ActivityRecord {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: any;
  newValue: any;
  ipAddress: string | null;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
}

export default function AdminActivityPage() {
  const [logs, setLogs] = React.useState<ActivityRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [action, setAction] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(15);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("page", page.toString());
      query.append("limit", limit.toString());
      if (action) query.append("action", action);

      const res = await fetch(`/api/admin/activity?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadLogs();
  }, [page, limit, action]);

  const renderValue = (val: any) => {
    if (val === null || val === undefined) return <span className="text-slate-400 italic">None</span>;
    if (typeof val === "object") {
      return (
        <code className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 max-w-[200px] block truncate font-mono text-slate-600">
          {JSON.stringify(val)}
        </code>
      );
    }
    return <span className="font-mono text-[10px] text-slate-700 bg-slate-50 px-1 py-0.5 rounded border border-slate-200">{String(val)}</span>;
  };

  return (
    <main className="flex-1 bg-slate-50 p-6 lg:p-8 space-y-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">System Activity Logs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying {totalCount} total audit trails, security role overrides, and database events.
          </p>
        </div>
      </div>

      <div className="flex gap-3 bg-white p-4 border border-slate-200 rounded-[6px] shadow-sm max-w-xs">
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="w-full bg-white border border-slate-250 rounded-[6px] px-3 py-2 text-xs text-slate-705 focus:border-indigo-500 outline-none"
        >
          <option value="">All Activity Types</option>
          <option value="CREATE_PRODUCT">CREATE PRODUCT</option>
          <option value="UPDATE_PRODUCT">UPDATE PRODUCT</option>
          <option value="DELETE_PRODUCT">DELETE PRODUCT</option>
          <option value="UPDATE_ORDER_STATUS">UPDATE ORDER STATUS</option>
          <option value="APPROVE_QUOTATION">APPROVE QUOTATION</option>
          <option value="UPDATE_USER_ROLE">UPDATE USER ROLE</option>
          <option value="UPDATE_USER_STATUS">UPDATE USER STATUS</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-[6px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                <th className="p-4">Operator Details</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Target Model</th>
                <th className="p-4">Target ID</th>
                <th className="p-4">Previous Value</th>
                <th className="p-4">Updated Value</th>
                <th className="p-4">IP Address</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-650" />
                      <span>Fetching action audits...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-semibold">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <p className="font-bold text-slate-805">{log.user?.fullName || "System Admin"}</p>
                      <p className="text-[10px] text-slate-450 font-mono">{log.user?.email || "system@shelfly.com"}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4 capitalize text-slate-550 font-semibold">{log.entityType}</td>
                    <td className="p-4 font-mono text-slate-500">{log.entityId}</td>
                    <td className="p-4">{renderValue(log.oldValue)}</td>
                    <td className="p-4">{renderValue(log.newValue)}</td>
                    <td className="p-4 text-slate-500 font-mono">{log.ipAddress || "-"}</td>
                    <td className="p-4 text-right text-slate-450 font-medium">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-slate-200 bg-slate-50">
            <span className="text-[10px] text-slate-500 font-semibold">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-[6px] border border-slate-250 text-slate-550 hover:text-slate-800 disabled:opacity-40 transition-all bg-white shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-[6px] border border-slate-250 text-slate-550 hover:text-slate-800 disabled:opacity-40 transition-all bg-white shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
