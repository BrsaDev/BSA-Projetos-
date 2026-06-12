import { useState } from 'react';
import { Paintbrush, Droplet, Zap, Hammer, Ruler, ChevronDown, CheckCheck, Landmark, Wrench } from 'lucide-react';
import { ServiceCategory } from '../types';

interface ServicesGridProps {
  onSelectCategory: (category: ServiceCategory) => void;
}

export default function ServicesGrid({ onSelectCategory }: ServicesGridProps) {
  const [expandedId, setExpandedId] = useState<ServiceCategory | null>(null);

  const services = [
    {
      id: 'pintura' as ServiceCategory,
      title: 'Pintura',
      shortDesc: 'Acabamento residencial refinado, pintura interna/externa e tratamentos estruturais.',
      description: 'Oferecemos soluções de pintura residencial e comercial com preparação completa de superfícies. Garantimos proteção, correção de rachaduras superficiais e aplicação das melhores marcas do mercado.',
      icon: Paintbrush,
      color: 'from-orange-500 to-amber-500 hover:shadow-orange-500/10',
      iconColor: 'text-amber-500 bg-amber-50',
      bullets: [
        'Pintura interna e externa de alto padrão',
        'Aplicação de massa corrida e massa acrílica',
        'Paredes decorativas (cimento queimado, texturas rústicas)',
        'Pintura de portas, portões, esquadrias e verniz',
        'Tratamento preventivo contra mofo e umidade'
      ]
    },
    {
      id: 'hidraulica' as ServiceCategory,
      title: 'Hidráulica',
      shortDesc: 'Identificação de vazamentos, instalações sanitárias e rede de água quente/fria.',
      description: 'Soluções rápidas e limpas para sistemas hidráulicos. Trabalhamos seguindo estritamente as normas da ABNT para evitar problemas de pressão e garantir a estanqueidade total do encanamento.',
      icon: Droplet,
      color: 'from-blue-500 to-indigo-500 hover:shadow-blue-500/10',
      iconColor: 'text-blue-500 bg-blue-50',
      bullets: [
        'Localização e reparo de vazamentos e infiltrações',
        'Instalação de metais: torneiras, chuveiros, misturadores',
        'Rede de esgoto, ralos e sifões',
        'Instalação e limpeza de caixas d’água',
        'Bombas d’água, pressurizadores e encanamento geral'
      ]
    },
    {
      id: 'eletrica' as ServiceCategory,
      title: 'Elétrica',
      shortDesc: 'Segurança elétrica total: reformas de fiação, iluminação planejada e disjuntores.',
      description: 'Instalações elétricas seguras para sua tranquilidade. Desde pequenos reparos até projetos completos de iluminação em LED e reestruturação de quadros elétricos de acordo com a norma NBR 5410.',
      icon: Zap,
      color: 'from-yellow-500 to-amber-500 hover:shadow-yellow-500/10',
      iconColor: 'text-amber-600 bg-amber-50',
      bullets: [
        'Instalação completa de luminárias, spots e fitas de LED',
        'Substituição de fiação antiga por cabos normatizados',
        'Organização e montagem de quadro de distribuição (disjuntores)',
        'Instalação e ligação de chuveiros e tomadas tripolar',
        'Aterramentos e proteção contra surtos para eletrodomésticos'
      ]
    },
    {
      id: 'alvenaria' as ServiceCategory,
      title: 'Alvenaria',
      shortDesc: 'Assentamento de porcelanato com alta precisão, reboco e pequenas reformas estruturais.',
      description: 'Seus ambientes com nivelamento impecável. Somos especialistas em assentamento de pisos, porcelanatos, revestimentos cerâmicos, rebocos e toda parte bruta de sua reforma.',
      icon: Hammer,
      color: 'from-red-500 to-rose-500 hover:shadow-red-500/10',
      iconColor: 'text-rose-500 bg-rose-50',
      bullets: [
        'Assentamento de pisos, porcelanatos e azulejos em geral',
        'Levantamento de paredes, emboço e contrapiso nivelado',
        'Churrasqueiras, bancadas em concreto e alvenaria decorativa',
        'Abertura de vãos, reforma de calçadas e rebocos',
        'Demolição planejada e desapego correto de entulhos'
      ]
    },
    {
      id: 'marcenaria' as ServiceCategory,
      title: 'Marcenaria',
      shortDesc: 'Móveis planejados de fino acabamento, rodapés e manutenção de peças existentes.',
      description: 'Marcenaria de precisão com foco em usabilidade e acabamento estético. Atendemos desde a instalação de rodapés e painéis ripados à execução de móveis planejados de alto acabamento.',
      icon: Ruler,
      color: 'from-teal-500 to-emerald-500 hover:shadow-teal-500/10',
      iconColor: 'text-teal-600 bg-teal-50',
      bullets: [
        'Projetos e montagem de móveis sob medida para todos os cômodos',
        'Construção e tratamento de decks residenciais de piscina',
        'Instalação de portas de correr, marcos e fechaduras de segurança',
        'Painéis decorativos, rodapés em MDF ou madeira maciça',
        'Manutenção e ajuste de portas de armários e dobradiças emperradas'
      ]
    },
    {
      id: 'carpintaria' as ServiceCategory,
      title: 'Carpintaria',
      shortDesc: 'Montagem de telhados, decks, pergolados, coberturas e estruturas em madeira silvestre.',
      description: 'Estruturas de madeira sob medida e com resistência de alta qualidade. Executamos montagem e reforma de telhados, pergolados ornamentais, decks de piscina, quiosques, divisórias de madeira e galpões.',
      icon: Wrench,
      color: 'from-amber-600 to-yellow-600 hover:shadow-amber-600/10',
      iconColor: 'text-amber-700 bg-amber-50',
      bullets: [
        'Construção e reforma de telhados, tesouras e coberturas',
        'Montagem de pergolados e quiosques decorativos em madeira de lei',
        'Decks em madeira tratada de alta durabilidade para piscinas',
        'Mezaninos estruturais e escadas sob medida em madeira',
        'Instalação de vigas, colunas de sustentação e cercas residenciais'
      ]
    }
  ];

  const handleToggle = (id: ServiceCategory) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <section id="servicos" className="w-full py-20 px-4 md:px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-brand-orange text-sm font-black tracking-widest uppercase mb-2">
            Nossos Serviços
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-blue mb-4 leading-tight font-display">
            Mão de Obra Profissional para Cada Detalhe do seu Imóvel
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            De pequenos consertos residenciais a reformas do início ao acabamento. Selecione uma especialidade para ver os detalhes completos de nossa atuação.
          </p>
        </div>

        {/* Desktop & Mobile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((serv) => {
            const IconComponent = serv.icon;
            const isExpanded = expandedId === serv.id;

            return (
              <div
                id={`service-card-${serv.id}`}
                key={serv.id}
                className={`flex flex-col bg-white rounded-2xl border transition-all duration-300 bsa-shadow cursor-pointer overflow-hidden ${
                  isExpanded
                    ? 'border-brand-orange/60 ring-2 ring-brand-orange/10 scale-102 lg:col-span-2'
                    : 'border-slate-100 hover:border-brand-blue-light/20 hover:scale-101'
                }`}
                onClick={() => handleToggle(serv.id)}
              >
                {/* Visual Accent Top Bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${serv.color}`} />

                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div>
                    {/* Header: Icon & Expander toggle */}
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl ${serv.iconColor} bsa-shadow`}>
                        <IconComponent className="w-6 h-6 stroke-[2.25]" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none bg-slate-100 px-2 py-0.5 rounded">
                        {isExpanded ? 'Ver Menos' : 'Ver Mais'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-extrabold text-brand-blue font-display mb-2 select-none">
                      {serv.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4 select-none">
                      {isExpanded ? serv.description : serv.shortDesc}
                    </p>

                    {/* Bullets List (Visible only when expanded) */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 animate-slide-down">
                        <h4 className="text-xs font-black text-brand-blue uppercase tracking-widest mb-3">
                          O que realizamos:
                        </h4>
                        <div className="flex flex-col gap-2.5">
                          {serv.bullets.map((bullet, index) => (
                            <div key={index} className="flex items-start gap-2 text-xs text-slate-600">
                              <CheckCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="font-medium">{bullet}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions (always visible at bottom) */}
                  <div className="mt-6 flex flex-col gap-2 pt-4 border-t border-slate-50" onClick={(e) => e.stopPropagation()}>
                    {isExpanded ? (
                      <button
                        onClick={() => onSelectCategory(serv.id)}
                        className="w-full py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-dark text-white font-black text-xs sm:text-sm transition-all text-center bsa-shadow bsa-shadow-orange flex items-center justify-center gap-1.5"
                      >
                        <Landmark className="w-4 h-4" />
                        Solicitar este Serviço
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggle(serv.id)}
                        className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-brand-blue text-slate-700 hover:text-brand-blue font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1"
                      >
                        <span>Ver tudo incluído</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security badge note */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left bsa-shadow max-w-4xl mx-auto">
          <div className="p-3.5 rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCheck className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-brand-blue font-display">
              Execução Sem Sujeira e Sem Dor de Cabeça
            </h4>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-0.5">
              Nossa equipe protege os móveis e pisos, realiza varredura pós-serviço e mantêm o canteiro de obras limpo e seguro para você e sua família em cada projeto realizado.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
