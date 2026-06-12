import { useState, useEffect } from 'react';
import { Menu, X, MapPin, Phone, MessageSquare, ShieldCheck } from 'lucide-react';
import bsaLogo from '../assets/images/bsa_logo_1781186784341.jpg';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappLink = "https://wa.me/5522992238673?text=Olá!%20Gostaria%20de%20falar%20com%20a%20BSA%20Projetos%20sobre%20um%20serviço.";

  const navLinks = [
    { label: 'Início', href: '#inicio' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Portfólio', href: '#portfolio' },
    { label: 'Sobre Nós', href: '#sobre' },
    { label: 'Orçamento', href: '#orcamento' },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Top micro bar for location and contact */}
      <div id="header-topbar" className="w-full bg-brand-blue text-white text-[11px] sm:text-xs py-1.5 px-4 font-medium flex justify-between items-center transition-all">
        <div className="flex items-center gap-1.5 opacity-90">
          <MapPin className="w-3.5 h-3.5 text-brand-orange animate-pulse" />
          <span>Atendimento de Cabo Frio a Macaé, RJ</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="tel:22992238673" className="hidden xs:flex items-center gap-1 hover:text-brand-orange transition-colors">
            <Phone className="w-3 h-3 text-brand-orange" />
            <span>(22) 99223-8673</span>
          </a>
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Atendimento Hoje</span>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <header
        id="main-header"
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md bsa-shadow py-2.5'
            : 'bg-white py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
          {/* Logo & Brand Title */}
          <a href="#inicio" className="flex items-center gap-3 group">
            <img
              src={bsaLogo}
              alt="BSA Projetos Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-slate-200 bsa-shadow group-hover:scale-105 transition-transform object-cover"
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-brand-blue">
                  BSA<span className="text-brand-orange">Projetos</span>
                </span>
                <ShieldCheck className="w-4 h-4 text-brand-blue-light fill-emerald-500/10" />
              </div>
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold -mt-0.5">
                Manutenção & Reforma
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-slate-600 hover:text-brand-blue font-semibold text-sm transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-orange hover:after:w-full after:transition-all duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Call to action desktop */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-emerald-500 text-emerald-600 font-bold text-sm hover:bg-emerald-50 hover:scale-102 active:scale-98 transition-all bsa-shadow"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href="#orcamento"
              className="px-5 py-2 rounded-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-sm hover:scale-102 active:scale-98 transition-all bsa-shadow bsa-shadow-orange"
            >
              Solicitar Orçamento
            </a>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 bsa-shadow-lg flex flex-col px-4 py-6 gap-4 z-50 animate-fade-in">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="px-4 py-2.5 rounded-lg text-slate-700 hover:bg-slate-50 font-bold hover:text-brand-blue transition-colors text-base"
                >
                  {link.label}
                </a>
              ))}
            </div>
            
            <hr className="border-slate-100" />
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 text-white font-black hover:bg-emerald-600 transition-colors text-center bsa-shadow"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Conversar via WhatsApp</span>
              </a>
              <a
                href="#orcamento"
                onClick={handleLinkClick}
                className="flex items-center justify-center w-full py-3 rounded-xl bg-brand-orange text-white font-black hover:bg-brand-orange-dark transition-colors text-center bsa-shadow bsa-shadow-orange"
              >
                Solicitar Orçamento Comercial
              </a>
            </div>

            <div className="text-center text-xs text-slate-400 mt-2">
              <span>BSA Projetos © 2026 • Cabo Frio, Macaé & Região</span>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
