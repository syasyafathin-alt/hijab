import React, { useState } from 'react';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToStore,
}) => {
  const { loginAdmin, settings } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginAdmin(username, password);
    if (ok) {
      setError('');
      onLoginSuccess();
    } else {
      setError('Username atau password tidak sesuai. Gunakan akun demo: admin / admin.');
    }
  };

  const fillDemo = () => {
    setUsername('admin');
    setPassword('admin');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onBackToStore();
            }}
            className="font-serif text-3xl font-semibold text-[#2E1F1B] inline-block"
          >
            {settings.brandName}
          </a>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8C7A6B]">
            Boutique Management Portal
          </p>
        </div>

        <div className="bg-white border border-[#EAE0D5] rounded-2xl p-7 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EAE0D5]">
            <div className="w-10 h-10 rounded-xl bg-[#F3ECE3] flex items-center justify-center text-[#A66A6F]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-medium text-[#2E1F1B]">
                Login Admin
              </h1>
              <p className="text-xs text-[#8C7A6B]">
                Masuk untuk mengelola katalog, stok, dan pesanan.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-username"
                className="block text-xs font-medium text-[#5C4740] mb-1.5"
              >
                Username
              </label>
              <input
                id="admin-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium text-[#5C4740] mb-1.5"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-sm font-medium hover:bg-[#46302A] transition-colors cursor-pointer"
            >
              Masuk ke Dashboard
            </button>
          </form>

          {/* Demo Account Info */}
          <div className="p-4 rounded-xl bg-[#F3ECE3]/80 border border-[#EAE0D5] flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-xs text-[#5C4740]">
              <ShieldCheck className="w-4 h-4 text-[#A66A6F] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[#2E1F1B]">Akun Demo Admin</p>
                <p>
                  Username: <span className="font-mono font-semibold">admin</span> · Password:{' '}
                  <span className="font-mono font-semibold">admin</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="px-3 py-1.5 rounded-md bg-white border border-[#D8C7B4] text-xs font-medium text-[#2E1F1B] hover:bg-[#FAF7F2] transition-colors shrink-0 cursor-pointer"
            >
              Isi Demo
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C4740] hover:text-[#2E1F1B] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Katalog Toko
          </button>
        </div>
      </div>
    </div>
  );
};
