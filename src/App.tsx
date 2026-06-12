import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ServicesGrid from './components/ServicesGrid';
import ProjectsGallery from './components/ProjectsGallery';
import AboutUs from './components/AboutUs';
import BudgetForm from './components/BudgetForm';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import AdminPanel from './components/AdminPanel';
import ClientReviewForm from './components/ClientReviewForm';
import { ServiceCategory } from './types';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Synchronized open/close wrappers to manage browser history for mobile "back" close action.
  const handleOpenAdmin = () => {
    window.history.pushState({ adminOpen: true }, "");
    setAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    setAdminOpen(false);
    if (window.history.state && window.history.state.adminOpen) {
      window.history.back();
    }
  };

  // Listen to browser popstate to handle phone physical/gesture back button correctly
  useEffect(() => {
    const handlePopstate = (event: PopStateEvent) => {
      // If administrative panel is open, close it instead of navigating to previous page
      if (adminOpen) {
        setAdminOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopstate);
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [adminOpen]);

  // Initialize and read URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
    if (params.get('admin') === 'true') {
      window.history.pushState({ adminOpen: true }, "");
      setAdminOpen(true);
    }
  }, []);

  const handleSelectCategory = (category: ServiceCategory) => {
    setSelectedCategory(category);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

  const handleFinishReview = () => {
    setToken(null);
    // Remove token query param from browser address bar smoothly without full reload
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.pushState({}, '', url.pathname + url.hash);
  };

  // If a secure evaluation token is present, show ONLY the Client Feedback Submission experience
  if (token) {
    return (
      <div className="min-h-screen bg-slate-50 relative selection:bg-brand-orange selection:text-white">
        <ClientReviewForm tokenId={token} onFinished={handleFinishReview} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fafbfc] transition-colors relative selection:bg-brand-orange selection:text-white">
      {/* Header and top navigation alerts */}
      <Header />

      <main className="flex-grow">
        {/* Visual Presentation intro section */}
        <Hero />

        {/* Core Services disciplines */}
        <ServicesGrid onSelectCategory={handleSelectCategory} />

        {/* Real finished work portfolio gallery */}
        <ProjectsGallery />

        {/* Dynamic customer testimonials and regional specificity */}
        <AboutUs />

        {/* Fully interactive simulated budget tool and contact bridge */}
        <BudgetForm 
          selectedCategory={selectedCategory} 
          clearSelectedCategory={handleClearCategory} 
        />
      </main>

      {/* Structured contact footer with Admin Portal entry and onAdminClick handler */}
      <Footer onAdminClick={handleOpenAdmin} />

      {/* Floating fast-access green WhatsApp button */}
      <FloatingWhatsApp />

      {/* Overlay Admin Panel modal */}
      {adminOpen && (
        <AdminPanel onClose={handleCloseAdmin} />
      )}
    </div>
  );
}
