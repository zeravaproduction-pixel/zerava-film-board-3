
import { useEffect, useState } from 'react';
import {
  Activity, Film, Clapperboard, Users, MessageCircle,
  GraduationCap, Image, Bell, Search, Moon, Sun,
  Menu, X, Plus, Play, Bookmark, CalendarDays,
  Settings, LogOut, Camera, FolderKanban, Globe,
  LayoutDashboard, Send, Upload, ChevronRight,
  CircleUserRound, Shield, Sparkles
} from 'lucide-react';
import { supabase } from './lib/supabase';

type Tab = 'dashboard' | 'community' | 'production' | 'academy' | 'gallery' | 'profile';

const demoMembers = [
  { name: 'Raka Pratama', job: 'Director', initials: 'RP', color: '#8b6fc5' },
  { name: 'Nadia Putri', job: 'Script Writer', initials: 'NP', color: '#b77b91' },
  { name: 'Aditya Ramadhan', job: 'Cinematographer', initials: 'AR', color: '#588c9a' },
  { name: 'Fajar Mahendra', job: 'Editor', initials: 'FM', color: '#ae895c' },
];

const demoProjects = [
  { title: 'Di Balik Senja', type: 'Short Film', status: 'Pre-Production', progress: 35 },
  { title: 'The Last Frame', type: 'Short Film', status: 'Production', progress: 70 },
  { title: 'Ruang yang Hilang', type: 'Documentary', status: 'Development', progress: 15 },
];

const demoPosts = [
  { name: 'Nadia Putri', job: 'Script Writer', time: '12 menit lalu', text: 'Sedang mengembangkan ide cerita baru. Terkadang cerita terbaik berawal dari hal-hal sederhana.', tag: 'Writing', likes: 18 },
  { name: 'Aditya Ramadhan', job: 'Cinematographer', time: '1 jam lalu', text: 'Eksperimen lighting untuk project terbaru. Golden hour selalu punya cerita tersendiri.', tag: 'Behind The Scenes', likes: 32 },
];

