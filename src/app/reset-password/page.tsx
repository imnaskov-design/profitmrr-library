export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background-dark px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,193,7,0.08)_0%,transparent_60%)]" />

      <main className="relative z-10 w-full max-w-[560px]">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#121212]/50 p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-2xl md:p-12">
          <div className="absolute -inset-10 rounded-full bg-primary/10 opacity-40 blur-[100px]" />

          <div className="relative z-10 space-y-8">
            <header className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Reset your password
              </h1>
              <p className="mt-3 text-sm text-white/50">
                Enter your email and we will send you a secure reset link.
              </p>
            </header>

            <form className="space-y-5">
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-white/15 bg-black/30 px-4 text-sm text-white placeholder:text-white/25 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-primary py-4 text-sm font-black uppercase tracking-widest text-background-dark shadow-lg shadow-primary/10 transition-all hover:bg-[#ffd54f] active:scale-[0.98]"
              >
                Send reset link
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

