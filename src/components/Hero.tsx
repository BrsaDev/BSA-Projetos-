import { Shield, Sparkles, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import heroImg from '../assets/images/hero_banner_1781186800901.jpg';

export default function Hero() {
  const whatsappLink = "https://wa.me/5522992238673?text=Olá!%20Gostaria%20de%20solicitar%20um%20orçamento%20para%20reforma%20de%20imóvel%20com%20a%20BSA%20Projetos.";

  const highlights = [
    { icon: Shield, text: "Garantia e Segurança em cada etapa" },
    { icon: Sparkles, text: "Acabamento Premium de alto padrão" },
    { icon: Clock, text: "Pontualidade e Limpeza no pós-obra" },
  ];

  return (
    <section id="inicio" className="relative w-full overflow-hidden bg-slate-900 text-white min-h-[90vh] md:min-h-screen flex items-center pt-8 pb-16">
      {/* Background Image / Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Home Renovation Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
        <div className="absolute inset-0 bg-radial-at-t from-transparent via-slate-950/40 to-slate-950"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Lead Copy */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/20 border border-brand-orange/40 text-brand-orange text-xs sm:text-sm font-bold w-fit animate-pulse-slow">
            <Sparkles className="w-4 h-4" />
            <span>Sua casa ou empresa renovada com excelência</span>
          </div>

          <h1 className="text-3.5xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight md:leading-none text-white font-display">
            Mão de obra <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-amber-400 to-brand-orange">especializada</span> para sua obra e reforma!
          </h1>

          <p className="text-slate-300 text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-2xl">
            A <strong className="text-white font-bold">BSA Projetos</strong> realiza serviços residenciais e comerciais de alta qualidade de <strong className="text-brand-orange">Cabo Frio a Macaé, RJ</strong>. Executamos sua ideia com perfeição técnica e no prazo acordado.
          </p>

          {/* Quick list specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                <item.icon className="w-5 h-5 text-brand-orange shrink-0" />
                <span className="text-xs sm:text-sm text-slate-200 font-semibold">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col xs:flex-row gap-4 pt-4">
            <a
              href="#orcamento"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white font-black text-base transition-all transform hover:scale-103 active:scale-97 bsa-shadow bsa-shadow-orange"
            >
              Solicitar Orçamento Comercial
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base transition-all transform hover:scale-103 active:scale-97 bsa-shadow"
            >
              <MessageSquare className="w-5 h-5 fill-white/10" />
              <span>Chamar no WhatsApp</span>
            </a>
          </div>

          {/* Areas summary tagger */}
          <div className="pt-2 text-xs text-slate-400 flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-300">Áreas de atuação:</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Cabo Frio</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">São Pedro da Aldeia</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Búzios</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Unamar</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Barra de São João</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Rio das Ostras</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Macaé</span>
          </div>
        </div>

        {/* Visual Callout - Renovation Card Deck */}
        <div className="lg:col-span-5 hidden lg:block relative">
          <div className="relative z-10 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 bsa-shadow-lg max-w-sm ml-auto">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <CheckCircle className="w-5 h-5 text-brand-orange" />
              <span>Atuação Multidisciplinar</span>
            </h3>
            
            <div className="flex flex-col gap-4">
              {[
                { name: "Pintura", label: "Fina, Texturizada e Portas", badge: "Premium" },
                { name: "Hidráulica", label: "Água Quente, Fria e Esgoto", badge: "Técnico" },
                { name: "Elétrica", label: "Redes, Quadros e Iluminação LED", badge: "Seguro" },
                { name: "Alvenaria", label: "Pisos, Porcelanatos e Estruturas", badge: "Sólido" },
                { name: "Marcenaria", label: "Móveis e Painéis Planejados", badge: "Sob Medida" },
                { name: "Carpintaria", label: "Telhados, Decks & Coberturas", badge: "Robusto" },
              ].map((serv, index) => (
                <div key={index} className="flex justify-between items-center bg-slate-850/50 p-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <h4 className="text-sm font-black text-white">{serv.name}</h4>
                    <p className="text-xs text-slate-400">{serv.label}</p>
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded border border-brand-orange/20">
                    {serv.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-brand-orange/20 rounded-full blur-3xl z-0"></div>
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-brand-blue-light/30 rounded-full blur-3xl z-0"></div>
        </div>
      </div>
    </section>
  );
}
