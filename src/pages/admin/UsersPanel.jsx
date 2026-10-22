import React, { useEffect, useState } from "react";
import { Trash2, KeyRound } from "lucide-react";
import GlassCard from "../../components/GlassCard";
import { Select } from "../../components/FormField";
import { useAuth } from "../../context/AuthContext";
import { useActivityLog } from "../../context/ActivityLogContext";
import { useLang } from "../../context/LanguageContext";
import { WARDS, getWardById } from "../../data/geography";

const ALL_ROLES = ["Resident", "Volunteer", "Ward Admin", "Administrator"];

export default function UsersPanel() {
  const { t } = useLang();
  const { listUsers, updateUserRole, deleteUser, resetUserPassword, isAdministrator, user: current } = useAuth();
  const { log } = useActivityLog();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  // Only an Administrator can see or grant the Administrator role — a Ward
  // Admin managing users shouldn't even know it's an option. The backend
  // enforces this independently (routes/users.js — it also omits
  // Administrator accounts from the list entirely for non-Administrators),
  // this just keeps the UI from offering an action that would be rejected.
  const isSelfAdministrator = current?.role === "Administrator";
  const assignableRoles = isSelfAdministrator ? ALL_ROLES : ALL_ROLES.filter((r) => r !== "Administrator");

  const refresh = () => {
    listUsers()
      .then(setUsers)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRole = async (u, role) => {
    setError("");
    try {
      // Becoming a Volunteer needs a Ward — default to whatever they
      // already had (e.g. from registration), or the first Ward, and let
      // the admin adjust it right away via the Ward column that appears.
      const wardId = role === "Volunteer" ? u.wardId || WARDS[0].id : undefined;
      await updateUserRole(u.id, role, wardId);
      await log(current?.name || "Admin", `Changed ${u.name}'s role to ${role}`);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleWard = async (u, wardId) => {
    setError("");
    try {
      await updateUserRole(u.id, u.role, wardId);
      await log(current?.name || "Admin", `Moved volunteer ${u.name} to a different Ward`);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(t("admin.users.confirmDelete", { name: u.name }))) return;
    setError("");
    try {
      await deleteUser(u.id);
      await log(current?.name || "Admin", `Removed user ${u.name}`);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (u) => {
    const password = window.prompt(t("admin.users.resetPasswordPrompt", { name: u.name }));
    if (!password) return;
    setError("");
    try {
      await resetUserPassword(u.id, password);
      await log(current?.name || "Admin", `Reset ${u.name}'s password`);
      window.alert(t("admin.users.resetPasswordSuccess", { name: u.name }));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">{t("admin.users.title")}</h2>
      {error && <p className="mb-3 text-sm font-medium text-brand-red">{error}</p>}
      <GlassCard className="overflow-x-auto !p-0">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-400 dark:border-neutral-800">
              <th className="px-4 py-3">{t("admin.users.col.name")}</th>
              <th className="px-4 py-3">{t("admin.users.col.phone")}</th>
              <th className="px-4 py-3">{t("admin.users.col.ward")}</th>
              <th className="px-4 py-3">{t("admin.users.col.role")}</th>
              <th className="px-4 py-3 text-right">{t("admin.users.col.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {users.map((u) => {
              const canEditRole = isSelfAdministrator || u.role !== "Administrator";
              const rowOptions = canEditRole ? assignableRoles : [...assignableRoles, u.role];
              const canDelete = u.id !== current?.id && (isSelfAdministrator || u.role !== "Administrator");
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-semibold text-neutral-800 dark:text-neutral-100">{u.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{u.phone}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {u.role === "Volunteer" ? (
                      <Select
                        value={u.wardId || ""}
                        onChange={(e) => handleWard(u, e.target.value)}
                        className="!py-1.5 text-xs"
                      >
                        {WARDS.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </Select>
                    ) : (
                      u.wardId ? getWardById(u.wardId)?.name : "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={u.role}
                      onChange={(e) => handleRole(u, e.target.value)}
                      disabled={!canEditRole}
                      className="!py-1.5 text-xs"
                    >
                      {rowOptions.map((r) => (
                        <option key={r} value={r}>{t(`role.${r}`)}</option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {isAdministrator && (
                        <button
                          onClick={() => handleResetPassword(u)}
                          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          title={t("admin.users.resetPassword")}
                        >
                          <KeyRound size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={!canDelete}
                        className="rounded-lg p-1.5 text-brand-red hover:bg-red-50 disabled:opacity-30 dark:hover:bg-red-500/10"
                        title={t("admin.users.remove")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
