import { useState } from "react";
import { createLocalAccount, signInLocalAccount } from "../utils/auth";
import { isCloudConfigured } from "../utils/cloud";
import "./auth.css";

function AuthGate({ onAuthenticated }) {
  const [isCreating, setIsCreating] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (isCreating && password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setNotice("");
    setBusy(true);
    try {
      if (isCreating) {
        const created = await createLocalAccount({ name, email, password });
        if (created?.requiresEmailConfirmation) {
          setNotice(
            created.confirmationMessage ||
              "Check your email to confirm your account, then sign in."
          );
          setIsCreating(false);
          setPassword("");
          setConfirmPassword("");
          return;
        }

        const profile = created?.profile || created;
        if (!profile?.id) {
          throw new Error("The account was created but sign-in could not be completed. Try signing in.");
        }
        onAuthenticated(profile);
      } else {
        const profile = await signInLocalAccount({ email, password });
        onAuthenticated(profile);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setIsCreating((current) => !current);
    setError("");
    setNotice("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <span className="auth-logo" aria-hidden="true">⚡</span>
          <span>TYPEQUEST</span>
        </div>

        <p className="auth-eyebrow">YOUR PERSONAL TYPING RPG</p>
        <h1 id="auth-title">{isCreating ? "Create your player" : "Welcome back"}</h1>
        <p className="auth-description">
          {isCreating
            ? "Start your journey, save your progress, and unlock new typing challenges."
            : "Sign in to continue exactly where your last session ended."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isCreating && (
            <label className="auth-field">
              <span>Player name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                minLength={2}
                maxLength={40}
                required
              />
            </label>
          )}

          <label className="auth-field">
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={254}
              required
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isCreating ? "At least 8 characters" : "Enter your password"}
              autoComplete={isCreating ? "new-password" : "current-password"}
              minLength={isCreating ? 8 : undefined}
              maxLength={128}
              required
            />
          </label>

          {isCreating && (
            <label className="auth-field">
              <span>Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter the password again"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
              />
            </label>
          )}

          {error && <p className="auth-error" role="alert">{error}</p>}
          {notice && <p className="auth-notice" role="status">{notice}</p>}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy
              ? "Please wait..."
              : isCreating
                ? "CREATE PLAYER PROFILE  →"
                : "SIGN IN  →"}
          </button>
        </form>

        <div className="auth-switch">
          <span>{isCreating ? "Already have a profile on this device?" : "New to TypeQuest?"}</span>
          <button type="button" onClick={switchMode}>
            {isCreating ? "Sign in" : "Create profile"}
          </button>
        </div>

        <div className="auth-local-note">
          <span aria-hidden="true">🔒</span>
          <p>
            <strong>{isCloudConfigured() ? "Cloud account and private saves" : "Device-local profile"}</strong>
            <br />
            {isCloudConfigured()
              ? "Your account uses Supabase Auth and saves sync to your TypeQuest cloud database when configured. Keep your password private."
              : "Profiles, passwords verifiers, scores, XP, themes and history stay on this device. Cloud sync is ready to configure using .env.example; browser/app data clearing may erase local saves."}
          </p>
        </div>
      </section>
      <p className="auth-footer">TYPE FAST. STAY CONSISTENT. LEVEL UP.</p>
    </main>
  );
}

export default AuthGate;
