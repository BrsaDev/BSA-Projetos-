import { useState, useEffect } from "react";
import { Award, UserCheck, HeartHandshake, History, Star, Compass, ShieldCheck } from 'lucide-react';

export default function AboutUs() {
  const [dynamicReviews, setDynamicReviews] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/public-reviews")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDynamicReviews(data);
        }
      })
      .catch((err) => console.error("Erro ao obter avaliações dinâmicas:", err));
  }, []);

  const values = [
    {
      icon: Award,
      title: 'Compromisso Técnico',
      desc: 'Executamos serviços com rigorosas especificações técnicas, garantindo durabilidade estendida mesmo sob severa agressão salina.'
    },
    {
      icon: UserCheck,
      title: 'Mão de Obra Treinada',
      desc: 'Nossa equipe é qualificada e de total confiança, atuando sempre uniformizada e orientada ao atendimento prestativo.'
    },
    {
      icon: HeartHandshake,
      title: 'Zero Dor de Cabeça',
      desc: 'Realizamos a gestão de insumos, compras de materiais, cumprimento de prazos e organização com absoluta honestidade.'
    }
  ];

  const testimonials = [
    {
      name: 'Camila Vasconcellos',
      city: 'Cabo Frio - RJ',
      role: 'Proprietária de Imóvel no Canal',
      stars: 5,
      comment: 'Fizeram a reforma elétrica e de revestimento do meu banheiro. Super profissionais! O que mais gostei foi a limpeza pós-obra e a pontualidade na entrega.',
      verified: false
    },
    {
      name: 'Roberto Antunes',
      city: 'Armação dos Búzios - RJ',
      role: 'Gerente Comercial',
      stars: 5,
      comment: 'A marcenaria e pintura da minha pizzaria foram executadas com rapidez absurda. Resolveram problemas de umidade salina no reboco perfeitamente.',
      verified: false
    },
    {
      name: 'Sandro Neves',
      city: 'Arraial do Cabo - RJ',
      role: 'Aluguel de Temporada',
      stars: 5,
      comment: 'Contratei a BSA para serviços hidráulicos e pintura externa da fachada da minha pousada. Serviço com total garantia e ótimo preço!',
      verified: false
    }
  ];

  const allTestimonials = [
    ...dynamicReviews.map((dr) => ({
      name: dr.clientName,
      city: dr.city,
      role: dr.serviceType || "Serviço de Obra",
      stars: dr.stars,
      comment: dr.comment,
      verified: true,
    })),
    ...testimonials,
  ];

  return (
    <section id="sobre" className="w-full py-20 px-4 md:px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* About Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          
          {/* Text Info */}
          <div className="lg:col-span-6 text-left flex flex-col gap-5">
            <div className="text-brand-orange text-sm font-black tracking-widest uppercase mb-1">
              Sobre a BSA Projetos
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-brand-blue font-display leading-tight">
              Sua Melhor Escolha para Manutenção e Reforma Residencial e Comercial
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Formada por uma equipe de profissionais apaixonados por excelência e engenharia integrada, a <strong>BSA Projetos</strong> nasceu com o objetivo claro de acabar com os temores frequentes de proprietários ao lidar com obras em nossa área de cobertura: atrasos inexplicáveis, desperdício de tintas, entulhos acumulados e fiação mal dimensionada.
            </p>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Com conhecimentos detalhados sobre as demandas específicas do clima litorâneo da região (como a incidência agressiva de <strong>maresia, salitre e lençol freático alto</strong>), nós fornecemos serviços de alvenaria fina, impermeabilizações pesadas, pintura de alta resistência, elétrica em conformidade robusta e marcenaria sob medida de alto padrão.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-brand-orange">100+</span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider block mt-1">
                  Obras Entregues
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-brand-orange">22/7</span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider block mt-1">
                  Suporte Ativo
                </span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-brand-orange">12 m</span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider block mt-1">
                  Garantia Mínima
                </span>
              </div>
            </div>
          </div>

          {/* Core Values Illustration Box */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="bg-brand-gray-light rounded-3xl border border-slate-150 p-6 sm:p-8 bsa-shadow">
              <h3 className="text-lg font-black text-brand-blue font-display flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
                <Compass className="w-5 h-5 text-brand-orange" />
                <span>Nossas Diretrizes de Qualidade</span>
              </h3>
              
              <div className="flex flex-col gap-6">
                {values.map((v, i) => {
                  const Icon = v.icon;
                  return (
                    <div key={i} className="flex gap-4 items-start text-left">
                      <div className="p-3 bg-brand-blue text-white rounded-2xl bsa-shadow shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-brand-blue uppercase tracking-wider mb-1">
                          {v.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 leading-normal">
                          {v.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Client Testimonials Section */}
        <div className="border-t border-slate-100 pt-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-brand-orange text-sm font-black tracking-widest uppercase mb-2">
              Depoimentos Reais
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-brand-blue font-display">
              Veja a Opinião de Quem Já Contratou a BSA
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-2">
              A satisfação de nossos clientes em cada cidade atendida é a nossa maior recompensa. Coletamos feedbacks honestos de obras finalizadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allTestimonials.map((test, index) => (
              <div key={index} className="bg-slate-50 rounded-2xl border border-slate-100 p-6 text-left flex flex-col justify-between bsa-shadow relative overflow-hidden group hover:border-brand-orange/30 transition-all">
                {test.verified && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verificado</span>
                  </div>
                )}
                <div>
                  {/* Stars group */}
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(test.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 stroke-0" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed mb-4">
                    "{test.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200/50">
                  <div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue font-black flex items-center justify-center text-sm shrink-0 uppercase border border-slate-200">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-brand-blue">
                      {test.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {test.role} • <strong className="text-brand-orange">{test.city}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
