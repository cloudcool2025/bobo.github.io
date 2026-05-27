import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { User, Upload, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuthStore();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('头像文件大小不能超过 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error: err } = await signIn(email, password);
        if (err) setError(err.message);
      } else {
        const { error: err } = await signUp(email, password, username);
        if (err) {
          setError(err.message);
        } else if (avatarFile) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${user.id}/avatar.${fileExt}`;
            await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
          }
        }
      }
    } catch {
      setError('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl">🎱</span>
          <h1 className="text-3xl font-bold text-amber-400 mt-4">台球计分板</h1>
          <p className="text-amber-200 mt-2">多人在线对战计分系统</p>
        </div>

        <div className="bg-green-900/90 backdrop-blur rounded-2xl p-8 shadow-xl">
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={clsx(
                'flex-1 py-3 text-center font-bold rounded-l-lg transition-all',
                isLogin ? 'bg-amber-500 text-amber-900' : 'bg-green-800 text-green-200'
              )}
            >
              登录
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={clsx(
                'flex-1 py-3 text-center font-bold rounded-r-lg transition-all',
                !isLogin ? 'bg-amber-500 text-amber-900' : 'bg-green-800 text-green-200'
              )}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-amber-200 mb-2">用户名</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-green-800 text-amber-100 border border-green-700 focus:border-amber-400 outline-none"
                    placeholder="请输入用户名"
                    required
                  />
                </div>

                <div>
                  <label className="block text-amber-200 mb-2">头像 (可选，最大 2MB)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-green-800 border-2 border-green-700 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="头像预览" className="w-full h-full object-cover" />
                      ) : (
                        <User size={40} className="text-green-600" />
                      )}
                    </div>
                    <label className="flex-1 cursor-pointer">
                      <div className="px-4 py-3 bg-green-800 text-amber-200 rounded-lg border border-dashed border-green-600 hover:border-amber-400 transition-all text-center">
                        <Upload size={20} className="inline mr-2" />
                        上传头像
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-amber-200 mb-2">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-green-800 text-amber-100 border border-green-700 focus:border-amber-400 outline-none"
                placeholder="请输入邮箱"
                required
              />
            </div>

            <div>
              <label className="block text-amber-200 mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-green-800 text-amber-100 border border-green-700 focus:border-amber-400 outline-none"
                placeholder="请输入密码"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 text-amber-900 font-bold rounded-lg hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  处理中...
                </>
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
