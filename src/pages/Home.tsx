import { Trophy, RotateCcw, History, Settings, X, Plus, Minus } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { clsx } from 'clsx';

export default function Home() {
  const {
    players,
    targetScore,
    history,
    winner,
    showHistory,
    showSettings,
    updatePlayerName,
    updateScore,
    undo,
    resetGame,
    setTargetScore,
    setShowHistory,
    setShowSettings,
  } = useGameStore();

  const leadingScore = Math.max(...players.map(p => p.score));

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900">
      {/* 顶部控制栏 */}
      <div className="bg-green-900/90 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            <span className="text-3xl">🎱</span>
            台球计分板
          </h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={clsx(
                "p-2 rounded-lg transition-all",
                showHistory 
                  ? "bg-amber-500 text-amber-900" 
                  : "bg-green-800 text-green-100 hover:bg-green-700"
              )}
            >
              <History size={20} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={clsx(
                "p-2 rounded-lg transition-all",
                showSettings 
                  ? "bg-amber-500 text-amber-900" 
                  : "bg-green-800 text-green-100 hover:bg-green-700"
              )}
            >
              <Settings size={20} />
            </button>
            <button
              onClick={resetGame}
              className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
              title="重置游戏"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 目标分数 */}
        <div className="text-center mb-8">
          <p className="text-amber-200 text-lg">目标分数: <span className="font-bold text-2xl text-amber-400">{targetScore}</span></p>
        </div>

        {/* 胜利提示 */}
        {winner && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-8 rounded-2xl shadow-2xl text-center animate-pulse">
              <Trophy size={80} className="mx-auto mb-4 text-yellow-900" />
              <h2 className="text-4xl font-bold text-yellow-900 mb-2">游戏结束!</h2>
              <p className="text-2xl text-yellow-900">{winner.name} 获胜!</p>
              <button
                onClick={resetGame}
                className="mt-6 px-8 py-3 bg-yellow-900 text-yellow-100 rounded-lg font-bold hover:bg-yellow-800 transition-all"
              >
                再来一局
              </button>
            </div>
          </div>
        )}

        {/* 设置面板 */}
        {showSettings && (
          <div className="bg-green-800/90 backdrop-blur rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-amber-400">游戏设置</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-amber-300 hover:text-amber-100"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-amber-200 mb-2">目标分数</label>
                <input
                  type="number"
                  value={targetScore}
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg bg-green-900 text-amber-100 border border-green-700"
                />
              </div>
              
              <div>
                <label className="block text-amber-200 mb-2">玩家姓名</label>
                <div className="grid grid-cols-2 gap-3">
                  {players.map((player) => (
                    <input
                      key={player.id}
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayerName(player.id, e.target.value)}
                      className="px-4 py-2 rounded-lg bg-green-900 text-amber-100 border border-green-700"
                      style={{ borderColor: player.color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 历史记录 */}
        {showHistory && (
          <div className="bg-green-800/90 backdrop-blur rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-amber-400">得分记录</h3>
              <div className="flex gap-2">
                {history.length > 0 && (
                  <button
                    onClick={undo}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-all"
                  >
                    撤销
                  </button>
                )}
                <button 
                  onClick={() => setShowHistory(false)}
                  className="text-amber-300 hover:text-amber-100"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-amber-300 text-center py-4">暂无记录</p>
              ) : (
                history.map((item) => {
                  const player = players.find(p => p.id === item.playerId);
                  return (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between bg-green-700/50 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: player?.color }}
                        />
                        <span className="text-amber-100">{player?.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-amber-300">
                          {item.previousScore} → {item.newScore}
                        </span>
                        <span className={clsx(
                          "font-bold",
                          item.change > 0 ? "text-green-400" : "text-red-400"
                        )}>
                          {item.change > 0 ? `+${item.change}` : item.change}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 玩家卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {players.map((player) => {
            const isLeading = player.score === leadingScore && player.score > 0;
            
            return (
              <div
                key={player.id}
                className={clsx(
                  "relative rounded-2xl p-6 bg-gradient-to-br shadow-xl transition-all duration-300",
                  isLeading 
                    ? "ring-4 ring-amber-400 shadow-amber-400/30"
                    : "hover:scale-[1.02]"
                )}
                style={{ backgroundColor: player.color + '20', borderColor: player.color, borderWidth: '3px' }}
              >
                {isLeading && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-sm font-bold">
                    🏆 领先
                  </div>
                )}

                <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: player.color }}>
                  {player.name}
                </h2>

                <div className="text-center mb-6">
                  <div className="text-6xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(135deg, ${player.color}, ${player.color}99)` }}>
                    {player.score}
                  </div>
                  <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((player.score / targetScore) * 100, 100)}%`,
                        backgroundColor: player.color 
                      }}
                    />
                  </div>
                </div>

                {/* 分数控制 */}
                <div className="space-y-3">
                  {/* 减分 */}
                  <div className="flex gap-2 justify-center">
                    {[-10, -5, -1].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => updateScore(player.id, amount)}
                        className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 active:scale-95 transition-all shadow-md"
                      >
                        <Minus size={16} className="inline mr-1" />
                        {Math.abs(amount)}
                      </button>
                    ))}
                  </div>
                  
                  {/* 加分 */}
                  <div className="flex gap-2 justify-center">
                    {[1, 5, 10].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => updateScore(player.id, amount)}
                        className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 active:scale-95 transition-all shadow-md"
                      >
                        <Plus size={16} className="inline mr-1" />
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
