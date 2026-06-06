import { useState } from "react";
import { supabase } from "./supabase";

export default function Login({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <main className="login">
      {onClose && (
        <button className="button login-close" onClick={onClose}>
          ← Torna
        </button>
      )}
      <h1>Cash Mate</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button className="button button--confirm" type="submit" disabled={loading}>
          {loading ? "Accesso..." : "Accedi"}
        </button>
        {error && <span className="save-error">{error}</span>}
      </form>
    </main>
  );
}
