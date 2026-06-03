"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { 
  Search, Loader2, ChevronLeft, ChevronRight, 
  UserCheck, ShieldAlert, UserX, ShieldCheck 
} from "lucide-react";

interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  emailVerified: boolean;
  accountStatus: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [users, setUsers] = React.useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [role, setRole] = React.useState("");
  const [status, setStatus] = React.useState("");

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);

  const [isUpdatingId, setIsUpdatingId] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [search]);

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const query = new URLSearchParams();
      query.append("page", page.toString());
      query.append("limit", limit.toString());
      if (debouncedSearch) query.append("search", debouncedSearch);
      if (role) query.append("role", role);
      if (status) query.append("status", status);

      const res = await fetch(`/api/admin/users?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
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
    loadUsers();
  }, [page, limit, debouncedSearch, role, status]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setIsUpdatingId(userId);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to update role");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error updating role");
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setIsUpdatingId(userId);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountStatus: newStatus }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, accountStatus: newStatus } : u)));
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Network error updating account status");
    } finally {
      setIsUpdatingId(null);
    }
  };

  return (
    <main className="flex-1 bg-slate-50 p-6 lg:p-8 space-y-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">User Accounts Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying {totalCount} platform user accounts. Toggle active scopes, manage roles, and lock suspension access.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-[6px] text-rose-700 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 border border-slate-200 rounded-[6px] shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by full name, email address, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-250 rounded-[6px] pl-9 pr-4 py-2.5 text-xs text-slate-805 placeholder-slate-400 focus:border-indigo-500 outline-none"
          />
        </div>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-250 rounded-[6px] px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 outline-none"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SELLER">SELLER</option>
          <option value="BUYER">BUYER</option>
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="bg-white border border-slate-250 rounded-[6px] px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="bg-white border border-slate-250 rounded-[6px] px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 outline-none"
        >
          <option value={10}>10 Per Page</option>
          <option value={25}>25 Per Page</option>
          <option value={50}>50 Per Page</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-[6px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                <th className="p-4">Full Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4">Platform Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      <span>Loading user index...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                    No registered user accounts matched.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isUpdating = isUpdatingId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-805">
                        <div className="flex items-center gap-2">
                          <span>{user.fullName}</span>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 text-[8px] bg-slate-100 text-slate-500 rounded font-extrabold border border-slate-200">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-600">{user.email}</td>
                      <td className="p-4 text-slate-500">{user.phone || "-"}</td>
                      <td className="p-4 text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4">
                        <select
                          disabled={isSelf || isUpdating}
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className="bg-white border border-slate-250 rounded-[6px] px-2 py-1 text-xs text-slate-700 font-bold focus:border-indigo-500 outline-none disabled:opacity-50"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="SELLER">SELLER</option>
                          <option value="BUYER">BUYER</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold rounded-full border ${
                          user.accountStatus === "ACTIVE" 
                            ? "bg-emerald-50 text-emerald-750 border-emerald-200" 
                            : "bg-rose-50 text-rose-750 border-rose-200"
                        }`}>
                          {user.accountStatus === "ACTIVE" ? (
                            <>
                              <ShieldCheck className="h-3 w-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="h-3 w-3 animate-pulse" />
                              <span>Suspended</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          disabled={isSelf || isUpdating}
                          onClick={() => handleUpdateStatus(user.id, user.accountStatus)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all shadow-sm border ${
                            user.accountStatus === "ACTIVE"
                              ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                              : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                          } disabled:opacity-40`}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : user.accountStatus === "ACTIVE" ? (
                            <>
                              <UserX className="h-3.5 w-3.5" />
                              <span>Suspend</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Unsuspend</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
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
                className="p-1.5 rounded-[6px] border border-slate-250 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-all bg-white shadow-sm"
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
