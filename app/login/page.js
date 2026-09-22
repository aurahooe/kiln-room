"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [mode, setMode] = useState("in");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          const slug = (handle || email.split("@")[0]).toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24);
          await supabase.from("profiles").upsert({
            id: data.user.id,
            handle: slug || `reader${data.user.id.slice(0, 6)}`,
            display_name: handle || slug,
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.push("/studio");
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="mark">Kiln</Link>
        <div className="nav-links"><Link href="/">Floor</Link></div>
      </nav>
      <motion.form
        className="panel"
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="kicker">{mode === "in" ? "Return" : "First firing"}</div>
        <h1 style={{ fontSize: 42 }}>{mode === "in" ? "Sign in" : "Make a seat"}</h1>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} />
        {mode === "up" && (
          <>
            <label>Handle</label>
            <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="how you appear" />
          </>
        )}
        {err && <div className="error">{err}</div>}
        <div className="row">
          <button className="btn" disabled={busy} type="submit">
            {busy ? "Working…" : mode === "in" ? "Enter" : "Create"}
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
          >
            {mode === "in" ? "Need a seat?" : "Already have one"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