const academy = [
  { title: 'Dasar Sinematografi', category: 'Cinematography', author: 'Raka Pratama', icon: '🎥' },
  { title: 'Mengenal Penulisan Skenario', category: 'Screenwriting', author: 'Nadia Putri', icon: '📝' },
  { title: 'Teknik Editing Film', category: 'Post Production', author: 'Fajar Mahendra', icon: '🎞️' },
  { title: 'Membangun Cerita Visual', category: 'Directing', author: 'Aditya Ramadhan', icon: '🎬' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [dark, setDark] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState(false);
  const [message, setMessage] = useState('');
  const [posts, setPosts] = useState(demoPosts);
  const [postText, setPostText] = useState('');
  const [saved, setSaved] = useState<string[]>([]);
  const [projects, setProjects] = useState(demoProjects);
  const [newProject, setNewProject] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    if (!supabase) {
      setMessage('Hubungkan Supabase terlebih dahulu untuk menggunakan akun.');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error?.message || 'Berhasil masuk.');
  };

  const signUp = async () => {
    if (!supabase) {
      setMessage('Hubungkan Supabase terlebih dahulu untuk mendaftar.');
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error?.message || 'Pendaftaran berhasil. Periksa email kamu.');
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    setUser(null);
  };

  const addPost = () => {
    if (!postText.trim()) return;
    setPosts([{ name: user?.email?.split('@')[0] || 'Anggota Zerava', job: 'Member', time: 'Baru saja', text: postText, tag: 'Community', likes: 0 }, ...posts]);
    setPostText('');
  };

  const addProject = () => {
    if (!newProject.trim()) return;
    setProjects([{ title: newProject, type: 'Short Film', status: 'Development', progress: 0 }, ...projects]);
    setNewProject('');
    setShowProjectForm(false);
  };

  const nav = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'production', label: 'Film Production', icon: Clapperboard },
    { id: 'academy', label: 'Film Academy', icon: GraduationCap },
    { id: 'gallery', label: 'Production Gallery', icon: Image },
    { id: 'profile', label: 'My Profile', icon: CircleUserRound },
  ] as const;

  const title = nav.find(n => n.id === tab)?.label || 'Overview';

  return (
    <div className={dark ? 'app dark' : 'app light'}>
      <aside className={`sidebar ${mobileMenu ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">Z</div>
          <div><strong>ZERAVA</strong><span>FILMBOARD</span></div>
          <button className="icon-btn close-menu" onClick={() => setMobileMenu(false)}><X /></button>
        </div>

        <div className="workspace"><span className="workspace-dot" /> ZERAVA PRODUCTION <ChevronRight size={14}/></div>
        <div className="nav-label">WORKSPACE</div>
        {nav.map(item => {
          const Icon = item.icon;
          return <button key={item.id} className={`nav-item ${tab === item.id ? 'active' : ''}`} onClick={() => { setTab(item.id); setMobileMenu(false); }}>
            <Icon size={18}/><span>{item.label}</span>
          </button>;
        })}

        <div className="nav-label">COMMUNITY</div>
        <button className="nav-item" onClick={() => setTab('community')}><MessageCircle size={18}/> Messages</button>
        <button className="nav-item" onClick={() => setTab('community')}><Globe size={18}/> Servers</button>

        <div className="sidebar-bottom">
          <div className="mini-profile">
            <div className="avatar">Z</div>
            <div className="mini-info"><strong>{user?.email?.split('@')[0] || 'Guest Member'}</strong><span>{user ? 'Member' : 'Demo mode'}</span></div>
            <Settings size={17}/>
          </div>
          {user ? <button className="nav-item" onClick={signOut}><LogOut size={17}/> Sign out</button> : <button className="nav-item" onClick={() => setLoginMode(true)}><CircleUserRound size={17}/> Login / Register</button>}
        </div>
      </aside>

      {mobileMenu && <div className="overlay" onClick={() => setMobileMenu(false)} />}

      <main className="main">
        <header className="topbar">
          <div className="top-left">
            <button className="icon-btn mobile-trigger" onClick={() => setMobileMenu(true)}><Menu /></button>
            <div><span className="eyebrow">ZERAVA PRODUCTION / WORKSPACE</span><h2>{title}</h2></div>
          </div>
          <div className="top-actions">
            <div className="search-box"><Search size={16}/><input placeholder="Cari sesuatu..." value={search} onChange={e => setSearch(e.target.value)}/></div>
            <button className="icon-btn" onClick={() => setDark(!dark)} title="Ganti tema">{dark ? <Sun/> : <Moon/>}</button>
            <button className="icon-btn notification" onClick={() => setMessage('Belum ada notifikasi baru.')}><Bell/><i /></button>
            <div className="top-avatar">{user?.email?.[0]?.toUpperCase() || 'Z'}</div>
          </div>
        </header>

        <div className="content">
          {tab === 'dashboard' && <>
            <section className="hero">
              <div className="hero-content">
                <span className="hero-kicker"><Sparkles size={13}/> THE CREATIVE SPACE OF ZERAVA</span>
                <h1>Every Frame<br/><em>Begins a Story.</em></h1>
                <p>Awal Sederhana Kelak Jadi Sinema.</p>
                <button className="primary-btn" onClick={() => setTab('production')}>Explore Production <ChevronRight size={16}/></button>
              </div>
              <div className="hero-decoration"><div className="film-ring">Z</div><span>EST. ZERAVA</span></div>
              <div className="hero-number">01 / 04</div>
            </section>

            <div className="section-heading"><div><span className="eyebrow">YOUR CREATIVE UNIVERSE</span><h2>Workspace Overview</h2></div><span className="live-pill"><i/> LIVE WORKSPACE</span></div>
            <div className="stats-grid">
              <Stat icon={<Users/>} label="Community Members" value="128" change="+12 this month"/>
              <Stat icon={<Film/>} label="Film Projects" value={String(projects.length).padStart(2,'0')} change="Across Zerava"/>
              <Stat icon={<Activity/>} label="Activities Today" value="24" change="Community updates"/>
              <Stat icon={<MessageCircle/>} label="Discussions" value="86" change="Shared conversations"/>
            </div>

            <div className="dashboard-grid">
              <section className="panel feed-panel">
                <div className="panel-heading"><div><span className="eyebrow">COMMUNITY PULSE</span><h3>Recent Activities</h3></div><button className="text-btn" onClick={() => setTab('community')}>View all <ChevronRight size={15}/></button></div>
                <div className="composer"><div className="avatar">Z</div><textarea value={postText} onChange={e => setPostText(e.target.value)} placeholder="Apa yang sedang kamu kerjakan hari ini?"/><button className="send-btn" onClick={addPost}><Send size={16}/></button></div>
                {posts.filter(p => !search || p.text.toLowerCase().includes(search.toLowerCase())).map((p,i) => <article className="post" key={i}><div className="post-avatar">{p.name[0]}</div><div className="post-body"><div className="post-meta"><strong>{p.name}</strong><span>{p.job} · {p.time}</span></div><p>{p.text}</p><div className="post-footer"><span className="tag">{p.tag}</span><button className="text-btn">♡ {p.likes}</button><button className="text-btn" onClick={() => setSaved([...saved,p.text])}><Bookmark size={14}/> Save</button></div></div></article>)}
              </section>

              <section className="panel side-panel"><div className="panel-heading"><div><span className="eyebrow">IN PROGRESS</span><h3>Active Projects</h3></div><button className="icon-btn small" onClick={() => setTab('production')}><ChevronRight/></button></div>
                {projects.slice(0,3).map((p,i) => <div className="project-mini" key={i}><div className="project-icon"><Film/></div><div className="project-info"><strong>{p.title}</strong><span>{p.type} · {p.status}</span><div className="progress"><i style={{width:`${p.progress}%`}}/></div></div><b>{p.progress}%</b></div>)}
                <button className="outline-btn full" onClick={() => setTab('production')}>All productions</button>
                <div className="divider"/>
                <div className="panel-heading"><div><span className="eyebrow">CREATIVE TEAM</span><h3>Members</h3></div><button className="text-btn" onClick={() => setTab('community')}>Explore</button></div>
                {demoMembers.slice(0,3).map(m => <div className="member-mini" key={m.name}><div className="member-avatar" style={{background:m.color}}>{m.initials}</div><div><strong>{m.name}</strong><span>{m.job}</span></div><i className="online-dot"/></div>)}
              </section>
            </div>
          </>}

          {tab === 'community' && <><PageIntro kicker="THE PEOPLE BEHIND THE FRAME" title="Our Community" desc="Tempat para kreator Zerava terhubung, berdiskusi, dan bertumbuh bersama."/><div className="stats-grid"><Stat icon={<Users/>} label="Members" value="128" change="Creative people"/><Stat icon={<Globe/>} label="Servers" value="08" change="Community spaces"/><Stat icon={<MessageCircle/>} label="Discussions" value="86" change="Conversations"/></div><div className="panel"><div className="panel-heading"><h3>Member Directory</h3><button className="primary-btn" onClick={() => setLoginMode(true)}><Plus size={15}/> Join Zerava</button></div><div className="member-grid">{demoMembers.filter(m=>!search||m.name.toLowerCase().includes(search.toLowerCase())).map(m=><div className="member-card" key={m.name}><div className="member-avatar large" style={{background:m.color}}>{m.initials}</div><h3>{m.name}</h3><p>{m.job}</p><span className="live-pill"><i/> Community member</span></div>)}</div></div><div className="panel"><div className="panel-heading"><h3>Community Servers</h3><button className="outline-btn" onClick={()=>setMessage('Pembuatan server memerlukan akun Supabase.')}> <Plus size={14}/> Create server</button></div><div className="server-row"><div className="server-icon">🎬</div><div><strong>Zerava Main Server</strong><span># general · # announcements · # filmmaking</span></div><ChevronRight/></div></div></>}

          {tab === 'production' && <><PageIntro kicker="FROM IDEATION TO THE FINAL CUT" title="Film Production" desc="Kelola ide, proyek, kru, dan perjalanan produksi film Zerava."/><div className="panel"><div className="panel-heading"><div><h3>All Productions</h3><span className="muted">Your creative projects</span></div><button className="primary-btn" onClick={()=>setShowProjectForm(!showProjectForm)}><Plus size={15}/> New Project</button></div>{showProjectForm&&<div className="inline-form"><input value={newProject} onChange={e=>setNewProject(e.target.value)} placeholder="Nama project film..."/><button className="primary-btn" onClick={addProject}>Create</button></div>}{projects.map((p,i)=><div className="production-row" key={i}><div className="project-icon big"><Clapperboard/></div><div className="production-info"><h3>{p.title}</h3><span>{p.type} · {p.status}</span><div className="progress wide"><i style={{width:`${p.progress}%`}}/></div></div><strong>{p.progress}%</strong></div>)}</div><div className="stats-grid"><Stat icon={<CalendarDays/>} label="Schedule" value="--" change="Production calendar"/><Stat icon={<Users/>} label="Crew" value="--" change="Team management"/><Stat icon={<FolderKanban/>} label="Breakdown" value="--" change="Production planning"/></div><div className="panel"><h3>Production Toolkit</h3><div className="tool-grid">{['Screenplay','Storyboard','Shot List','Script Breakdown','Call Sheet','Budget','Post Production','Crew Management'].map((t,i)=><div className="tool-card" key={t}><span>{['📝','🎨','🎥','📋','📅','💰','✂️','👥'][i]}</span><strong>{t}</strong><small>Production workspace</small></div>)}</div></div></>}

          {tab === 'academy' && <><PageIntro kicker="LEARN · SHARE · CREATE" title="Film Academy" desc="Ruang berbagi pengetahuan, pengalaman, dan wawasan tentang dunia perfilman."/><div className="academy-banner"><GraduationCap size={34}/><div><h2>Knowledge is a Creative Power.</h2><p>Belajar bersama. Berbagi pengalaman. Tumbuh sebagai filmmaker.</p></div></div><div className="panel"><div className="panel-heading"><h3>Explore Learning Materials</h3><button className="primary-btn" onClick={()=>setMessage('Fitur upload materi membutuhkan akun Supabase.') }><Plus size={15}/> Share Material</button></div><div className="academy-grid">{academy.filter(a=>!search||a.title.toLowerCase().includes(search.toLowerCase())).map(a=><div className="academy-card" key={a.title}><div className="academy-cover">{a.icon}<span>ZERAVA ACADEMY</span></div><div className="academy-card-body"><span className="tag">{a.category}</span><h3>{a.title}</h3><p>Shared by {a.author}</p><button className="text-btn">Explore material <ChevronRight size={14}/></button></div></div>)}</div></div></>}

          {tab === 'gallery' && <><PageIntro kicker="MEMORIES BEHIND THE SCENES" title="Production Gallery" desc="Setiap proses memiliki cerita. Simpan dan bagikan momen perjalanan produksi Zerava."/><div className="panel"><div className="panel-heading"><h3>Behind The Scenes</h3><button className="primary-btn" onClick={()=>setMessage('Upload foto akan aktif setelah Storage Supabase dikonfigurasi.')}><Upload size={15}/> Upload Media</button></div><div className="gallery-placeholder"><Camera size={40}/><h3>Every Frame Has a Story</h3><p>Galeri produksi akan menampilkan foto dan video dari seluruh anggota Zerava.</p></div></div></>}

          {tab === 'profile' && <><PageIntro kicker="YOUR CREATIVE IDENTITY" title="My Profile" desc="Kenali dan tampilkan identitasmu sebagai bagian dari Zerava."/><div className="panel profile-card"><div className="profile-cover"/><div className="profile-details"><div className="profile-avatar">{user?.email?.[0]?.toUpperCase()||'Z'}</div><h2>{user?.email?.split('@')[0]||'Guest Member'}</h2><p>{user?.email||'Belum login'}</p><span className="tag">Filmmaker · Zerava</span></div></div></>}
        </div>

        <footer>© 2026 ZERAVA PRODUCTION <span>AWAL SEDERHANA KELAK JADI SINEMA.</span></footer>
      </main>

      {loginMode && <div className="modal-backdrop"><div className="modal"><button className="modal-close" onClick={()=>setLoginMode(false)}><X/></button><div className="brand-mark">Z</div><span className="eyebrow">WELCOME TO ZERAVA</span><h2>Your Story Starts Here.</h2><p className="muted">Masuk atau bergabung dengan komunitas kreatif Zerava.</p><input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary-btn full" onClick={signIn}>Sign In</button><button className="outline-btn full" onClick={signUp}>Create Account</button>{message&&<p className="message">{message}</p>}<p className="muted tiny">Google login dapat diaktifkan melalui Authentication Providers di Supabase.</p></div></div>}

      {message && !loginMode && <div className="toast" onClick={()=>setMessage('')}>{message} <X size={14}/></div>}
    </div>
  );
}

function Stat({icon,label,value,change}:any){return <div className="stat-card"><div className="stat-top">{icon}<span>↗</span></div><strong>{value}</strong><label>{label}</label><small>{change}</small></div>;}
function PageIntro({kicker,title,desc}:any){return <div className="page-intro"><span className="eyebrow">{kicker}</span><h1>{title}</h1><p>{desc}</p></div>;}
