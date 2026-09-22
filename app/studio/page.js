"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";

export default function Studio() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mine, setMine] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [err, setErr] = useState("");

  async function load(uid) {
    const { data } = await supabase
      .from("pieces")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setMine(data || []);
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      const { data: prof } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
      if (!prof) {
        const handle = data.user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24);
        await supabase.from("profiles").upsert({
          id: data.user.id,
          handle: handle || `reader${data.user.id.slice(0, 6)}`,
          display_name: handle,
        });
      }
      load(data.user.id);
    });
  }, [router]);

  async function save(e) {
    e.preventDefault();
    setErr("");
    const { error } = await supabase.from("pieces").insert({
      user_id: user.id,
      title: title.trim() || "Untitled",
      body: body.trim(),
      is_public: isPublic,
    });
    if (error) {
      setErr(error.message);
      return;
    }
    setTitle("");
    setBody("");
    setIsPublic(false);
    load(user.id);
  }

  async function toggle(p) {
    await supabase.from("pieces").update({ is_public: !p.is_public }).eq("id", p.id);
    load(user.id);
  }

  async function remove(p) {
    await supabase.from("pieces").delete().eq("id", p.id);
    load(user.id);
  }

  if (!user) return null;

  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="mark">Kiln</Link>
        <div className="nav-links">
          <Link href="/">Floor</Link>
          <button className="btn ghost" onClick={() => supabase.auth.signOut().then(() => router.push("/"))}>
            Sign out
          </button>
        </div>
      </nav>

      <motion.form onSubmit={save} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="kicker">Studio</div>
        <h1 style={{ fontSize: 48 }}>New piece</h1>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
        <label>Body</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} required />
        <div className="row">
          <label className="toggle">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Mark public — shows on the floor
          </label>
          <button className="btn" type="submit">Save</button>
        </div>
        {err && <div className="error">{err}</div>}
      </motion.form>

      <h2 style={{ marginTop: 56 }}>Your shelf</h2>
      <div className="grid">
        {mine.map((p) => (
          <article key={p.id} className="card">
            <h3>{p.title}</h3>
            <p>{(p.body || "").slice(0, 120)}</p>
            <div className="meta">{p.is_public ? "Public" : "Private"}</div>
            <div className="row">
              <button className="btn ghost" onClick={() => toggle(p)}>
                {p.is_public ? "Make private" : "Make public"}
              </button>
              <button className="btn ghost" onClick={() => remove(p)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
