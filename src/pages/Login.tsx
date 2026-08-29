import { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/useAuth";

const SOLAR_BG_URL =
  "https://i.pinimg.com/736x/05/71/c5/0571c517cd15ffd72db82206456b133a.jpg";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo =
    (location.state as { from?: Location })?.from?.pathname || "/";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter both Admin ID and password");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes panSlow {
          from { background-position: 0% 50%; }
          to { background-position: 100% 50%; }
        }
        .login-card { animation: fadeSlideIn 0.5s ease-out both; }
        .login-logo { animation: floatLogo 4s ease-in-out infinite; }
        .login-hero-bg { animation: panSlow 24s ease-in-out infinite alternate; background-size: 130% 130%; }
      `}</style>

      {/* Left hero panel */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden lg:flex">
        {/* Blurred background image layer — scaled up so the blur doesn't reveal edges */}
        <div
          className="login-hero-bg absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${SOLAR_BG_URL}')`,
            filter: "blur(0px) saturate(1.5)",
            transform: "scale(1.1)",
          }}
        />
        {/* Frosted glass tint over the blurred image */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-linear-to-b from-white/5 via-transparent to-black/40" />

        {/* Content sits crisp on top of the glass layer */}
        <div className="relative flex flex-col items-center px-10 text-center">
          <div className="login-logo flex h-32 w-32 items-center justify-center rounded-full border border-white/25 bg-white/10 shadow-xl backdrop-blur-md">
            <img
              src="/pvprotectlogo.png"
              alt="PVProtect"
              className="h-24 w-24 rounded-full object-contain"
            />
          </div>

          <h2 className="mt-10 max-w-md text-2xl font-bold leading-snug text-white drop-shadow-md">
            Setup your solar health in a couple of clicks!
          </h2>
          <p className="mt-3 max-w-sm text-white/85 drop-shadow-sm">
            Monitor and manage solar performance easily!
          </p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex w-full flex-col items-center justify-center bg-bg px-6 lg:w-1/2">
        <div className="login-card w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-surface3 bg-surface2">
              <img
                src="/pvprotectlogo.png"
                alt="PVProtect"
                className="h-12 w-12 rounded-full object-contain"
              />
            </div>
          </div>

          <h1 className="mb-6 text-center text-xl text-hi">
            Login to{" "}
            <span className="text-gold font-bold">
              <u>PVPROTECT</u>
            </span>
          </h1>

          {error && (
            <div className="mb-4 rounded-sm border border-danger/40 bg-danger/10 px-3.5 py-2.5 font-mono text-[12px] text-danger animate-[fadeSlideIn_0.3s_ease-out]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-faint"
              >
                Email ID
              </label>
              <input
                id="email"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pvaccc60490"
                className="w-full rounded-sm border border-surface3 bg-surface2 px-3 py-2 text-[13px] text-hi outline-none transition-colors duration-200 focus:border-gold"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-faint"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-sm border border-surface3 bg-surface2 px-3 py-2 pr-10 text-[13px] text-hi outline-none transition-colors duration-200 focus:border-gold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition-colors duration-200 hover:text-hi"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <a
                href="/forgot-password"
                className="font-mono text-[11px] text-gold transition-opacity hover:opacity-80 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-sm bg-gold px-3.5 py-2.5 font-mono text-[12px] font-medium uppercase tracking-wide text-bg transition-all duration-200 hover:scale-[1.01] hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
            >
              {submitting ? "Signing in…" : "Sign in as admin"}
            </button>
          </form>

          {/* <p className="mt-6 text-center font-mono text-[11px] text-faint">
            For more information, <a href="/contact" className="text-gold underline transition-opacity hover:opacity-80">Contact us</a>.
          </p> */}
        </div>
      </div>
    </div>
  );
}
