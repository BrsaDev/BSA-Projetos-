import { ShieldCheck, Mail, Phone, MapPin, MessageSquare, Heart } from 'lucide-react';
import bsaLogo from '../assets/images/bsa_logo_1781186784341.jpg';

interface FooterProps {
  onAdminClick?: () => void;
}

export default function Footer({ onAdminClick }: FooterProps) {
  const whatsappLink = "https://wa.me/5522992238673?text=Olá!%20Gostaria%2520de%2520conversar%2520sobre%2520um%2520projeto%2520da%2520BSA%2520Projetos.";

  const servicesLinks = [
    { label: 'Serviço de Pintura', href: '#servicos' },
    { label: 'Instalações Hidráulicas', href: '#servicos' },
    { label: 'Reformas Elétricas', href: '#servicos' },
    { label: 'Alvenaria & Acabamentos', href: '#servicos' },
    { label: 'Marcenaria de Precisão', href: '#servicos' },
    { label: 'Carpintaria & Telhados', href: '#servicos' },
  ];

  const institutionalLinks = [
    { label: 'Apresentação Inicial', href: '#inicio' },
    { label: 'Nosso Portfólio', href: '#portfolio' },
    { label: 'Diferenciais Técnicos', href: '#sobre' },
    { label: 'Fazer Orçamento', href: '#orcamento' },
  ];

  return (
    <footer className="w-full bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        
        {/* BSA Brand Description column */}
        <div className="flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2">
            <img
              src={bsaLogo}
              alt="BSA Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 border border-slate-800 rounded-full object-cover shrink-0"
            />
            <div>
              <span className="text-lg font-black text-white tracking-tight">
                BSA<span className="text-brand-orange">Projetos</span>
              </span>
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">
                Residencial l Comercial
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-2">
            Soluções integradas de Engenharia de Manutenção com foco em qualidade, durabilidade litorânea e limpeza rigorosa pós-obra de Cabo Frio a Macaé, de ponta a ponta.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-white bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-xl w-fit">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-bold">Garantia Ativa BSA</span>
          </div>
        </div>

        {/* Services List column */}
        <div className="text-left">
          <h4 className="text-xs font-black uppercase text-white tracking-widest mb-4">
            Especialidades de Serviço
          </h4>
          <div className="flex flex-col gap-2.5">
            {servicesLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="text-xs sm:text-sm hover:text-white transition-colors py-0.5 inline-block"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Navigation Section column */}
        <div className="text-left">
          <h4 className="text-xs font-black uppercase text-white tracking-widest mb-4">
            Institucional
          </h4>
          <div className="flex flex-col gap-2.5">
            {institutionalLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="text-xs sm:text-sm hover:text-white transition-colors py-0.5 inline-block"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Contact info column */}
        <div className="text-left flex flex-col gap-4">
          <h4 className="text-xs font-black uppercase text-white tracking-widest">
            Fale Conosco
          </h4>
          <div className="flex flex-col gap-3.5 mt-2">
            <a
              href="https://wa.me/5522992238673"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-xs sm:text-sm text-emerald-400 font-bold hover:text-emerald-300 transition-colors"
            >
              <MessageSquare className="w-4 h-4 fill-emerald-500/10" />
              <span>(22) 99223-8673 (WhatsApp)</span>
            </a>
            <a
              href="tel:22992238673"
              className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4 text-brand-orange" />
              <span>Ligar Grátis: (22) 99223-8673</span>
            </a>
            <a
              href="mailto:dev.brsa@gmail.com"
              className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4 text-brand-orange" />
              <span className="truncate">dev.brsa@gmail.com</span>
            </a>
            <div className="flex items-start gap-2.5 text-xs text-slate-400 leading-normal">
              <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
              <p>Atendimento: Cabo Frio, São Pedro da Aldeia, Búzios, Unamar, Barra de São João, Rio das Ostras e Macaé.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Footer bottom bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 border-t border-slate-900 pt-8 flex flex-col items-center justify-center text-center text-xs gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
          <span>BSA Projetos © 2026. Todos os direitos reservados. CNPJ Ativo.</span>
          {onAdminClick && (
            <button
              onClick={onAdminClick}
              className="text-slate-500 hover:text-brand-orange hover:underline font-bold transition-all cursor-pointer text-xs"
            >
              • Painel Administrativo
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-500 justify-center">
          <span>Feito com</span>
          <Heart className="w-3 h-3 text-brand-orange fill-brand-orange animate-pulse" />
          <span>de Cabo Frio a Macaé, RJ</span>
        </div>
      </div>
    </footer>
  );
}
