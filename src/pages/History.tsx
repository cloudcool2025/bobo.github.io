import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type { Match, UserProfile } from '@/types/database';
import { Trophy, ArrowLeft, Loader2, BarChart3, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsChart from '@/components/StatsChart';

interface MatchWithProfiles extends Match {
  initiator?: UserProfile;
  opponent?: UserProfile;
  winner?: UserProfile | null;
}

export default function History() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [matches, setMatches] = useState<MatchWithProfiles[]>([]);
  const [stats, setStats] = useState<{ wins: number; losses: number; total: number; fouls: number; lucky: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    loadData();
  }, [profile, selectedUser]);

  const loadData = async () => {
    if (!profile) return;
    setLoading(true);

    const { data: usersData } = await supabase
      .from('user_profiles')
      .select('*');

    setUsers(usersData || []);

    let query = supabase
      .from('matches')
      .select('*')
      .eq('status', 'finished')
      .order('finished_at', { ascending: false });

    if (selectedUser !== 'all') {
      query = query.or(`initiator_id.eq.${selectedUser},opponent_id.eq.${selectedUser}`);
    }

    const { data: matchesData } = await query;
    const rawMatches = matchesData || [];

    const matchesWithProfiles: MatchWithProfiles[] = [];

    for (const match of rawMatches) {
      const { data: initiatorData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', match.initiator_id)
        .single();
      
      const { data: opponentData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', match.opponent_id)
        .single();
      
      let winnerData = null;
      if (match.winner_id) {
        const { data: winnerResult } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', match.winner_id)
          .single();
        winnerData = winnerResult;
      }

      matchesWithProfiles.push({
        ...match,
        initiator: initiatorData || undefined,
        opponent: opponentData || undefined,
        winner: winnerData || null,
      });
    }

    setMatches(matchesWithProfiles);

    const userId = selectedUser === 'all' ? profile.id : selectedUser;
    const { data: userMatches } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'finished')
      .or(`initiator_id.eq.${userId},opponent_id.eq.${userId}`);

    if (userMatches) {
      let wins = 0, losses = 0, fouls = 0, lucky = 0;
      userMatches.forEach(m => {
        const isInitiator = m.initiator_id === userId;
        if (m.winner_id === userId) wins++;
        else if (m.winner_id) losses++;
        fouls += isInitiator ? m.initiator_fouls : m.opponent_fouls;
        lucky += isInitiator ? m.initiator_lucky : m.opponent_lucky;
      });
      setStats({ wins, losses, total: userMatches.length, fouls, lucky });
    }

    setLoading(false);
  };

  const getMatchHistory = () => {
    if (!profile || !matches.length) return [];
    const userId = selectedUser === 'all' ? profile.id : selectedUser;
    return matches.map(m => {
      const isInitiator = m.initiator_id === userId;
      const date = m.finished_at ? new Date(m.finished_at).toLocaleDateString('zh-CN') : '';
      return {
        date,
        initiatorScore: isInitiator ? m.initiator_score : m.opponent_score,
        opponentScore: isInitiator ? m.opponent_score : m.initiator_score,
        winner: m.winner?.username || '平局',
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900">
      <div className="bg-green-900/90 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-amber-400 hover:text-amber-300"
          >
            <ArrowLeft size={20} />
            返回
          </button>
          <h1 className="text-2xl font-bold text-amber-400">历史记录</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <label className="block text-amber-200 mb-2">筛选用户</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-4 py-2 rounded-lg bg-green-800 text-amber-100 border border-green-700"
          >
            <option value="all">全部</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-green-800/90 backdrop-blur rounded-xl p-4 text-center">
              <BarChart3 size={24} className="mx-auto mb-2 text-amber-400" />
              <div className="text-3xl font-bold text-amber-100">{stats.total}</div>
              <div className="text-amber-300 text-sm">总对局</div>
            </div>
            <div className="bg-green-800/90 backdrop-blur rounded-xl p-4 text-center">
              <Trophy size={24} className="mx-auto mb-2 text-green-400" />
              <div className="text-3xl font-bold text-green-400">{stats.wins}</div>
              <div className="text-amber-300 text-sm">胜场</div>
            </div>
            <div className="bg-green-800/90 backdrop-blur rounded-xl p-4 text-center">
              <XCircle size={24} className="mx-auto mb-2 text-red-400" />
              <div className="text-3xl font-bold text-red-400">{stats.losses}</div>
              <div className="text-amber-300 text-sm">败场</div>
            </div>
            <div className="bg-green-800/90 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-amber-100">
                {stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-amber-300 text-sm">胜率</div>
            </div>
            <div className="bg-green-800/90 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-100">{stats.fouls} / {stats.lucky}</div>
              <div className="text-amber-300 text-sm">犯规 / 运气</div>
            </div>
          </div>
        )}

        {stats && matches.length > 0 && (
          <div className="mb-8">
            <StatsChart stats={stats} matchHistory={getMatchHistory()} />
          </div>
        )}

        {matches.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-amber-200 text-xl">暂无历史记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-green-800/90 backdrop-blur rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-green-700 flex items-center justify-center overflow-hidden mx-auto mb-1">
                        {match.initiator?.avatar_url ? (
                          <img src={match.initiator.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-amber-400">{match.initiator?.username?.[0] || '?'}</span>
                        )}
                      </div>
                      <p className="text-amber-100 text-sm">{match.initiator?.username || '加载中...'}</p>
                      <p className="text-2xl font-bold text-amber-400">{match.initiator_score}</p>
                    </div>
                    <div className="text-amber-300 text-xl font-bold">VS</div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-green-700 flex items-center justify-center overflow-hidden mx-auto mb-1">
                        {match.opponent?.avatar_url ? (
                          <img src={match.opponent.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-amber-400">{match.opponent?.username?.[0] || '?'}</span>
                        )}
                      </div>
                      <p className="text-amber-100 text-sm">{match.opponent?.username || '加载中...'}</p>
                      <p className="text-2xl font-bold text-amber-400">{match.opponent_score}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {match.winner && (
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <Trophy size={16} />
                        <span className="font-bold">{match.winner.username} 获胜</span>
                      </div>
                    )}
                    <p className="text-amber-300 text-sm">
                      {match.finished_at && new Date(match.finished_at).toLocaleString('zh-CN')}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-amber-400">
                      <span>犯规: {match.initiator_fouls + match.opponent_fouls}</span>
                      <span>运气: {match.initiator_lucky + match.opponent_lucky}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
