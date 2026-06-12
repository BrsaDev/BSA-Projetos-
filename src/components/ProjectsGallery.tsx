import { useState, useEffect } from 'react';
import { MapPin, Eye, X, Calendar, Wrench, ChevronLeft, ChevronRight, HelpCircle, Loader2 } from 'lucide-react';
import { PortfolioProject, ServiceCategory } from '../types';

export default function ProjectsGallery() {
  const [activeTab, setActiveTab] = useState<ServiceCategory | 'todos'>('todos');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    fetch('/api/projects')
      .then((res) => {
        if (!res.ok) throw new Error("Erro de rede");
        return res.json();
      })
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar projetos do servidor:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();

    // Listen for portfolio updates from Admin overlay
    const handleUpdate = () => {
      fetchProjects();
    };
    window.addEventListener('projects-updated', handleUpdate);
    return () => {
      window.removeEventListener('projects-updated', handleUpdate);
    };
  }, []);

  const tabs: { value: ServiceCategory | 'todos'; label: string }[] = [
    { value: 'todos', label: 'Todos os Projetos' },
    { value: 'alvenaria', label: 'Alvenaria' },
    { value: 'pintura', label: 'Pintura' },
    { value: 'eletrica', label: 'Elétrica' },
    { value: 'hidraulica', label: 'Hidráulica' },
    { value: 'marcenaria', label: 'Marcenaria' },
    { value: 'carpintaria', label: 'Carpintaria' },
  ];

  const filteredProjects = activeTab === 'todos' 
    ? projects 
    : projects.filter(p => p.category === activeTab);

  return (
    <section id="portfolio" className="w-full py-20 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div className="max-w-2xl text-left">
            <div className="text-brand-orange text-sm font-black tracking-widest uppercase mb-2">
              Portfólio em Foco
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-blue mb-3 leading-tight font-display">
              Veja Projetos que Realizamos de Ponta a Ponta
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Nossa melhor recomendação é a qualidade visível das reformas já entregues. Cada foto ilustra nosso rigor com cortes, alinhamento e acabamento primoroso.
            </p>
          </div>

          {/* Location badge */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-gray-light border border-slate-200 w-fit shrink-0 bsa-shadow">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
            </span>
            <span className="text-xs font-bold text-slate-700">100% de Clientes Satisfeitos RJ</span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-2 border-b border-slate-100 scrollbar-none scroll-smooth">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.value
                  ? 'bg-brand-blue text-white bsa-shadow scale-102 font-extrabold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.value ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-500'}`}>
                {tab.value === 'todos' 
                  ? projects.length 
                  : projects.filter(p => p.category === tab.value).length
                }
              </span>
            </button>
          ))}
        </div>

        {/* Projects Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
            <Loader2 className="w-10 h-10 animate-spin text-brand-orange mb-4" />
            <p className="text-sm font-bold text-slate-500">Buscando as novidades do portfólio...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-sm font-bold text-slate-400">Nenhum projeto cadastrado nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="group bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden bsa-shadow hover:scale-102 hover:border-brand-blue-light/10 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Section */}
                <div className="relative overflow-hidden aspect-[4/3] cursor-pointer" onClick={() => setSelectedProject(proj)}>
                  <img
                    src={proj.imageUrl}
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                  />
                  
                  {/* Overlay Badge */}
                  <span className="absolute top-4 left-4 bg-brand-blue/95 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bsa-shadow">
                    {proj.categoryLabel}
                  </span>

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 duration-300">
                    <div className="flex items-center gap-1.5 text-white">
                      <MapPin className="w-4 h-4 text-brand-orange" />
                      <span className="text-xs font-bold">{proj.location}</span>
                    </div>
                    <div className="bg-brand-orange text-white p-2 rounded-full bsa-shadow">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Content and Details */}
                <div className="p-6">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{proj.location}</span>
                  </div>
                  <h3 className="text-lg font-black text-brand-blue font-display leading-snug mb-2 group-hover:text-brand-orange transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 h-16 overflow-hidden text-ellipsis leading-relaxed mb-4 font-sans">
                    {proj.description}
                  </p>

                  {/* Micro Before/After indicator on Card */}
                  {proj.beforeAfter && (
                    <div className="bg-white border border-slate-100 p-3 rounded-xl flex flex-col gap-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Após BSA Projetos</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-semibold italic line-clamp-1">
                        "{proj.beforeAfter.afterDesc}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer card action */}
                <div className="px-6 pb-6 pt-2 border-t border-slate-100/50">
                  <button
                    onClick={() => setSelectedProject(proj)}
                    className="w-full py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Detalhes do Projeto</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal (Zoomed Project) */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-3xl overflow-hidden bsa-shadow-lg w-full max-w-3xl animate-fade-in relative flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button top-right */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-10 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full transition-colors bsa-shadow"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Zoomed Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={selectedProject.imageUrl}
                  alt={selectedProject.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter brightness-90"
                />
                
                {/* Brand Logo Watermark */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md border border-slate-100 rounded-full px-4 py-1.5 bsa-shadow flex items-center gap-2">
                  <span className="text-xs font-black text-brand-blue tracking-tight">
                    BSA<span className="text-brand-orange">Projetos</span>
                  </span>
                </div>
              </div>

              {/* Details Content (Scrollable if overflow) */}
              <div className="p-6 sm:p-8 overflow-y-auto flex-grow">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 mb-2.5">
                  <span className="bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-3 py-0.5 rounded-full uppercase text-[10px] font-black">
                    {selectedProject.categoryLabel}
                  </span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedProject.location}</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-brand-blue font-display mb-3 leading-snug">
                  {selectedProject.title}
                </h3>
                
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {selectedProject.description}
                </p>

                {/* Before / After Section */}
                {selectedProject.beforeAfter && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-brand-gray-light border border-slate-150 p-5 rounded-2xl">
                    <div className="border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0 sm:pr-4">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Antes da Intervenção:
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 font-bold italic">
                        "{selectedProject.beforeAfter.beforeDesc}"
                      </p>
                    </div>
                    <div className="sm:pl-1">
                      <div className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-1">
                        Entregue Pela BSA:
                      </div>
                      <p className="text-xs sm:text-sm text-brand-blue font-extrabold italic">
                        "{selectedProject.beforeAfter.afterDesc}"
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Modal CTA */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/5522992238673?text=Olá!%20Vi%20o%20projeto%20"${encodeURIComponent(selectedProject.title)}"%2520no%2520site%2520e%2520gostaria%2520de%2520saber%2520mais%2520para%2520o%2520meu%2520imóvel.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center items-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm transition-colors bsa-shadow"
                  >
                    <span>Falar sobre este projeto no WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="py-3 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
