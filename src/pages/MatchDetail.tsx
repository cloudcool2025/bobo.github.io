import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type { MatchWithProfiles } from '@/types/database';
import { Plus, Minus, Trophy, AlertCircle, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate, useParams } from 'react-router-dom';

export default function MatchDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuthStore();
  const [match, setMatch] = useState<MatchWithProfiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  useEffect(() => {
    loadMatch();
  }, [id]);

  const loadMatch = async () => {
    if (!id) return;
    setLoading(true);

    const { data } = await supabase
      .from('matches')
      .select(`
        *,
        initiator:user_profiles!matches_initiator_id_fkey(*),
        opponent:user_profiles!matches_opponent_id_fkey(*),
        winner:user_profiles!matches_winner_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    setMatch(data as MatchWithProfiles);
    setLoading(false);
  };

  const updateScore = async (field: string, value: number) => {
    if (!match || match.status === 'finished') return;

    const newValue = Math.max(0, value);
    await supabase
      .from('matches')
      .update({ [field]: newValue })
      .eq('id', match.id);

    setMatch({ ...match, [field]: newValue });
  };

  const endMatch = async () => {
    if (!match) return;

    const winnerId = match.initiator_score > match.opponent_score
      ? match.initiator_id
      : match.opponent_score > match.initiator_score
        ? match.opponent_id
        : null;

    await supabase
      .from('matches')
      .update({
        status: 'finished',
        winner_id: winnerId,
        finished_at: new Date().toISOString(),
      })
      .eq('id', match.id);

    navigate('/');
  };

  const isInitiator = profile?.id === match?.initiator_id;
  const isOpponent = profile?.id === match?.opponent_id;
  const isAdmin = profile?.role === 'admin';
  const canEdit = isInitiator || isOpponent || isAdmin;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-200 text-xl">对局不存在</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-amber-500 text-amber-900 font-bold rounded-lg"
          >
            返回首页
          </button>
        </div>
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
          
          <div className="flex items-center gap-2">
            {match.status === 'playing' && canEdit && (
              <button
                onClick={() => setShowEndConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                结束对局
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-amber-400">对局计分</h2>
          <p className="text-amber-200 mt-2">
            {match.status === 'finished' ? '已结束' : '进行中'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[{ p: match.initiator, score: match.initiator_score, fouls: match.initiator_fouls, lucky: match.initiator_lucky, isInit: true },
            { p: match.opponent, score: match.opponent_score, fouls: match.opponent_fouls, lucky: match.opponent_lucky, isInit: false }
          ].map((player, idx) => (
            <div
              key={player.p.id}
              className={clsx(
                'bg-green-800/90 backdrop-blur rounded-2xl p-6 shadow-xl',
                match.winner_id === player.p.id && 'ring-4 ring-amber-400'
              )}
            >
              {match.winner_id === player.p.id && (
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-amber-900 rounded-full font-bold">
                    <Trophy size={20} />
                    获胜
                  </span>
                </div>
              )}

              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-green-700 flex items-center justify-center overflow-hidden">
                  {player.p.avatar_url ? (
                    <img src={player.p.avatar_url} alt={player.p.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-amber-400">{player.p.username[0]}</span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-amber-100">{player.p.username}</h3>
              </div>

              <div className="text-center mb-6">
                <div className="text-7xl font-black text-amber-400 mb-2">{player.score}</div>
                <p className="text-amber-300">分数</p>
              </div>

              {canEdit && match.status !== 'finished' && (
                <div className="space-y-3">
                  <div className="flex gap-2 justify-center">
                    {[-10, -5, -1].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => updateScore(player.isInit ? 'initiator_score' : 'opponent_score', player.score + amount)}
                        className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 active:scale-95 transition-all"
                      >
                        <Minus size={16} className="inline mr-1" />
                        {Math.abs(amount)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-center">
                    {[1, 5, 10].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => updateScore(player.isInit ? 'initiator_score' : 'opponent_score', player.score + amount)}
                        className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 active:scale-95 transition-all"
                      >
                        <Plus size={16} className="inline mr-1" />
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-green-700/50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-amber-300 mb-2">
                    <AlertCircle size={16} />
                    <span className="text-sm">白球犯规</span>
                  </div>
                  <div className="text-3xl font-bold text-amber-100">{player.fouls}</div>
                  {canEdit && match.status !== 'finished' && (
                    <div className="flex gap-2 justify-center mt-2">
                      <button
                        onClick={() => updateScore(player.isInit ? 'initiator_fouls' : 'opponent_fouls', player.fouls - 1)}
                        className="w-8 h-8 bg-red-500 text-white rounded-lg font-bold"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateScore(player.isInit ? 'initiator_fouls' : 'opponent_fouls', player.fouls + 1)}
                        className="w-8 h-8 bg-green-500 text-white rounded-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-green-700/50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-amber-300 mb-2">
                    <Sparkles size={16} />
                    <span className="text-sm">运气球</span>
                  </div>
                  <div className="text-3xl font-bold text-amber-100">{player.lucky}</div>
                  {canEdit && match.status !== 'finished' && (
                    <div className="flex gap-2 justify-center mt-2">
                      <button
                        onClick={() => updateScore(player.isInit ? 'initiator_lucky' : 'opponent_lucky', player.lucky - 1)}
                        className="w-8 h-8 bg-red-500 text-white rounded-lg font-bold"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateScore(player.isInit ? 'initiator_lucky' : 'opponent_lucky', player.lucky + 1)}
                        className="w-8 h-8 bg-green-500 text-white rounded-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-green-900 rounded-2xl p-8 max-w-md w-full shadow-xl text-center">
            <Trophy size={64} className="mx-auto mb-4 text-amber-400" />
            <h3 className="text-2xl font-bold text-amber-400 mb-4">确认结束对局?</h3>
            <p className="text-amber-200 mb-6">
              当前比分: {match.initiator_score} : {match.opponent_score}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-3 bg-green-800 text-green-100 rounded-lg hover:bg-green-700 transition-all"
              >
                取消
              </button>
              <button
                onClick={endMatch}
                className="flex-1 py-3 bg-amber-500 text-amber-900 font-bold rounded-lg hover:bg-amber-400 transition-all"
              >
                确认结束
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
