import { notFound } from "next/navigation";

import {
  inviteAdminUser,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "@/actions/admin/admin-users";
import { AdminModuleTemplate } from "@/components/admin-module-template";
import { buttonVariants } from "@/components/ui/button";
import { getAdminUsers } from "@/lib/data/admin";
import { getAdminModuleBySlug } from "@/lib/data/storefront/index";
import { formatDate as formatDateValue } from "@/lib/formatters";

const roleOptions = [
  { value: "all", label: "All roles" },
  { value: "owner", label: "Owner" },
  { value: "editor", label: "Editor" },
  { value: "analyst", label: "Analyst" },
  { value: "support", label: "Support" },
];

const roleFilterValues = [
  "all",
  "owner",
  "editor",
  "analyst",
  "support",
] as const;
type RoleFilter = (typeof roleFilterValues)[number];
const isRoleFilter = (value: string): value is RoleFilter =>
  roleFilterValues.includes(value as RoleFilter);

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "disabled", label: "Disabled" },
];

const statusFilterValues = ["all", "active", "pending", "disabled"] as const;
type StatusFilter = (typeof statusFilterValues)[number];
const isStatusFilter = (value: string): value is StatusFilter =>
  statusFilterValues.includes(value as StatusFilter);

const formatDate = (date?: Date | null) => {
  if (!date) return "—";
  return formatDateValue(date, {
    locale: "en",
    dateStyle: "medium",
    timeStyle: "short",
  });
};

type AdminUsersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const AdminUsersPage = async ({
  params,
  searchParams,
}: AdminUsersPageProps) => {
  const { locale } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const query =
    typeof resolvedSearchParams.query === "string"
      ? resolvedSearchParams.query
      : "";
  const rawRole =
    typeof resolvedSearchParams.role === "string"
      ? resolvedSearchParams.role
      : "all";
  const rawStatus =
    typeof resolvedSearchParams.status === "string"
      ? resolvedSearchParams.status
      : "all";

  const normalizedRole: RoleFilter = isRoleFilter(rawRole) ? rawRole : "all";
  const normalizedStatus: StatusFilter = isStatusFilter(rawStatus)
    ? rawStatus
    : "all";

  const [adminModule, adminUsers] = await Promise.all([
    getAdminModuleBySlug("admin-users"),
    getAdminUsers({
      search: query,
      role: normalizedRole,
      status: normalizedStatus,
      limit: 50,
    }),
  ]);

  if (!adminModule) {
    notFound();
  }

  const metrics = adminUsers.reduce(
    (acc, user) => {
      acc.total += 1;
      if (user.status === "active") acc.active += 1;
      if (user.status === "pending") acc.pending += 1;
      if (user.mfaEnabled) acc.mfa += 1;
      return acc;
    },
    { total: 0, active: 0, pending: 0, mfa: 0 },
  );

  const roleValues = roleOptions.filter((option) => option.value !== "all");

  return (
    <AdminModuleTemplate module={adminModule}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Access control
            </h2>
            <p className="text-sm text-slate-300">
              Track invites, enforce MFA, and keep admin roles current.
            </p>
          </div>
          <form
            method="get"
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <input
              type="text"
              name="query"
              placeholder="Search name or email"
              defaultValue={query}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500"
            />
            <select
              name="role"
              defaultValue={rawRole}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={rawStatus}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className={buttonVariants({
                  size: "sm",
                  className: "bg-white/90 text-slate-900",
                })}
              >
                Apply filters
              </button>
              <a
                href={`/${locale}/admin/admin-users`}
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "border border-white/20 text-white",
                })}
              >
                Reset
              </a>
            </div>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Total admins</p>
            <p className="text-2xl font-semibold text-white">{metrics.total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Active</p>
            <p className="text-2xl font-semibold text-emerald-200">
              {metrics.active}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Pending</p>
            <p className="text-2xl font-semibold text-sky-200">
              {metrics.pending}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">MFA adoption</p>
            <p className="text-2xl font-semibold text-white">
              {metrics.total > 0
                ? `${Math.round((metrics.mfa / metrics.total) * 100)}%`
                : "0%"}
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Admin directory
            </h3>
            <p className="text-xs text-slate-400">
              {adminUsers.length} result{adminUsers.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            {adminUsers.length === 0 ? (
              <p className="text-sm text-slate-400">
                No teammates match the filters.
              </p>
            ) : (
              <table className="w-full border-collapse text-sm text-slate-200">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-400 uppercase">
                    <th className="py-2 pr-4 text-left">Admin</th>
                    <th className="py-2 pr-4 text-left">Role</th>
                    <th className="py-2 pr-4 text-left">Teams</th>
                    <th className="py-2 pr-4 text-left">MFA</th>
                    <th className="py-2 pr-4 text-left">Status</th>
                    <th className="py-2 pr-4 text-left">Last login</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-3 pr-4 align-top">
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                        <p className="text-xs text-slate-500">
                          {user.location}
                        </p>
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <form
                          action={updateAdminUserRole}
                          className="flex flex-col gap-2 md:flex-row md:items-center"
                        >
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="userId" value={user.id} />
                          <select
                            name="role"
                            defaultValue={user.role}
                            className="rounded-lg border border-white/10 bg-slate-900/60 px-2 py-1 text-xs text-white"
                          >
                            {roleValues.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                              className: "border-white/20 text-white",
                            })}
                          >
                            Update
                          </button>
                        </form>
                      </td>
                      <td className="py-3 pr-4 align-top text-slate-300">
                        <div className="flex flex-wrap gap-1">
                          {user.teams.map((team) => (
                            <span
                              key={team}
                              className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-200"
                            >
                              {team}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${user.mfaEnabled ? "bg-emerald-500/20 text-emerald-100" : "bg-amber-500/20 text-amber-100"}`}
                        >
                          {user.mfaEnabled ? "Enabled" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            user.status === "active"
                              ? "bg-emerald-500/20 text-emerald-100"
                              : user.status === "pending"
                                ? "bg-sky-500/20 text-sky-100"
                                : "bg-slate-600/30 text-slate-200"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 align-top text-slate-300">
                        {user.status === "pending"
                          ? `Invited ${formatDate(user.invitedAt)}`
                          : formatDate(user.lastLoginAt)}
                      </td>
                      <td className="space-y-2 py-3 pr-0 text-right align-top">
                        <form
                          action={updateAdminUserStatus}
                          className="inline-flex w-full justify-end"
                        >
                          <input type="hidden" name="locale" value={locale} />
                          <input type="hidden" name="userId" value={user.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={
                              user.status === "active" ? "disabled" : "active"
                            }
                          />
                          <button
                            className={buttonVariants({
                              variant:
                                user.status === "active"
                                  ? "outline"
                                  : "default",
                              size: "sm",
                              className:
                                user.status === "active"
                                  ? "border-white/30 text-white"
                                  : "bg-white/90 text-slate-900",
                            })}
                          >
                            {user.status === "active" ? "Disable" : "Activate"}
                          </button>
                        </form>
                        {user.status === "pending" && (
                          <form
                            action={inviteAdminUser}
                            className="inline-flex w-full justify-end"
                          >
                            <input type="hidden" name="locale" value={locale} />
                            <input
                              type="hidden"
                              name="name"
                              value={user.name}
                            />
                            <input
                              type="hidden"
                              name="email"
                              value={user.email}
                            />
                            <input
                              type="hidden"
                              name="role"
                              value={user.role}
                            />
                            <button
                              className={buttonVariants({
                                variant: "ghost",
                                size: "sm",
                                className: "border border-white/20 text-white",
                              })}
                            >
                              Resend invite
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <h3 className="text-lg font-semibold text-white">Invite admin</h3>
            <p className="text-sm text-slate-400">
              Send a secure invite with role-based permissions and MFA
              requirements.
            </p>
            <form action={inviteAdminUser} className="mt-4 space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <label className="text-xs text-slate-400 uppercase">
                Full name
              </label>
              <input
                name="name"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              />
              <label className="text-xs text-slate-400 uppercase">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              />
              <label className="text-xs text-slate-400 uppercase">Role</label>
              <select
                name="role"
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              >
                {roleValues.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                className={buttonVariants({
                  size: "sm",
                  className: "w-full bg-white/90 text-slate-900",
                })}
              >
                Send invite
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <h3 className="text-lg font-semibold text-white">
              Security guardrails
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
              <li>
                Require MFA for owner/editor roles before enabling product
                access.
              </li>
              <li>Rotate pending invites weekly to prevent stale links.</li>
              <li>
                Log critical changes (discounts, payouts) for weekly review.
              </li>
            </ul>
            <p className="mt-4 text-xs text-slate-400">
              Connect to the SOC 2 logging stream for full audit exports.
            </p>
          </div>
        </section>
      </div>
    </AdminModuleTemplate>
  );
};

export default AdminUsersPage;
