"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "../../../lib/supabase";

export default function PiecePage() {
  const { id } = useParams();
  const [piece, setPiece] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    supabase
      .from("pieces")
      .select("id,title,body,created_at,is_public,profiles:user_id(handle,display_name)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setMissing(true);
        else setPiece(data);
      });
  }, [id]);

  return (
    <div className="wrap">
      <nav className="nav">
        <Link href="/" className="mark">Kiln</Link>
        <div className="nav-links"><Link href="/">Floor</Link></div>
      </nav>
      {missing && <p>That piece is private or gone.</p>}
      {piece && (
        <motion.article
          className="piece"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="kicker">
            {piece.profiles?.display_name || piece.profiles?.handle || "anon"}
          </div>
          <h1>{piece.title}</h1>
          <p className="meta">{new Date(piece.created_at).toLocaleString()}</p>
          <div className="body">{piece.body}</div>
        </motion.article>
      )}
    </div>
  );
}
