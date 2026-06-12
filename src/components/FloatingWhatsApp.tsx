import { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';

export default function FloatingWhatsApp() {
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    // Show high-value helper balloon after 4 seconds
    const timer = setTimeout(() => {
      setShowTip(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const whatsappLink = "https://wa.me/5522992238673?text=Olá!%20Gostaria%20de%20falar%20com%20a%2520BSA%2520Projetos%2520sobre%2520serviços%2520de%252520manutenção%2520ou%2520reforma.";

  return (
    <div id="floating-whatsapp-trigger" className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 text-right">
      
      {/* Dynamic Pop-up Helper Balloon */}
      {showTip && (
        <div className="bg-white text-slate-800 p-3.5 rounded-2xl bsa-shadow-lg border border-slate-100 max-w-[250px] relative animate-float transition-all pr-8">
          <button
            onClick={() => setShowTip(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
            aria-label="Close tip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex gap-1.5 items-center text-[10px] uppercase font-black tracking-wider text-brand-orange mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Estamos Online</span>
          </div>
          <p className="text-xs font-bold leading-normal text-slate-700">
            Fale conosco e simule seu orçamento direto no WhatsApp!
          </p>
          {/* Balloon Little Triangle pointer */}
          <div className="absolute right-5 bottom-0 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-white border-r border-b border-slate-100"></div>
        </div>
      )}

      {/* Floating pulsing button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center p-4 bg-whatsapp-green hover:bg-whatsapp-green-dark text-white rounded-full bsa-shadow hover:scale-108 active:scale-95 transition-all w-14 h-14 relative"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute inset-0 bg-whatsapp-green rounded-full animate-ping opacity-25"></span>
        <MessageSquare className="w-7 h-7 relative z-10 fill-white/10" />
      </a>
    </div>
  );
}
