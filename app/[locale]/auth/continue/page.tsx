import { notFound } from "next/navigation";
import { isLocale } from "../../../i18n/config";
import { progressCopy } from "../../../lib/progress/copy";
import { safeRelativeReturnPath } from "../../../lib/local-chatgpt-auth";
import { GOOGLE_START_PATH, isGoogleOAuthConfigured } from "../../../lib/google-oauth";

export const dynamic = "force-dynamic";

export default async function ContinuePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ return_to?: string; error?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const copy = progressCopy(locale);
  const returnTo = safeRelativeReturnPath(query.return_to ?? `/${locale}`);
  const googleHref = `${GOOGLE_START_PATH}?return_to=${encodeURIComponent(returnTo)}`;
  const googleEnabled = isGoogleOAuthConfigured();

  return (
    <main className="auth-continue">
      <section className="learning-modal pg-onboarding" aria-labelledby="auth-continue-title">
        <em>{copy.onboarding.eyebrow}</em>
        <h1 id="auth-continue-title">{copy.continueTitle}</h1>
        <p className="pg-onboarding-sub">{copy.continueSubtitle}</p>
        {query.error === "google" ? (
          <p className="pg-note" role="alert">{copy.continueGoogleError}</p>
        ) : query.error ? (
          <p className="pg-note" role="alert">{copy.continueEmailError}</p>
        ) : null}
        {googleEnabled ? (
          <a className="auth-google" href={googleHref}>
            <GoogleMark />
            {copy.continueGoogle}
          </a>
        ) : null}
        {googleEnabled ? <p className="auth-divider">{copy.continueEmailDivider}</p> : null}
        <form action="/api/auth/session" method="post" className="auth-continue-form">
          <input type="hidden" name="returnTo" value={returnTo} />
          <label>
            <span>{copy.continueName}</span>
            <input name="fullName" type="text" autoComplete="name" required maxLength={80} />
          </label>
          <label>
            <span>{copy.continueEmail}</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={120}
              placeholder={copy.continueEmailPlaceholder}
            />
          </label>
          <div className="pg-onboarding-actions">
            <button type="submit" className="lesson-button">{copy.continueSubmit}</button>
          </div>
        </form>
        <form action="/api/auth/session" method="post">
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="demo" value="1" />
          <button type="submit" className="auth-demo">{copy.continueDemo}</button>
        </form>
      </section>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.86 2.7-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.41 5.41 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.03l2.99-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58Z" />
    </svg>
  );
}
