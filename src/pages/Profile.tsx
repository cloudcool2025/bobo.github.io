import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { User, Upload, ArrowLeft, Loader2, Check } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { profile, user, refreshProfile } = useAuthStore();
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('头像文件大小不能超过 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!profile || !user) return;
    setLoading(true);
    setSaved(false);

    try {
      if (username !== profile.username) {
        await supabase
          .from('user_profiles')
          .update({ username })
          .eq('id', profile.id);
      }

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}/avatar.${fileExt}`;
        await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
        
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        await supabase
          .from('user_profiles')
          .update({ avatar_url: data.publicUrl })
          .eq('id', profile.id);
      }

      await refreshProfile();
      setSaved(true);
      setAvatarFile(null);
    } catch {
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
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
          <h1 className="text-2xl font-bold text-amber-400">个人设置</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-green-800/90 backdrop-blur rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-32 h-32 rounded-full bg-green-700 border-4 border-amber-400 flex items-center justify-center overflow-hidden mx-auto mb-4">
              {avatarPreview ? (
                <img src={avatarPreview} alt="头像" className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="text-green-500" />
              )}
            </div>
            <label className="cursor-pointer">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-amber-900 font-bold rounded-lg hover:bg-amber-400 transition-all">
                <Upload size={20} />
                上传头像
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
            <p className="text-amber-300 text-sm mt-2">支持 JPG、PNG 格式，最大 2MB</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-amber-200 mb-2">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-green-700 text-amber-100 border border-green-600 focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-amber-200 mb-2">邮箱</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-green-700/50 text-amber-300 border border-green-600"
              />
            </div>

            <div>
              <label className="block text-amber-200 mb-2">角色</label>
              <input
                type="text"
                value={profile.role === 'admin' ? '管理员' : '普通用户'}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-green-700/50 text-amber-300 border border-green-600"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3 bg-amber-500 text-amber-900 font-bold rounded-lg hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  保存中...
                </>
              ) : saved ? (
                <>
                  <Check size={20} className="mr-2" />
                  已保存
                </>
              ) : (
                '保存修改'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
