import React from 'react';
import { Instagram, MessageCircle, Mail, MapPin } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { buildWhatsAppUrl } from '../../utils/format';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();
  const waUrl = buildWhatsAppUrl(
    settings.whatsappNumber,
    `Halo ${settings.brandName}, saya ingin bertanya mengenai koleksi hijab.`
  );

  return (
    <footer className="bg-[#2E1F1B] text-[#F3ECE3] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#5C4740]/40">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
              className="font-serif text-3xl font-semibold tracking-tight text-[#FAF7F2] inline-block"
            >
              {settings.brandName}
            </a>
            <p className="text-sm text-[#D5C3AD] leading-relaxed max-w-md">
              Butik hijab modern yang mengutamakan kenyamanan serat pilihan, siluet anggun, dan warna bumi yang tenang untuk menemani keseharian Anda.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://instagram.com/${settings.instagramHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#5C4740] text-xs font-medium text-[#FAF7F2] hover:bg-[#46302A] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[#DFB9BA]" />
                {settings.instagramHandle}
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#A66A6F] text-xs font-medium text-white hover:bg-[#93585D] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp Boutique
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#B9A99A]">
              Navigasi
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Home', path: '/' },
                { label: 'Shop All Hijab', path: '/shop' },
                { label: 'New Collection', path: '/new-collection' },
                { label: 'About Brand', path: '/about' },
                { label: 'Contact', path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(link.path);
                    }}
                    className="text-[#D5C3AD] hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#B9A99A]">
              Kontak & Butik
            </h4>
            <ul className="space-y-3 text-sm text-[#D5C3AD]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#DFB9BA] shrink-0 mt-0.5" />
                <span>{settings.boutiqueAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#DFB9BA] shrink-0" />
                <span>{settings.contactEmail}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#DFB9BA] shrink-0" />
                <span className="tabular-nums">+{settings.whatsappNumber}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B9A99A]">
          <p>
            © {new Date().getFullYear()} {settings.brandName}. All rights reserved.
          </p>
          <a
            href="/admin/login"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/admin/login');
            }}
            className="text-[#D5C3AD] hover:text-white underline underline-offset-4 transition-colors"
          >
            Admin Dashboard
          </a>
        </div>
      </div>
    </footer>
  );
};
