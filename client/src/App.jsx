import { useEffect, useMemo, useState } from "react";

const API = const API = import.meta.env.VITE_API_URL || "/api";
const fallbackGames = [
  { id: "g1", title: "Cyber Strike", genre: "FPS", description: "Fast-paced tactical arena combat.", isFeatured: true, imageUrl: "" },
  { id: "g2", title: "Mythic Realms", genre: "RPG", description: "Explore a vast fantasy world and build your legend.", isFeatured: true, imageUrl: "" },
  { id: "g3", title: "Turbo Circuit", genre: "Racing", description: "High-speed racing across futuristic tracks.", imageUrl: "" },
  { id: "g4", title: "Shadow Tactics", genre: "Strategy", description: "Outthink your rivals in a tactical showdown.", imageUrl: "" }
];

export default function App() {
  const [games, setGames] = useState(fallbackGames);
  const [leaderboard, setLeaderboard] = useState([]);
  const [query, setQuery] = useState("");
  const [token, setToken] = useState(localStorage.getItem("arena_token") || "");
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch(`${API}/games`).then(r => r.json()).then(d => d.games && setGames(d.games)).catch(() => {});
    fetch(`${API}/leaderboard`).then(r => r.json()).then(d => d.leaderboard && setLeaderboard(d.leaderboard)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!token) { setUser(null); return; }
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject()).then(d => setUser(d.user))
      .catch(() => { localStorage.removeItem("arena_token"); setToken(""); });
  }, [token]);

  const filtered = useMemo(() => games.filter(g => `${g.title} ${g.genre}`.toLowerCase().includes(query.toLowerCase())), [games, query]);

  async function submitAuth(e) {
    e.preventDefault(); setNotice("");
    try {
      const response = await fetch(`${API}/auth/${authMode}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not sign in");
      localStorage.setItem("arena_token", data.token); setToken(data.token); setUser(data.user); setModal(false);
      setForm({ username: "", email: "", password: "" });
    } catch (err) { setNotice(err.message); }
  }

  function logout() { localStorage.removeItem("arena_token"); setToken(""); setUser(null); }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark">N</span> NEON<span>ARENA</span></a>
      <nav><a href="#games">Discover</a><a href="#leaderboard">Leaderboard</a><a href="#community">Community</a></nav>
      <div className="account">
        {user ? <><span className="user-tag">◉ {user.username}</span><button className="btn ghost small" onClick={logout}>Log out</button></> :
          <button className="btn primary small" onClick={() => { setAuthMode("login"); setModal(true); }}>Sign in</button>}
      </div>
    </header>

    <main>
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse"></span> YOUR NEXT LEVEL STARTS HERE</div>
          <h1>PLAY HARD.<br/><span>RISE HIGHER.</span></h1>
          <p>Find your next obsession, climb the ranks, and join a community built for players.</p>
          <div className="hero-actions"><a className="btn primary" href="#games">Explore games <b>↗</b></a><a className="btn outline" href="#leaderboard">View rankings</a></div>
          <div className="hero-stats"><div><strong>04</strong><small>FEATURED GAMES</small></div><i></i><div><strong>∞</strong><small>WAYS TO PLAY</small></div><i></i><div><strong>01</strong><small>YOUR ARENA</small></div></div>
        </div>
        <div className="hero-art" aria-label="Abstract neon gaming artwork"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="core"><span>NA</span></div><div className="float-label label-top">SYSTEM ONLINE <b>●</b></div><div className="float-label label-bottom">ENTER THE ARENA <b>↗</b></div></div>
        <div className="hero-index">01 / DISCOVER</div>
      </section>

      <section className="section" id="games">
        <div className="section-head"><div><div className="eyebrow">THE GAME VAULT</div><h2>Find your <span>next game.</span></h2></div><label className="search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search games or genres..." /></label></div>
        <div className="game-grid">{filtered.map((g, i) => <article className={`game-card card-${i % 4}`} key={g.id}>
          <div className="game-visual"><div className="visual-symbol">{["✦","◈","⌁","⬡"][i % 4]}</div><span className="game-number">0{i + 1}</span><span className="game-type">{g.genre}</span></div>
          <div className="game-info"><div><h3>{g.title}</h3><p>{g.description}</p></div><span className="arrow">↗</span></div>
          {g.isFeatured && <span className="featured">FEATURED</span>}
        </article>)}</div>
        {filtered.length === 0 && <p className="empty">No games match that search. Try another title or genre.</p>}
      </section>

      <section className="rank-section" id="leaderboard"><div className="rank-intro"><div className="eyebrow">PROVE YOUR SKILL</div><h2>The arena<br/><span>never sleeps.</span></h2><p>Every match is a chance to make your mark. Keep playing, keep improving, and earn your place among the best.</p><a href="#community" className="text-link">Meet the community ↗</a></div>
        <div className="leader-card"><div className="leader-head"><div><div className="eyebrow">GLOBAL RANKINGS</div><h3>Top players</h3></div><span className="live"><i></i> LIVE BOARD</span></div>
          {leaderboard.length ? leaderboard.slice(0, 5).map((entry, i) => <div className="leader-row" key={entry.id}><b className={`place place-${i+1}`}>{String(i+1).padStart(2,"0")}</b><div className="avatar">{entry.user.username.slice(0,1).toUpperCase()}</div><div className="player"><strong>{entry.user.username}</strong><small>{entry.game.title}</small></div><strong className="points">{entry.points.toLocaleString()} <small>PTS</small></strong></div>) :
          <div className="leader-empty"><span>✧</span><strong>Your name belongs here.</strong><p>Sign in, start playing, and be the first to claim a spot.</p></div>}
        </div>
      </section>

      <section className="community" id="community"><div className="community-glow"></div><div className="eyebrow">MORE THAN A GAME</div><h2>Find your people.<br/><span>Build your legend.</span></h2><p>Make your mark in a world made for players.</p><button className="btn primary" onClick={() => { setAuthMode("register"); setModal(true); }}>Join Neon Arena <b>↗</b></button></section>
    </main>

    <footer><a className="brand" href="#"><span className="brand-mark">N</span> NEON<span>ARENA</span></a><small>© 2026 NEON ARENA. GAME ON.</small><a href="#top">BACK TO TOP ↑</a></footer>

    {modal && <div className="modal-backdrop" onClick={() => setModal(false)}><form className="auth-modal" onSubmit={submitAuth} onClick={e => e.stopPropagation()}>
      <button type="button" className="modal-close" onClick={() => setModal(false)}>×</button><div className="eyebrow">WELCOME TO THE ARENA</div><h2>{authMode === "login" ? "Player sign in" : "Create your account"}</h2>
      {authMode === "register" && <input required minLength="3" maxLength="20" placeholder="Player name" value={form.username} onChange={e => setForm({...form, username:e.target.value})}/>}
      <input required type="email" placeholder="Email address" value={form.email} onChange={e => setForm({...form, email:e.target.value})}/>
      <input required type="password" minLength="8" placeholder="Password (8+ characters)" value={form.password} onChange={e => setForm({...form, password:e.target.value})}/>
      {notice && <p className="error">{notice}</p>}<button className="btn primary full">{authMode === "login" ? "Sign in" : "Create account"} ↗</button>
      <p className="switch-auth">{authMode === "login" ? "New to the arena?" : "Already have an account?"} <button type="button" onClick={() => {setAuthMode(authMode === "login" ? "register" : "login");setNotice("");}}>{authMode === "login" ? "Create account" : "Sign in"}</button></p>
    </form></div>}
  </div>;
}
