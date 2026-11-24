import React, { useState } from 'react';
import { ArrowRight, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { BOUTIQUE_IMAGES } from '../../data/seedData';
import { useStore } from '../../context/StoreContext';
import { buildWhatsAppUrl } from '../../utils/format';
import { SafeImage } from '../common/SafeImage';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { settings } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-6 space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A66A6F]">
            Kisah {settings.brandName}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#2E1F1B] leading-tight">
            Merayakan Kesederhanaan yang Lembut dan Berkarakter
          </h1>
          <p className="text-base text-[#5C4740] leading-relaxed">
            Lahir dari keinginan menghadirkan hijab yang nyaman dipakai sepanjang hari tanpa harus berkompromi pada estetika. Kami memilih serat modal silk, ultrafine voal, matte satin, dan ceruty yang ringan serta sejuk untuk cuaca tropis.
          </p>
          <p className="text-base text-[#5C4740] leading-relaxed">
            Setiap warna dikurasi dalam palet netral hangat—ivory, beige, taupe, dusty pink, dan cokelat muda—agar mudah dipadukan dengan lemari pakaian modest Anda dari pagi hingga acara malam.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/shop')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-sm font-medium hover:bg-[#46302A] transition-colors cursor-pointer"
            >
              Jelajahi Koleksi
              <ArrowRight className="w-4 h-4 text-[#DFB9BA]" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#F3ECE3] border border-[#EAE0D5]">
            <SafeImage
              src={BOUTIQUE_IMAGES.flatlayCollection}
              alt="Kurasi bahan dan warna hijab Noura Atelier"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-[#EAE0D5]">
        <div className="space-y-2">
          <p className="font-serif text-2xl font-medium text-[#2E1F1B]">
            01. Serat Sejuk Alami
          </p>
          <p className="text-sm text-[#5C4740] leading-relaxed">
            Material breathable yang lembut di telinga dan tidak terasa pengap, cocok untuk pemakaian aktif 8–12 jam.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-serif text-2xl font-medium text-[#2E1F1B]">
            02. Jahit Tepi Presisi
          </p>
          <p className="text-sm text-[#5C4740] leading-relaxed">
            Setiap helai diselesaikan dengan teknik baby-seam atau laser-cut rapi sehingga jatuh hijab terlihat bersih dan tahan lama.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-serif text-2xl font-medium text-[#2E1F1B]">
            03. Kemasan Butik
          </p>
          <p className="text-sm text-[#5C4740] leading-relaxed">
            Dikemas rapi dalam pouch kain atau kotak minimal yang siap dijadikan hadiah istimewa untuk orang terdekat.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    showToast('Pesan Anda berhasil dikirim. Tim kami akan segera merespons.');
  };

  const waUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    `Halo ${settings.brandName}, saya ingin berkonsultasi mengenai pemesanan hijab.`
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-2xl space-y-2 mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A66A6F]">
          Hubungi Kami
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#2E1F1B]">
          Butuh Bantuan Memilih Warna atau Bahan?
        </h1>
        <p className="text-sm sm:text-base text-[#5C4740]">
          Konsultasikan kebutuhan styling hijab harian, seragam acara keluarga, maupun ketersediaan stok bersama tim butik kami.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-6 bg-[#F3ECE3] border border-[#EAE0D5] rounded-2xl p-7">
          <h2 className="font-serif text-2xl font-medium text-[#2E1F1B]">
            Informasi Butik
          </h2>
          <div className="space-y-4 text-sm text-[#5C4740]">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#A66A6F] shrink-0 mt-1" />
              <div>
                <p className="font-medium text-[#2E1F1B]">Showroom</p>
                <p>{settings.boutiqueAddress}</p>
                <p className="text-xs text-[#8C7A6B] mt-0.5">
                  Selasa – Minggu, 10.00 – 19.00 WIB
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#A66A6F] shrink-0 mt-1" />
              <div>
                <p className="font-medium text-[#2E1F1B]">Email</p>
                <p>{settings.contactEmail}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle className="w-4 h-4 text-[#A66A6F] shrink-0 mt-1" />
              <div>
                <p className="font-medium text-[#2E1F1B]">WhatsApp Concierge</p>
                <p className="tabular-nums">+{settings.whatsappNumber}</p>
              </div>
            </div>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#2E1F1B] text-[#FAF7F2] text-sm font-medium hover:bg-[#46302A] transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#DFB9BA]" />
            Chat Langsung via WhatsApp
          </a>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#EAE0D5] rounded-2xl p-7 sm:p-8">
          <h2 className="font-serif text-2xl font-medium text-[#2E1F1B] mb-5">
            Kirim Pesan
          </h2>
          {submitted && (
            <div className="mb-5 p-4 rounded-xl bg-[#F3ECE3] border border-[#EAE0D5] text-sm text-[#2E1F1B]">
              Terima kasih! Pesan Anda telah kami terima dan akan kami balas maksimal 1×24 jam kerja.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5C4740] mb-1.5">
                Pesan atau Pertanyaan
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ceritakan kebutuhan warna, jumlah, atau pertanyaan produk Anda..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#EAE0D5] text-sm text-[#2E1F1B] focus:outline-none focus:border-[#A66A6F]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#A66A6F] text-white text-sm font-medium hover:bg-[#93585D] transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Kirim Pesan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
