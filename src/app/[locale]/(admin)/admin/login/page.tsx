import { buttonVariants } from "@/components/ui/button";

const AdminLoginPage = () => {
  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8">
      <p className="text-xs tracking-[0.4em] text-slate-400 uppercase">
        Admin Login
      </p>
      <h1 className="text-4xl font-semibold">Secure access</h1>
      <p className="text-slate-300">
        Two-step verification is required. Use your admin email to receive a
        one-time passcode.
      </p>
      <form className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="admin-email">
            Work email
          </label>
          <input
            id="admin-email"
            type="email"
            placeholder="ops@kimistore.com"
            className="w-full rounded-2xl border border-white/20 bg-slate-900/40 px-4 py-3 text-white"
          />
        </div>
        <button
          className={buttonVariants({
            className: "w-full bg-white text-slate-900",
          })}
        >
          Send OTP
        </button>
      </form>
      <p className="text-xs text-slate-400">
        Issues signing in? Reach security@kimistore.com for manual reset.
      </p>
    </div>
  );
};

export default AdminLoginPage;
