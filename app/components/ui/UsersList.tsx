"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import {
  createUserByAdminAction,
  updateUserRoleAction,
  deleteUserAction,
} from "@/app/[lang]/app/settings/actions";
import type { ProfileWithUser } from "@/lib/supabase/types";
import type { UserRole } from "@/lib/supabase/types";
import { Button } from "@/app/components/ui/Button";
import { PlusIcon, AlertCircleIcon, ChevronDownIcon } from "@/app/components/icons/Icons";

type UsersListProps = {
  users: ProfileWithUser[];
  currentUserId: string;
  lang: string;
  copy: {
    title: string;
    subtitle: string;
    invite: string;
    name: string;
    email: string;
    role: string;
    joined: string;
    lastLogin: string;
    admin: string;
    member: string;
    delete: string;
    changeRole: string;
    deleteConfirm: string;
    userInvited: string;
    roleUpdated: string;
    userDeleted: string;
    errors: {
      required: string;
      invalidEmail: string;
      generic: string;
      exists: string;
    };
  };
};

function InviteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" disabled={pending}>
      <PlusIcon className="size-4" />
      {pending ? "..." : "Invitar"}
    </Button>
  );
}

function RoleBadge({ role, labels }: { role: UserRole; labels: { admin: string; member: string } }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
        role === "admin"
          ? "bg-accent-2/15 text-accent-2 ring-accent-2/30"
          : "bg-white/10 text-white/55 ring-white/10"
      }`}
    >
      {role === "admin" ? labels.admin : labels.member}
    </span>
  );
}

export function UsersList({ users, currentUserId, lang, copy }: UsersListProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("member");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [openRoleMenu, setOpenRoleMenu] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
  }

  async function handleInvite(formData: FormData) {
    setInviteError(null);
    const result = await createUserByAdminAction(_prev, formData);
    if (result.ok) {
      setInviteSuccess(true);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("member");
      showToast(copy.userInvited, "success");
      window.location.reload();
    } else if (result.message === "exists") {
      setInviteError(copy.errors.exists);
    } else {
      setInviteError(copy.errors.generic);
    }
  }

  async function handleRoleChange(profileId: string, newRole: UserRole) {
    const formData = new FormData();
    formData.set("lang", lang);
    formData.set("profileId", profileId);
    formData.set("role", newRole);
    const result = await updateUserRoleAction(_prev, formData);
    if (result.ok) {
      showToast(copy.roleUpdated, "success");
      setOpenRoleMenu(null);
      window.location.reload();
    } else {
      showToast(copy.errors.generic, "error");
    }
  }

  async function handleDelete(profileId: string) {
    const formData = new FormData();
    formData.set("lang", lang);
    formData.set("profileId", profileId);
    const result = await deleteUserAction(_prev, formData);
    if (result.ok) {
      showToast(copy.userDeleted, "success");
      setDeleteConfirmId(null);
      window.location.reload();
    } else {
      showToast(copy.errors.generic, "error");
    }
  }

  const _prev = { ok: false, message: "idle" as const };

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            toast.type === "success"
              ? "bg-success/15 text-success"
              : "bg-error/15 text-error"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex justify-end">
        <Button size="md" onClick={() => setShowInviteModal(true)}>
          <PlusIcon className="size-4" />
          {copy.invite}
        </Button>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass-strong w-full max-w-md rounded-2xl p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">{copy.invite}</h2>
            <form
              action={handleInvite}
              onSubmit={() => {
                const formData = new FormData();
                formData.set("lang", lang);
                formData.set("email", inviteEmail);
                formData.set("name", inviteName);
                formData.set("role", inviteRole);
                handleInvite(formData);
              }}
              className="flex flex-col gap-4"
            >
              <input type="hidden" name="lang" value={lang} />
              <input type="hidden" name="email" value={inviteEmail} />
              <input type="hidden" name="name" value={inviteName} />
              <input type="hidden" name="role" value={inviteRole} />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-white/70">
                  {copy.name}
                  <input
                    type="text"
                    name="name_display"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder={copy.name}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-white/70">
                  {copy.email}
                  <input
                    type="email"
                    name="email_display"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-white/70">
                  {copy.role}
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-white/20 focus:outline-none"
                  >
                    <option value="member">{copy.member}</option>
                    <option value="admin">{copy.admin}</option>
                  </select>
                </label>
              </div>

              {inviteError && (
                <p className="text-sm text-error">{inviteError}</p>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteError(null);
                  }}
                >
                  Cancel
                </Button>
                <InviteButton />
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-white/40">
              <th className="px-5 py-3 font-medium">{copy.name}</th>
              <th className="px-5 py-3 font-medium">{copy.email}</th>
              <th className="px-5 py-3 font-medium">{copy.role}</th>
              <th className="px-5 py-3 font-medium">{copy.joined}</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id} className="text-white/80">
                <td className="px-5 py-3.5">
                  <span className="font-medium text-white">
                    {u.company_name || u.email}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-white/65">{u.email}</td>
                <td className="px-5 py-3.5">
                  <RoleBadge role={u.role} labels={{ admin: copy.admin, member: copy.member }} />
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-white/50">
                  {new Date(u.created_at).toLocaleDateString(lang, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    {u.id !== currentUserId ? (
                      <>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenRoleMenu(openRoleMenu === u.id ? null : u.id)
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
                          >
                            {copy.changeRole}
                            <ChevronDownIcon className="size-3" />
                          </button>
                          {openRoleMenu === u.id && (
                            <div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#060814]/95 py-1 shadow-xl">
                              <button
                                type="button"
                                onClick={() => handleRoleChange(u.id, "admin")}
                                className="flex w-full items-center px-3 py-2 text-left text-xs text-white/70 hover:bg-white/[0.05] hover:text-white"
                              >
                                {copy.admin}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRoleChange(u.id, "member")}
                                className="flex w-full items-center px-3 py-2 text-left text-xs text-white/70 hover:bg-white/[0.05] hover:text-white"
                              >
                                {copy.member}
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(u.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-error/30 bg-error/10 px-3 py-1.5 text-xs text-error transition-colors hover:bg-error/20"
                        >
                          <AlertCircleIcon className="size-3" />
                          {copy.delete}
                        </button>
                        {deleteConfirmId === u.id && (
                          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="glass-strong w-full max-w-sm rounded-2xl p-6">
                              <p className="mb-4 text-sm text-white/70">
                                {copy.deleteConfirm}
                              </p>
                              <div className="flex justify-end gap-3">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="md"
                                  onClick={() => setDeleteConfirmId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  size="md"
                                  onClick={() => handleDelete(u.id)}
                                  className="bg-error text-white hover:bg-error/80"
                                >
                                  {copy.delete}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-white/40">You</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
