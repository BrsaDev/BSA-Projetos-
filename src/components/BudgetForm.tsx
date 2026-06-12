import React, { useState, useEffect } from 'react';
import { FileText, Check, MessageSquare, AlertCircle } from 'lucide-react';
import { ServiceCategory, BudgetInquiry } from '../types';

interface BudgetFormProps {
  selectedCategory: ServiceCategory | null;
  clearSelectedCategory: () => void;
}

export default function BudgetForm({ selectedCategory, clearSelectedCategory }: BudgetFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Cabo Frio');
  const [selectedServices, setSelectedServices] = useState<ServiceCategory[]>([]);
  const [scale, setScale] = useState<'pequeno' | 'medio' | 'grande' | 'comercial'>('pequeno');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill service if user clicked "Simular este Serviço" from another section
  useEffect(() => {
    if (selectedCategory) {
      if (!selectedServices.includes(selectedCategory)) {
        setSelectedServices([selectedCategory]);
      }
      // Scroll to the budget section
      const element = document.getElementById('orcamento');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      // Clear parent state so they can toggle freely afterwards
      clearSelectedCategory();
    }
  }, [selectedCategory]);

  const cities = [
    'Cabo Frio',
    'São Pedro da Aldeia',
    'Armação dos Búzios',
    'Unamar',
    'Barra de São João',
    'Rio das Ostras',
    'Macaé'
  ];

  const serviceOptions: { value: ServiceCategory; label: string }[] = [
    { value: 'alvenaria', label: 'Alvenaria & Pisos' },
    { value: 'pintura', label: 'Pintura Residencial' },
    { value: 'eletrica', label: 'Elétrica Geral' },
    { value: 'hidraulica', label: 'Hidráulica & Esgoto' },
    { value: 'marcenaria', label: 'Marcenaria & Painéis' },
    { value: 'carpintaria', label: 'Carpintaria & Telhados' }
  ];

  const handleServiceToggle = (val: ServiceCategory) => {
    if (selectedServices.includes(val)) {
      setSelectedServices(selectedServices.filter(s => s !== val));
    } else {
      setSelectedServices([...selectedServices, val]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || selectedServices.length === 0) {
      alert("Por favor, preencha seu Nome, Celular e selecione pelo menos 1 serviço!");
      return;
    }

    const servicesNamesStr = selectedServices
      .map(s => serviceOptions.find(o => o.value === s)?.label || s)
      .join(', ');

    const scaleLabel = 
      scale === 'pequeno' ? 'Pequeno Reparo' :
      scale === 'medio' ? 'Cômodo Único / Médio Porte' :
      scale === 'grande' ? 'Imóvel Inteiro / Grande Porte' : 'Comercial';

    // Save proposal to the common local repository
    const newProposal: BudgetInquiry = {
      id: Date.now().toString(),
      name,
      phone,
      city,
      services: selectedServices,
      scale,
      description,
      createdAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'aberto'
    };

    try {
      const existingProposalsStr = localStorage.getItem('bsa_budget_proposals');
      const existingProposals = existingProposalsStr ? JSON.parse(existingProposalsStr) : [];
      const updatedProposals = [newProposal, ...existingProposals];
      localStorage.setItem('bsa_budget_proposals', JSON.stringify(updatedProposals));
    } catch (err) {
      console.error("Local storage error when saving proposal: ", err);
    }

    // WhatsApp Message Compilation
    const message = `*BSA PROJETOS - NOVA PROPOSTA DE ORÇAMENTO*
━━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${name}
📞 *Contato:* ${phone}
📍 *Cidade / Local:* ${city}
🛠️ *Serviços requisitados:* [ ${servicesNamesStr} ]
📊 *Escopo de Atuação:* ${scaleLabel}
📝 *Mais detalhes:* ${description || 'Nenhum detalhe adicional fornecido.'}
━━━━━━━━━━━━━━━━━━━━━
*Enviado via Formulário de Orçamento do site bsa.com*`;

    // Direct redirection link
    const whatsappUrl = `https://wa.me/5522992238673?text=${encodeURIComponent(message)}`;
    
    setSubmitted(true);
    
    // Redirect after a micro delay
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      // Reset state for a neat reset experience
      setName('');
      setPhone('');
      setSelectedServices([]);
      setDescription('');
      setSubmitted(false);
    }, 1000);
  };

  return (
    <section id="orcamento" className="w-full py-20 px-4 md:px-6 bg-slate-900 text-white relative">
      {/* Decorative back layer glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-4/5 h-1/2 bg-brand-orange/5 rounded-full blur-3xl z-0 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header section inside the dark box */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-brand-orange text-sm font-black tracking-widest uppercase mb-2">
            Proposta de Orçamento Sem Compromisso
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4 font-display">
            Fale Sobre o Seu Projeto de Reforma ou Manutenção
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Selecione as especialidades que necessita e os dados do seu local abaixo. Nossa equipe técnica analisará cada item de forma personalizada para elaborar uma proposta comercial técnica e assertiva.
          </p>
        </div>

        {/* Interactive Input Form centered card */}
        <div className="bg-slate-850/60 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-10 bsa-shadow-lg max-w-3xl mx-auto">
          <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2.5 mb-6 border-b border-slate-800 pb-3" id="proposta-title">
            <FileText className="w-5 h-5 text-brand-orange" />
            <span>Enviar Proposta de Orçamento</span>
          </h3>

          {submitted ? (
            <div className="py-12 px-4 text-center animate-in fade-in duration-300">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 scale-110">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h4 className="text-xl font-black text-white mb-2">Proposta Registrada!</h4>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                Estamos abrindo o WhatsApp do Consultor de Projetos para oficializar o envio dos detalhes em tempo real.
              </p>
              <div className="inline-block px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 text-xs animate-pulse">
                Redirecionando de forma segura...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" id="proposta-form">
              
              {/* Step 1: Services Choices */}
              <div>
                <label className="text-sm font-black text-slate-350 block mb-3 uppercase tracking-wider">
                  1. Quais serviços você de fato precisa? <span className="text-brand-orange">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {serviceOptions.map((opt) => {
                    const isChecked = selectedServices.includes(opt.value);
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => handleServiceToggle(opt.value)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left ${
                          isChecked
                            ? 'border-brand-orange bg-brand-orange/10 text-white font-bold'
                            : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-400'
                        }`}
                      >
                        <span className="text-xs sm:text-sm">{opt.label}</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isChecked ? 'bg-brand-orange border-brand-orange text-white' : 'border-slate-700 bg-slate-950'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid block for details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Step 2: City Choice */}
                <div>
                  <label htmlFor="city-select" className="text-sm font-black text-slate-350 block mb-2 uppercase tracking-wider">
                    2. Sua localidade / Cidade <span className="text-brand-orange">*</span>
                  </label>
                  <select
                    id="city-select"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-800 focus:border-brand-orange/80 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none transition-colors"
                  >
                    {cities.map(c => (
                      <option key={c} value={c} className="bg-slate-950 text-slate-200">{c}</option>
                    ))}
                  </select>
                </div>

                {/* Step 3: Project scale */}
                <div>
                  <label htmlFor="scale-select" className="text-sm font-black text-slate-350 block mb-2 uppercase tracking-wider">
                    3. Escopo Geral Contratado
                  </label>
                  <select
                    id="scale-select"
                    value={scale}
                    onChange={(e: any) => setScale(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-800 focus:border-brand-orange/80 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none transition-colors"
                  >
                    <option value="pequeno" className="bg-slate-950">Pequeno Reparo (Rápido, pontual)</option>
                    <option value="medio" className="bg-slate-950">Cômodo Único (Manutenção média)</option>
                    <option value="grande" className="bg-slate-950">Imóvel Inteiro (Reforma integral)</option>
                    <option value="comercial" className="bg-slate-950">Espaço Comercial / Escritórios</option>
                  </select>
                </div>
              </div>

              {/* Step 4: Personal Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="client-name" className="text-sm font-black text-slate-350 block mb-2 uppercase tracking-wider">
                    Seu Nome Completo <span className="text-brand-orange">*</span>
                  </label>
                  <input
                    id="client-name"
                    type="text"
                    required
                    placeholder="Ex: João Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-800 focus:border-brand-orange/80 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="client-phone" className="text-sm font-black text-slate-350 block mb-2 uppercase tracking-wider">
                    Celular com WhatsApp <span className="text-brand-orange">*</span>
                  </label>
                  <input
                    id="client-phone"
                    type="tel"
                    required
                    placeholder="(22) 99XXX-XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-800 focus:border-brand-orange/80 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Step 5: Description */}
              <div>
                <label htmlFor="project-desc" className="text-sm font-black text-slate-350 block mb-2 uppercase tracking-wider">
                  Descrição dos Detalhes da Reforma ou Manutenção (Opcional)
                </label>
                <textarea
                  id="project-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva detalhes específicos da sua obra, ex: troca de revestimento porcelanato na cozinha, lixamento de paredes, pintura acrílica com acabamento fosco..."
                  className="w-full bg-slate-900 border-2 border-slate-800 focus:border-brand-orange/80 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none transition-colors resize-none leading-relaxed"
                ></textarea>
              </div>

              {/* Submit triggers direct WhatsApp */}
              <div className="mt-2" id="proposta-submit-div">
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white font-black text-base transition-transform transform active:scale-98 bsa-shadow bsa-shadow-orange flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5 fill-white/10" />
                  <span>Enviar Orçamento via WhatsApp</span>
                </button>
                <div className="flex flex-col sm:flex-row sm:justify-between items-center text-center text-[11px] text-slate-500 mt-3 gap-1">
                  <span>Atendimento ágil pelo WhatsApp: <strong>(22) 99223-8673</strong></span>
                  <span>📍 Atendimento de Cabo Frio a Macaé</span>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </section>
  );
}
