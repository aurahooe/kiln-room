"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [pieces, setPieces] = useState([]);
  const [edition, setEdition] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });

    supabase
      .from("pieces")
      .select("id,title,body,created_at,profiles:user_id(handle,display_name)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(24)
      .then(({ data }) => setPieces(data || []));

    supabase
      .from("hourly_features")
      .select("id,hour_key,note,created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => setEdition(data?.[0] || null));

    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="mark">Kiln</Link>
        <div className="nav-links">
          <Link href="/studio">Studio</Link>
          {user ? (
            <button className="btn ghost" onClick={() => supabase.auth.signOut()}>
              Sign out
            </button>
          ) : (
            <Link href="/login">Enter</Link>
          )}
        </div>
      </nav>

      <section className="hero">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="kicker">Open floor · public only</div>
          <h1>Write it.<br />Fire it.<br />Leave it out.</h1>
          <p className="lede">
            Private drafts stay in your studio. Anything you mark public
            walks onto the floor for anyone passing through.
          </p>
        </motion.div>

        <motion.aside
          className="hour-card"
          initial={{ opacity: 0, rotate: -4, y: 16 }}
          animate={{ opacity: 1, rotate: -0.6, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <small>This hour</small>
          <h2 style={{ margin: "0 0 8px", fontSize: 26 }}>
            {edition?.hour_key || new Date().toISOString().slice(0, 13)}
          </h2>
          <p style={{ margin: 0, lineHeight: 1.45 }}>
            {edition?.note ||
              "The kiln is warm. Public pieces land here as they are marked."}
          </p>
        </motion.aside>
      </section>

      <div className="grid">
        {pieces.map((p, i) => (
          <motion.article
            key={p.id}
            className="card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i, duration: 0.45 }}
          >
            <Link href={`/p/${p.id}`}>
              <h3>{p.title || "Untitled"}</h3>
              <p>{(p.body || "").slice(0, 140)}{(p.body || "").length > 140 ? "…" : ""}</p>
              <div className="meta">
                {(p.profiles?.display_name || p.profiles?.handle || "anon")} ·{" "}
                {new Date(p.created_at).toLocaleString()}
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
