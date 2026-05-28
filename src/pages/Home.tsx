import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserProfile, MatchWithProfiles } from '@/types/database';
import { Plus, Users, Clock, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuthStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [matches, setMatches] = useState<MatchWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewMatch, setShowNewMatch] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<string>('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    setLoading(true);

    const { data: usersData } = await supabase
      .from('user_profiles')
      .select('*')
      .neq('id', profile.id);

    const { data: matchesData } = await supabase
      .from('matches')
      .select(`
        *,
        initiator:user_profiles!matches_initiator_id_fkey(*),
        opponent:user_profiles!matches_opponent_id_fkey(*),
        winner:user_profiles!matches_winner_id_fkey(*)
      `)
      .or(`initiator_id.eq.${profile.id},opponent_id.eq.${profile.id}`)
      .in('status', ['pending', 'playing'])
      .order('created_at', { ascending: false });

    setUsers(usersData || []);
    setMatches((matchesData as MatchWithProfiles[]) || []);
    setLoading(false);
  };

  const createMatch = async () => {
    if (!selectedOpponent || !profile) {
      console.error('缺少必要参数:', { selectedOpponent, profile });
      alert('请确保已登录并选择对手');
      return;
    }
    
    setCreating(true);

    const { data: sessionData } = await supabase.auth.getSession();
    console.log('当前会话:', sessionData);
    console.log('当前用户ID:', profile.id);
    console.log('选择的对手ID:', selectedOpponent);

    const { data, error } = await supabase
      .from('matches')
      .insert({
        initiator_id: profile.id,
        opponent_id: selectedOpponent,
        status: 'playing',
      })
      .select()
      .single();

    if (error) {
      console.error('创建对局失败:', error);
      console.error('错误详情:', { 
        message: error.message, 
        code: error.code, 
        details: error.details,
        hint: error.hint 
      });
      alert('创建对局失败: ' + error.message + '\n错误代码: ' + error.code);
      setCreating(false);
      setShowNewMatch(false);
      return;
    }

    if (data) {
      console.log('创建对局成功:', data);
      navigate(`/match/${data.id}`);
    } else {
      console.error('创建对局返回数据为空');
      alert('创建对局失败: 返回数据为空');
    }
    setCreating(false);
    setShowNewMatch(false);
  };

  const getStatusText = (match: MatchWithProfiles) => {
    if (match.status === 'pending') return '等待确认';
    if (match.status === 'playing') return '进行中';
    return '已结束';
  };

  const getOpponent = (match: MatchWithProfiles) => {
    return match.initiator_id === profile?.id ? match.opponent : match.initiator;
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
          <h1 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            <span className="text-3xl">🎱</span>
            台球计分板
          </h1>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/history')}
              className="px-4 py-2 bg-green-800 text-green-100 rounded-lg hover:bg-green-700 transition-all"
            >
              历史记录
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-green-800 text-green-100 rounded-lg hover:bg-green-700 transition-all"
            >
              个人设置
            </button>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              退出
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-amber-400">欢迎, {profile?.username}</h2>
            <p className="text-amber-200">
              {profile?.role === 'admin' ? '管理员' : '普通用户'}
            </p>
          </div>
          <button
            onClick={() => setShowNewMatch(true)}
            className="px-6 py-3 bg-amber-500 text-amber-900 font-bold rounded-lg hover:bg-amber-400 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            发起对局
          </button>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎱</div>
            <p className="text-amber-200 text-xl">暂无进行中的对局</p>
            <p className="text-amber-300 mt-2">点击上方按钮发起新对局</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map((match) => {
              const opponent = getOpponent(match);
              return (
                <div
                  key={match.id}
                  onClick={() => navigate(`/match/${match.id}`)}
                  className="bg-green-800/90 backdrop-blur rounded-xl p-6 shadow-lg cursor-pointer hover:scale-[1.02] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-green-700 flex items-center justify-center overflow-hidden">
                        {opponent.avatar_url ? (
                          <img src={opponent.avatar_url} alt={opponent.username} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={32} className="text-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-xl font-bold text-amber-100">vs {opponent.username}</p>
                        <p className="text-amber-300">
                          {match.initiator_score} : {match.opponent_score}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={clsx(
                        'px-3 py-1 rounded-full text-sm font-bold',
                        match.status === 'playing' ? 'bg-green-500 text-green-900' : 'bg-amber-500 text-amber-900'
                      )}>
                        {getStatusText(match)}
                      </span>
                      <p className="text-amber-300 text-sm mt-2">
                        <Clock size={14} className="inline mr-1" />
                        {new Date(match.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showNewMatch && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-green-900 rounded-2xl p-8 max-w-md w-full shadow-xl">
            <h3 className="text-2xl font-bold text-amber-400 mb-6">发起新对局</h3>
            
            <div className="mb-6">
              <label className="block text-amber-200 mb-2">选择对手</label>
              <select
                value={selectedOpponent}
                onChange={(e) => setSelectedOpponent(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-green-800 text-amber-100 border border-green-700"
              >
                <option value="">请选择对手</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewMatch(false)}
                className="flex-1 py-3 bg-green-800 text-green-100 rounded-lg hover:bg-green-700 transition-all"
              >
                取消
              </button>
              <button
                onClick={createMatch}
                disabled={!selectedOpponent || creating}
                className="flex-1 py-3 bg-amber-500 text-amber-900 font-bold rounded-lg hover:bg-amber-400 transition-all disabled:opacity-50"
              >
                {creating ? '创建中...' : '开始对局'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
