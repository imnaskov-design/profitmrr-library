import Link from "next/link";

export default function ResetPasswordSuccessPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background-dark px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,193,7,0.08)_0%,transparent_60%)]" />

      <main className="relative z-10 w-full max-w-[620px]">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#121212]/60 p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-2xl md:p-14">
          <div className="absolute -inset-10 rounded-full bg-primary/10 opacity-40 blur-[100px]" />

          <div className="relative z-10 text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
              <span className="material-symbols-outlined text-4xl">verified</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Password reset successful
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/50">
              Your new password is active. Continue to login and access your member dashboard.
            </p>

            <div className="mt-8">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-black uppercase tracking-widest text-background-dark shadow-lg shadow-primary/10 transition-all hover:bg-[#ffd54f]"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

