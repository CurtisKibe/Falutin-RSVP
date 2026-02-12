"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Ticket, Clapperboard, Users, BarChart3, 
  RadioTower, Bell, Home, Film, Image as ImageIcon, 
  LogOut, ExternalLink, DollarSign, AlertCircle, RefreshCw, Trophy,
  type LucideIcon, CheckCircle, XCircle, Search
} from "lucide-react";
import AdminChatBot from "@/components/adminchatbot"; 

// --- CONFIG ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- TYPES ---
type AdminView = 'dashboard' | 'manifest' | 'studio' | 'talent' | 'dailies' | 'broadcast' | 'notifications';

interface VoteStat {
    title: string;
    count: number;
    percentage: number;
}

interface RecentVote {
    id: number;
    movie_choice: string;
    created_at: string;
    user_id: string;
}

interface ReservationData {
    id: number;
    movie_title: string;
    name: string;
    email: string;
    amount: number;
    status: string;
    created_at: string;
}

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

interface ExternalLinkItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

interface PlaceholderViewProps {
  title: string;
  desc: string;
  icon: LucideIcon;
}

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'sale', msg: 'New Ticket Sold: Pulp Fiction (Seat A12)', time: '2 mins ago', color: 'text-green-400' },
  { id: 2, type: 'vote', msg: 'Member "Neo" voted for "Oldboy"', time: '15 mins ago', color: 'text-yellow-400' },
  { id: 3, type: 'reg', msg: 'New Member Registration: John Doe', time: '1 hour ago', color: 'text-blue-400' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  
  // Stats
  const [stats] = useState({ revenue: 12500, members: 142, ticketsSold: 85, unreadAlerts: 3 });

  // Data States
  const [voteStats, setVoteStats] = useState<VoteStat[]>([]);
  const [recentVotes, setRecentVotes] = useState<RecentVote[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  
  // Manifest States
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // 1. AUTH CHECK
  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
      setLoading(false);
    }
    checkAdmin();
  }, [router]);

  // 2. FETCHES VOTES
  const fetchVoteData = useCallback(async () => {
    setLoadingData(true);
    const { data: votes, error } = await supabase.from('votes').select('*').order('created_at', { ascending: false });
    
    if (!error && votes) {
        setTotalVotes(votes.length);
        setRecentVotes(votes.slice(0, 5)); 

        const tally: Record<string, number> = {};
        votes.forEach((v) => {
            tally[v.movie_choice] = (tally[v.movie_choice] || 0) + 1;
        });

        const statsArray: VoteStat[] = Object.keys(tally).map(key => ({
            title: key,
            count: tally[key],
            percentage: Math.round((tally[key] / votes.length) * 100)
        })).sort((a, b) => b.count - a.count);

        setVoteStats(statsArray);
    }
    setLoadingData(false);
  }, []);

  // 3. FETCH MANIFEST
  const fetchManifestData = useCallback(async () => {
    setLoadingData(true);
    const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

    if (!error && data) {
        setReservations(data);
    }
    setLoadingData(false);
  }, []);

  // 4. VIEW SWITCHER
  const handleViewChange = (view: AdminView) => {
    setActiveView(view);
    if (view === 'dailies') fetchVoteData();
    if (view === 'manifest') fetchManifestData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading Studio...</div>;

  return (
    <div className="flex h-screen bg-neutral-950 text-white font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 shrink-0 border-r border-white/10 bg-neutral-900 flex flex-col justify-between z-40">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-white/5">
             <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-900/20">
                <Clapperboard className="w-4 h-4 text-black" />
             </div>
             <div>
                <h1 className="font-bold tracking-wider text-sm">THE STUDIO</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Admin Console</p>
             </div>
          </div>

          <div className="p-4 space-y-8 overflow-y-auto max-h-[calc(100vh-180px)]">
            <div>
              <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Production</p>
              <nav className="space-y-1">
                <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => handleViewChange('dashboard')} />
                <SidebarItem icon={Bell} label="Notifications" active={activeView === 'notifications'} onClick={() => handleViewChange('notifications')} badge={stats.unreadAlerts} />
                <SidebarItem icon={Ticket} label="Manifest (Sales)" active={activeView === 'manifest'} onClick={() => handleViewChange('manifest')} />
                <SidebarItem icon={Clapperboard} label="Studio (Movies)" active={activeView === 'studio'} onClick={() => handleViewChange('studio')} />
                <SidebarItem icon={Users} label="Talent (Members)" active={activeView === 'talent'} onClick={() => handleViewChange('talent')} />
                <SidebarItem icon={BarChart3} label="Dailies (Votes)" active={activeView === 'dailies'} onClick={() => handleViewChange('dailies')} />
                <SidebarItem icon={RadioTower} label="Broadcast" active={activeView === 'broadcast'} onClick={() => handleViewChange('broadcast')} />
              </nav>
            </div>

            <div>
              <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Site Preview</p>
              <nav className="space-y-1">
                <ExternalLinkItem href="/" icon={Home} label="Home Page" />
                <ExternalLinkItem href="/archive" icon={Film} label="The Archive" />
                <ExternalLinkItem href="/#upcoming" icon={Ticket} label="Screenings" />
                <ExternalLinkItem href="/gallery" icon={ImageIcon} label="The Gallery" />
              </nav>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-neutral-900">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-900/10 hover:text-red-500 transition-all text-sm font-medium">
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN STAGE --- */}
      <main className="flex-1 overflow-y-auto relative bg-neutral-950">

        {activeView !== 'studio' && (
            <header className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold capitalize">{activeView.replace('-', ' ')}</h2>
                <div className="flex items-center gap-4">
                    <div className="bg-neutral-900 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        System Online
                    </div>
                    <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center text-xs font-bold">AD</div>
                </div>
            </header>
        )}

        <div className={`h-full ${activeView === 'studio' ? 'p-0' : 'p-8 max-w-7xl mx-auto'}`}>
          
          {/* VIEW: DASHBOARD */}
          {activeView === 'dashboard' && (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={DollarSign} color="text-green-400" />
                    <StatCard label="Active Members" value={stats.members} icon={Users} color="text-blue-400" />
                    <StatCard label="Tickets Sold" value={stats.ticketsSold} icon={Ticket} color="text-yellow-400" />
                    <StatCard label="Pending Alerts" value={stats.unreadAlerts} icon={AlertCircle} color="text-red-400" />
                </div>
                <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-6">Recent Activity Feed</h3>
                    <div className="space-y-4">
                        {MOCK_NOTIFICATIONS.map((note) => (
                             <div key={note.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${note.color.replace('text-', 'bg-')}`}></div>
                                    <span className="text-sm">{note.msg}</span>
                                </div>
                                <span className="text-xs text-gray-500 font-mono">{note.time}</span>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
          )}

           {/* VIEW: DAILIES (VOTING ANALYTICS) */}
           {activeView === 'dailies' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-bold">Community Sentiment</h3>
                      <button onClick={fetchVoteData} className="flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400 transition-colors">
                          <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} /> Refresh Data
                      </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl">
                          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Total Votes Cast</p>
                          <p className="text-4xl font-bold">{totalVotes}</p>
                      </div>
                      <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl col-span-2">
                          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Leading Candidate</p>
                          {voteStats.length > 0 ? (
                              <div className="flex items-center gap-3">
                                  <Trophy className="w-8 h-8 text-yellow-500" />
                                  <div>
                                      <p className="text-3xl font-bold text-white">{voteStats[0].title}</p>
                                      <p className="text-sm text-green-400">{voteStats[0].percentage}% of total vote</p>
                                  </div>
                              </div>
                          ) : (
                              <p className="text-gray-500">No votes recorded yet.</p>
                          )}
                      </div>
                  </div>

                  <div className="bg-neutral-900 border border-white/10 p-8 rounded-2xl">
                      <h4 className="text-lg font-bold mb-6">Vote Breakdown</h4>
                      {loadingData ? (
                          <div className="py-10 text-center text-gray-500">Calculating analytics...</div>
                      ) : (
                          <div className="space-y-6">
                              {voteStats.map((stat, index) => (
                                  <div key={stat.title} className="group">
                                      <div className="flex justify-between mb-2 text-sm">
                                          <span className="font-bold flex items-center gap-2">
                                              {index === 0 && <span className="text-yellow-500">★</span>} 
                                              {stat.title}
                                          </span>
                                          <span className="font-mono text-gray-400">{stat.count} votes ({stat.percentage}%)</span>
                                      </div>
                                      <div className="w-full bg-black h-4 rounded-full overflow-hidden border border-white/5">
                                          <div 
                                              className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-linear-to-r from-yellow-600 to-yellow-400' : 'bg-neutral-700'}`} 
                                              style={{ width: `${stat.percentage}%` }}
                                          />
                                      </div>
                                  </div>
                              ))}
                              {voteStats.length === 0 && <p className="text-gray-500 text-center py-10">Awaiting data...</p>}
                          </div>
                      )}
                  </div>

                  <div className="bg-neutral-900 border border-white/10 p-6 rounded-2xl">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Live Feed</h4>
                      <div className="divide-y divide-white/5">
                          {recentVotes.map((vote) => (
                              <div key={vote.id} className="py-3 flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                      <span className="text-sm text-gray-300">User <span className="font-mono text-xs text-gray-500">{vote.user_id.slice(0,6)}...</span> voted for <span className="text-white font-bold">{vote.movie_choice}</span></span>
                                  </div>
                                  <span className="text-xs text-gray-600 font-mono">
                                      {new Date(vote.created_at).toLocaleTimeString()}
                                  </span>
                              </div>
                          ))}
                          {recentVotes.length === 0 && <p className="text-gray-500 text-sm italic">No recent activity.</p>}
                      </div>
                  </div>
              </div>
           )}

          {/* VIEW: MANIFEST (RESERVATIONS DATA) */}
          {activeView === 'manifest' && (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold">The Manifest</h3>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input type="text" placeholder="Search Guest..." className="bg-neutral-900 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:border-yellow-500 outline-none w-64" />
                        </div>
                        <button onClick={fetchManifestData} className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors">
                            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} /> Refresh
                        </button>
                    </div>
                </div>

                <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black/40 text-gray-400 uppercase tracking-widest text-xs border-b border-white/10">
                                <tr>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Guest</th>
                                    <th className="p-4 font-medium">Movie</th>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {reservations.length > 0 ? (
                                    reservations.map((reservation) => (
                                        <tr key={reservation.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                {reservation.status === 'failed' || reservation.status === 'cancelled' ? (
                                                    <span className="inline-flex items-center gap-1 text-red-400 bg-red-900/20 px-2 py-1 rounded text-xs font-bold border border-red-500/20">
                                                        <XCircle className="w-3 h-3" /> {reservation.status}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-green-400 bg-green-900/20 px-2 py-1 rounded text-xs font-bold border border-green-500/20">
                                                        <CheckCircle className="w-3 h-3" /> {reservation.status || 'Confirmed'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold text-white">{reservation.name || "Guest"}</p>
                                                <p className="text-xs text-gray-500">{reservation.email}</p>
                                            </td>
                                            <td className="p-4 text-gray-300">{reservation.movie_title}</td>
                                            <td className="p-4 text-gray-500 font-mono text-xs">
                                                {new Date(reservation.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right font-bold font-mono text-white">
                                                KES {reservation.amount}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            {loadingData ? "Loading manifest..." : "No reservations found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          )}
          
          {/* VIEW: STUDIO (EMBEDDED IFRAME) */}
          {activeView === 'studio' && (
             <div className="w-full h-full bg-neutral-950 flex flex-col">
                <iframe 
                  src="/studio" 
                  className="w-full flex-1 border-none"
                  title="Sanity Studio"
                />
             </div>
          )}

          {activeView === 'talent' && <PlaceholderView title="Talent Management" desc="Member database, ban tools, and persona reveals." icon={Users} />}
          {activeView === 'broadcast' && <PlaceholderView title="Broadcast" desc="Email blasts and chat moderation." icon={RadioTower} />}
          {activeView === 'notifications' && (
             <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Inbox</h3>
                    <button className="text-xs text-blue-400 hover:text-blue-300">Mark all as read</button>
                </div>
                <div className="space-y-2">
                    {MOCK_NOTIFICATIONS.map((note) => (
                            <div key={note.id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <span className={`p-2 rounded-lg bg-white/5 ${note.color}`}>
                                    {note.type === 'sale' && <Ticket className="w-4 h-4" />}
                                    {note.type === 'vote' && <BarChart3 className="w-4 h-4" />}
                                    {note.type === 'chat' && <CheckCircle className="w-4 h-4" />}
                                    {note.type === 'reg' && <Users className="w-4 h-4" />}
                                </span>
                                <span className="text-sm group-hover:text-white text-gray-300">{note.msg}</span>
                            </div>
                            <span className="text-xs text-gray-500 font-mono">{note.time}</span>
                            </div>
                    ))}
                </div>
            </div>
          )}

        </div>
      </main>

      <AdminChatBot />
    </div>
  );
}

// --- SUBCOMPONENTS ---

function SidebarItem({ icon: Icon, label, active, onClick, badge }: SidebarItemProps) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                active 
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 font-bold' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
        >
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
            </div>
            {badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </button>
    );
}

function ExternalLinkItem({ href, icon: Icon, label }: ExternalLinkItemProps) {
    return (
        <Link 
            href={href} 
            target="_blank"
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white group"
        >
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 group-hover:text-yellow-500 transition-colors" />
                <span>{label}</span>
            </div>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
    return (
        <div className="bg-neutral-900 border border-white/5 p-6 rounded-2xl flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">{label}</p>
                <h3 className="text-2xl font-bold">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
    );
}

function PlaceholderView({ title, desc, icon: Icon }: PlaceholderViewProps) {
    return (
        <div className="text-center py-20 bg-neutral-900/50 border border-dashed border-white/10 rounded-2xl">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">{title}</h2>
            <p className="text-gray-500">{desc}</p>
        </div>
    );
}