import { useState, useEffect, useMemo, FormEvent, ChangeEvent } from "react";
import { 
  Key, Check, X, Link2, Copy, Trash2, Clock, 
  CheckCircle, ArrowLeft, LogOut, Eye, Loader2, Lock, 
  MapPin, Clipboard, Plus, ShieldCheck, Star, Briefcase, Image, Edit, Upload, MessageSquare
} from "lucide-react";

type ServiceCategory = "pintura" | "hidraulica" | "eletrica" | "alvenaria" | "marcenaria" | "carpintaria";

interface PortfolioProject {
  id: string;
  title: string;
  category: ServiceCategory;
  categoryLabel: string;
  description: string;
  location: string;
  imageUrl: string;
  beforeAfter?: {
    beforeDesc: string;
    afterDesc: string;
  };
}

interface ReviewToken {
  id: string;
  clientName: string;
  serviceType: string;
  city: string;
  expiresAt: string | null;
  used: boolean;
  createdAt: string;
}

interface Review {
  id: string;
  clientName: string;
  serviceType: string;
  city: string;
  stars: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface BudgetInquiry {
  id: string;
  name: string;
  phone: string;
  city: string;
  services: ServiceCategory[];
  scale: 'pequeno' | 'medio' | 'grande' | 'comercial';
  description: string;
  createdAt: string;
  status: 'aberto' | 'em_andamento' | 'finalizado' | 'aceito' | 'recusado';
  phase?: 'planejamento' | 'preparacao' | 'execucao' | 'acabamento' | 'entregue';
  notes?: Array<{ id: string; date: string; text: string; author?: string }>;
  finance?: {
    budgetTotal: number;
    materialsCost: number;
    laborCost: number;
    otherExpenses: number;
    payments: Array<{
      id: string;
      date: string;
      amount: number;
      description: string;
      type: 'receita' | 'despesa';
    }>;
  };
}

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [passphrase, setPassphrase] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Admin Data State
  const [tokens, setTokens] = useState<ReviewToken[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [activeTab, setActiveTab] = useState<"moderation" | "links" | "portfolio" | "proposals" | "services">("moderation");
  const [proposals, setProposals] = useState<BudgetInquiry[]>([]);
  const [proposalFilter, setProposalFilter] = useState<"todos" | "aberto" | "em_andamento" | "finalizado" | "aceito" | "recusado">("todos");
  const [proposalCityFilter, setProposalCityFilter] = useState<string>("todos");

  // Services & Finance Management State
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [newTransDesc, setNewTransDesc] = useState("");
  const [newTransAmount, setNewTransAmount] = useState("");
  const [newTransType, setNewTransType] = useState<'receita' | 'despesa'>("receita");
  const [editContractTotal, setEditContractTotal] = useState("");
  const [editMaterialsCost, setEditMaterialsCost] = useState("");
  const [editLaborCost, setEditLaborCost] = useState("");
  const [editOtherExpenses, setEditOtherExpenses] = useState("");

  // Custom react modal state for closing a contract (instead of window.prompt which is blocked inside sandboxed cross-origin iframes)
  const [closingContractProposal, setClosingContractProposal] = useState<BudgetInquiry | null>(null);
  const [contractValueInput, setContractValueInput] = useState("");

  // Derived state to sort & filter proposals (oldest first: ascending by timestamp/id)
  const filteredAndSortedProposals = useMemo(() => {
    return [...proposals]
      .filter((p) => {
        const matchStatus = proposalFilter === "todos" ? true : p.status === proposalFilter;
        const matchCity = proposalCityFilter === "todos" ? true : p.city === proposalCityFilter;
        return matchStatus && matchCity;
      })
      .sort((a, b) => {
        const tA = Number(a.id) || 0;
        const tB = Number(b.id) || 0;
        if (tA && tB) return tA - tB;
        return a.id.localeCompare(b.id);
      });
  }, [proposals, proposalFilter, proposalCityFilter]);

  // Derived state/variables for Active Services & Finance tabs
  const activeServices = useMemo(() => {
    return proposals.filter((p) => p.status === "aceito");
  }, [proposals]);

  const selectedService = useMemo(() => {
    return activeServices.find((s) => s.id === selectedServiceId) || activeServices[0];
  }, [activeServices, selectedServiceId]);

  const serviceFinance = useMemo(() => {
    if (!selectedService) return null;
    return selectedService.finance || {
      budgetTotal: 0,
      materialsCost: 0,
      laborCost: 0,
      otherExpenses: 0,
      payments: []
    };
  }, [selectedService]);

  const financeCalculations = useMemo(() => {
    if (!serviceFinance) {
      return {
        totalBudget: 0,
        materials: 0,
        labor: 0,
        otherExp: 0,
        totalExpenses: 0,
        totalPaymentsReceived: 0,
        totalPaymentsPaidOut: 0,
        balanceToCollect: 0,
        projectedMarginVal: 0,
        projectedMarginPct: 0,
        notesList: []
      };
    }
    const totalBudget = serviceFinance.budgetTotal || 0;
    const materials = serviceFinance.materialsCost || 0;
    const labor = serviceFinance.laborCost || 0;
    const otherExp = serviceFinance.otherExpenses || 0;
    const totalExpenses = materials + labor + otherExp;

    const totalPaymentsReceived = (serviceFinance.payments || [])
      .filter((p) => p.type === 'receita')
      .reduce((sum, item) => sum + item.amount, 0);

    const totalPaymentsPaidOut = (serviceFinance.payments || [])
      .filter((p) => p.type === 'despesa')
      .reduce((sum, item) => sum + item.amount, 0);

    const balanceToCollect = totalBudget - totalPaymentsReceived;
    const projectedMarginVal = totalBudget - totalExpenses;
    const projectedMarginPct = totalBudget > 0 ? (projectedMarginVal / totalBudget) * 105 : 0;

    const notesList = selectedService?.notes || [];

    return {
      totalBudget,
      materials,
      labor,
      otherExp,
      totalExpenses,
      totalPaymentsReceived,
      totalPaymentsPaidOut,
      balanceToCollect,
      projectedMarginVal,
      projectedMarginPct,
      notesList
    };
  }, [serviceFinance, selectedService]);

  // Project Edit state
  const [editingProject, setEditingProject] = useState<Partial<PortfolioProject> | null>(null);
  const [projId, setProjId] = useState("");
  const [projTitle, setProjTitle] = useState("");
  const [projCategory, setProjCategory] = useState<ServiceCategory>("alvenaria");
  const [projLocation, setProjLocation] = useState("");
  const [projDescription, setProjDescription] = useState("");
  const [projImageUrl, setProjImageUrl] = useState("");
  const [projBeforeDesc, setProjBeforeDesc] = useState("");
  const [projAfterDesc, setProjAfterDesc] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Token Generator Form State
  const [clientName, setClientName] = useState("");
  const [serviceType, setServiceType] = useState("Obras Gerais");
  const [city, setCity] = useState("Cabo Frio - RJ");
  const [expiresOption, setExpiresOption] = useState("7d");
  const [genSuccess, setGenSuccess] = useState<string | null>(null);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Restore authenticated session from localStorage if present
  useEffect(() => {
    const savedPin = localStorage.getItem("bsa_admin_pin");
    if (savedPin) {
      verifyPassphrase(savedPin);
    }
  }, []);

  // Sync active finance workspace inputs on selected service switch
  useEffect(() => {
    if (selectedServiceId) {
      const activeSvc = proposals.find(p => p.id === selectedServiceId);
      if (activeSvc && activeSvc.finance) {
        setEditContractTotal(activeSvc.finance.budgetTotal?.toString() || "");
        setEditMaterialsCost(activeSvc.finance.materialsCost?.toString() || "");
        setEditLaborCost(activeSvc.finance.laborCost?.toString() || "");
        setEditOtherExpenses(activeSvc.finance.otherExpenses?.toString() || "");
      } else {
        setEditContractTotal("");
        setEditMaterialsCost("");
        setEditLaborCost("");
        setEditOtherExpenses("");
      }
    }
  }, [selectedServiceId, proposals]);

  const verifyPassphrase = async (pinValue: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: pinValue }),
      });
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setIsAuthenticated(true);
        localStorage.setItem("bsa_admin_pin", pinValue);
        setPassphrase(pinValue);
        fetchAdminData(pinValue);
      } else {
        setError(data.error || "Senha inválida.");
        localStorage.removeItem("bsa_admin_pin");
      }
    } catch (err: any) {
      setError("Erro ao se conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    verifyPassphrase(passphrase);
  };

  const handleLogout = () => {
    localStorage.removeItem("bsa_admin_pin");
    setIsAuthenticated(false);
    setPassphrase("");
    setTokens([]);
    setReviews([]);
    setProjects([]);
    setProposals([]);
    setEditingProject(null);
  };

  const fetchProposals = () => {
    try {
      const stored = localStorage.getItem("bsa_budget_proposals");
      if (stored) {
        setProposals(JSON.parse(stored));
      } else {
        setProposals([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateProposalStatus = (id: string, newStatus: 'aberto' | 'em_andamento' | 'finalizado' | 'aceito' | 'recusado') => {
    try {
      const stored = localStorage.getItem("bsa_budget_proposals");
      const list: BudgetInquiry[] = stored ? JSON.parse(stored) : [];
      const updated = list.map(p => {
        if (p.id === id) {
          const defaultFinance = p.finance || {
            budgetTotal: p.scale === 'pequeno' ? 1200 : p.scale === 'medio' ? 4500 : p.scale === 'grande' ? 15000 : 35000,
            materialsCost: 0,
            laborCost: 0,
            otherExpenses: 0,
            payments: []
          };
          const defaultNotes = p.notes || [
            { id: Math.random().toString(36).substring(2, 9), date: new Date().toLocaleDateString('pt-BR'), text: "Contrato aceito e obra iniciada no sistema!", author: "Sistema" }
          ];
          const defaultPhase = p.phase || 'planejamento';

          return { 
            ...p, 
            status: newStatus,
            phase: defaultPhase,
            notes: defaultNotes,
            finance: defaultFinance
          };
        }
        return p;
      });
      setProposals(updated);
      localStorage.setItem("bsa_budget_proposals", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const updateServicePhase = (id: string, newPhase: 'planejamento' | 'preparacao' | 'execucao' | 'acabamento' | 'entregue') => {
    try {
      const stored = localStorage.getItem("bsa_budget_proposals");
      const list: BudgetInquiry[] = stored ? JSON.parse(stored) : [];
      const updated = list.map(p => {
        if (p.id === id) {
          const notes = [...(p.notes || [])];
          const phaseLabel = {
            planejamento: 'Planejamento',
            preparacao: 'Mobilização/Preparação',
            execucao: 'Execução Ativa',
            acabamento: 'Fase de Acabamentos',
            entregue: 'Obra Finalizada e Entregue'
          }[newPhase];
          notes.push({
            id: Math.random().toString(36).substring(2, 9),
            date: new Date().toLocaleDateString('pt-BR'),
            text: `Etapa atualizada para: ${phaseLabel}`,
            author: "Sistema"
          });
          return { ...p, phase: newPhase, notes };
        }
        return p;
      });
      setProposals(updated);
      localStorage.setItem("bsa_budget_proposals", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const addServiceNote = (id: string, text: string) => {
    if (!text.trim()) return;
    try {
      const stored = localStorage.getItem("bsa_budget_proposals");
      const list: BudgetInquiry[] = stored ? JSON.parse(stored) : [];
      const updated = list.map(p => {
        if (p.id === id) {
          const notes = [...(p.notes || [])];
          notes.push({
            id: Math.random().toString(36).substring(2, 9),
            date: new Date().toLocaleDateString('pt-BR'),
            text: text.trim(),
            author: "Gestor BSA"
          });
          return { ...p, notes };
        }
        return p;
      });
      setProposals(updated);
      localStorage.setItem("bsa_budget_proposals", JSON.stringify(updated));
      setNewNoteText(""); // Clear state
    } catch (e) {
      console.error(e);
    }
  };

  const addFinancePayment = (id: string, amount: number, description: string, type: 'receita' | 'despesa') => {
    if (!amount || !description.trim()) return;
    try {
      const stored = localStorage.getItem("bsa_budget_proposals");
      const list: BudgetInquiry[] = stored ? JSON.parse(stored) : [];
      const updated = list.map(p => {
        if (p.id === id) {
          const finance = p.finance || {
            budgetTotal: 0,
            materialsCost: 0,
            laborCost: 0,
            otherExpenses: 0,
            payments: []
          };
          const payments = [...(finance.payments || [])];
          payments.push({
            id: Math.random().toString(36).substring(2, 9),
            date: new Date().toLocaleDateString('pt-BR'),
            amount,
            description: description.trim(),
            type
          });
          // Also logging inside the progress notes chronologically!
          const notes = [...(p.notes || [])];
          notes.push({
            id: Math.random().toString(36).substring(2, 9),
            date: new Date().toLocaleDateString('pt-BR'),
            text: `Lançamento ${type === 'receita' ? 'de entrada' : 'de saída'}: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - ${description}`,
            author: "Finanças"
          });
          return { ...p, finance: { ...finance, payments }, notes };
        }
        return p;
      });
      setProposals(updated);
      localStorage.setItem("bsa_budget_proposals", JSON.stringify(updated));
      setNewTransDesc("");
      setNewTransAmount("");
    } catch (e) {
      console.error(e);
    }
  };

  const deleteFinancePayment = (id: string, paymentId: string) => {
    if (!window.confirm("Deseja realmente excluir este lançamento financeiro?")) return;
    try {
      const stored = localStorage.getItem("bsa_budget_proposals");
      const list: BudgetInquiry[] = stored ? JSON.parse(stored) : [];
      const updated = list.map(p => {
        if (p.id === id && p.finance) {
          const payments = p.finance.payments.filter(item => item.id !== paymentId);
          return { ...p, finance: { ...p.finance, payments } };
        }
        return p;
      });
      setProposals(updated);
      localStorage.setItem("bsa_budget_proposals", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const updateFinanceCosts = (id: string, budgetTotal: number, materialsCost: number, laborCost: number, otherExpenses: number) => {
    try {
      const stored = localStorage.getItem("bsa_budget_proposals");
      const list: BudgetInquiry[] = stored ? JSON.parse(stored) : [];
      const updated = list.map(p => {
        if (p.id === id) {
          const finance = p.finance || { payments: [] };
          return {
            ...p,
            finance: {
              ...finance,
              budgetTotal,
              materialsCost,
              laborCost,
              otherExpenses
            }
          };
        }
        return p;
      });
      setProposals(updated);
      localStorage.setItem("bsa_budget_proposals", JSON.stringify(updated));
      alert("Valores e custos do contrato salvos com sucesso!");
    } catch (e) {
      console.error(e);
    }
  };

  const deleteProposal = (id: string) => {
    if (!window.confirm("Deseja realmente remover este pedido de orçamento de forma permanente?")) return;
    try {
      const stored = localStorage.getItem("bsa_budget_proposals");
      const list: BudgetInquiry[] = stored ? JSON.parse(stored) : [];
      const updated = list.filter(p => p.id !== id);
      setProposals(updated);
      localStorage.setItem("bsa_budget_proposals", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdminData = async (pin: string = passphrase) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data", {
        headers: { Authorization: `Bearer ${pin}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Sort tokens: unused first, then by date desc
        const sortedTokens = (data.tokens || []).sort((a: any, b: any) => {
          if (a.used !== b.used) return a.used ? 1 : -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setTokens(sortedTokens);
        // Sort reviews: pending first, then by date desc
        const sortedReviews = (data.reviews || []).sort((a: any, b: any) => {
          if (a.status === "pending" && b.status !== "pending") return -1;
          if (a.status !== "pending" && b.status === "pending") return 1;
          return b.id.localeCompare(a.id); // fallback sort
        });
        setReviews(sortedReviews);
        setProjects(data.projects || []);
        fetchProposals();
      } else {
        const errData = await res.json();
        setError(errData.error || "Erro ao carregar dados do painel.");
      }
    } catch (err) {
      setError("Falha de rede ao acessar dados.");
    } finally {
      setLoading(false);
    }
  };

  const generateToken = async (e: FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert("Por favor, preencha o nome do cliente.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/generate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${passphrase}`,
        },
        body: JSON.stringify({
          clientName,
          serviceType,
          city,
          expiresOption,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGenSuccess(data.token.id);
        setClientName("");
        // Refresh token list
        fetchAdminData(passphrase);
      } else {
        const errData = await res.json();
        alert(errData.error || "Erro ao gerar token.");
      }
    } catch (err) {
      alert("Falha de comunicação.");
    } finally {
      setLoading(false);
    }
  };

  const moderateReview = async (reviewId: string, action: "approved" | "rejected" | "pending") => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/moderate-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${passphrase}`,
        },
        body: JSON.stringify({ reviewId, action }),
      });
      if (res.ok) {
        fetchAdminData(passphrase);
      } else {
        const errData = await res.json();
        alert(errData.error || "Erro ao moderar avaliação.");
      }
    } catch (err) {
      alert("Falha ao moderar.");
    } finally {
      setLoading(false);
    }
  };

  const deleteToken = async (tokenId: string) => {
    if (!confirm("Tem certeza que deseja excluir e desativar este link de avaliação?")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/token/${tokenId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${passphrase}` },
      });
      if (res.ok) {
        fetchAdminData(passphrase);
      } else {
        const errData = await res.json();
        alert(errData.error || "Erro ao excluir token.");
      }
    } catch (err) {
      alert("Falha de rede.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (tokenId: string) => {
    const origin = window.location.origin;
    const reviewUrl = `${origin}/?token=${tokenId}`;
    navigator.clipboard.writeText(reviewUrl);
    setCopiedTokenId(tokenId);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const isTokenExpired = (token: ReviewToken) => {
    if (!token.expiresAt) return false;
    return new Date() > new Date(token.expiresAt);
  };

  const startEditProject = (proj: PortfolioProject | null) => {
    if (proj) {
      setProjId(proj.id);
      setProjTitle(proj.title);
      setProjCategory(proj.category);
      setProjLocation(proj.location);
      setProjDescription(proj.description);
      setProjImageUrl(proj.imageUrl);
      setProjBeforeDesc(proj.beforeAfter?.beforeDesc || "");
      setProjAfterDesc(proj.beforeAfter?.afterDesc || "");
      setEditingProject(proj);
    } else {
      setProjId("");
      setProjTitle("");
      setProjCategory("alvenaria");
      setProjLocation("");
      setProjDescription("");
      setProjImageUrl("");
      setProjBeforeDesc("");
      setProjAfterDesc("");
      setEditingProject({});
    }
  };

  const handleImageFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const res = await fetch("/api/admin/upload-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${passphrase}`,
            },
            body: JSON.stringify({
              filename: file.name,
              base64: base64String,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            setProjImageUrl(data.url);
          } else {
            const errData = await res.json();
            alert(errData.error || "Erro ao realizar upload de imagem.");
          }
        } catch (err) {
          alert("Erro de comunicação ao fazer upload.");
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert("Falha ao ler arquivo selecionado.");
      setUploadingImage(false);
    }
  };

  const handleSaveProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projLocation.trim() || !projDescription.trim() || !projImageUrl.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios (Título, Local, Descrição e Foto).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${passphrase}`,
        },
        body: JSON.stringify({
          id: projId || undefined,
          title: projTitle,
          category: projCategory,
          location: projLocation,
          description: projDescription,
          imageUrl: projImageUrl,
          beforeDesc: projBeforeDesc,
          afterDesc: projAfterDesc,
        }),
      });

      if (res.ok) {
        alert("Projeto gravado com sucesso no portfólio!");
        setEditingProject(null);
        // Refresh landing page & our admin list state
        window.dispatchEvent(new CustomEvent("projects-updated"));
        fetchAdminData(passphrase);
      } else {
        const errData = await res.json();
        alert(errData.error || "Erro ao gravar projeto no portfólio.");
      }
    } catch (err) {
      alert("Falha de rede ao gravar projeto.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Tem certeza de que deseja remover permanentemente este projeto de vitrina?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${passphrase}` },
      });

      if (res.ok) {
        alert("Projeto removido.");
        window.dispatchEvent(new CustomEvent("projects-updated"));
        fetchAdminData(passphrase);
      } else {
        const errData = await res.json();
        alert(errData.error || "Erro ao remover projeto.");
      }
    } catch (err) {
      alert("Erro ao excluir do servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 overflow-y-auto flex items-start sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full min-h-screen sm:min-h-0 sm:max-w-4xl rounded-none sm:rounded-3xl border-none sm:border border-slate-200 bsa-shadow overflow-hidden flex flex-col sm:my-8 animate-in fade-in-50 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-brand-blue text-white py-4 sm:py-5 px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-brand-orange text-white rounded-xl shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-black text-sm sm:text-lg tracking-tight select-none truncate sm:whitespace-normal">
                Painel Administrativo
              </h2>
              <p className="text-[9px] sm:text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-0.5">
                BSA Projetos & Reformas
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-100 shrink-0"
            title="Voltar ao Site"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Unauthenticated View */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-md mx-auto w-full text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-brand-blue flex items-center justify-center mx-auto mb-6 border border-slate-200">
              <Lock className="w-7 h-7 text-brand-orange animate-pulse" />
            </div>
            <h3 className="text-xl font-extrabold text-brand-blue font-display mb-2 select-none">
              Acesso Restrito
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Digite a senha de administrador da BSA Projetos para gerenciar as permissões de links e moderar as avaliações recebidas.
            </p>

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-left">
              <div>
                <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5">
                  Senha Administrativa (PIN)
                </label>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="BSA_ADMIN_PASSPHRASE"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange bg-slate-50 font-mono tracking-widest text-center"
                />
              </div>

              {error && (
                <div className="text-xs bg-red-50 text-red-600 border border-red-100 p-3 rounded-lg text-center font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all hover:bg-brand-blue-light disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 bsa-shadow-orange"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Desbloquear Painel"}
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="flex flex-col flex-grow">
            
            {/* Nav Tabs */}
            <div className="border-b border-slate-150 px-4 sm:px-8 py-3 bg-slate-50 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => setActiveTab("moderation")}
                  className={`px-1.5 sm:px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center truncate ${
                    activeTab === "moderation"
                      ? "bg-brand-blue text-white whitespace-nowrap"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 whitespace-nowrap"
                  }`}
                >
                  <span className="block sm:hidden">Moderar ({reviews.length})</span>
                  <span className="hidden sm:block">Moderação ({reviews.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("links")}
                  className={`px-1.5 sm:px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center truncate ${
                    activeTab === "links"
                      ? "bg-brand-blue text-white whitespace-nowrap"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 whitespace-nowrap"
                  }`}
                >
                  <span className="block sm:hidden">Links ({tokens.length})</span>
                  <span className="hidden sm:block">Gerador de Links ({tokens.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("portfolio")}
                  className={`px-1.5 sm:px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center truncate ${
                    activeTab === "portfolio"
                      ? "bg-brand-blue text-white whitespace-nowrap"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 whitespace-nowrap"
                  }`}
                >
                  <span className="block sm:hidden">Portfólio ({projects.length})</span>
                  <span className="hidden sm:block">Portfólio ({projects.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("proposals")}
                  className={`px-1.5 sm:px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center truncate ${
                    activeTab === "proposals"
                      ? "bg-brand-blue text-white whitespace-nowrap"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 whitespace-nowrap"
                  }`}
                >
                  <span className="block sm:hidden">Orçamentos ({proposals.length})</span>
                  <span className="hidden sm:block">Orçamentos ({proposals.length})</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("services");
                    // Select first active service if none is selected
                    const activeProps = proposals.filter(p => p.status === 'aceito');
                    if (activeProps.length > 0 && !selectedServiceId) {
                      setSelectedServiceId(activeProps[0].id);
                    }
                  }}
                  className={`px-1.5 sm:px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center truncate ${
                    activeTab === "services"
                      ? "bg-brand-blue text-white whitespace-nowrap animate-pulse"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/70 whitespace-nowrap"
                  }`}
                >
                  <span className="block sm:hidden flex items-center gap-1">🛠️ Obras ({proposals.filter(p => p.status === 'aceito').length})</span>
                  <span className="hidden sm:block flex items-center gap-1">🛠️ Gestão de Obras & Finanças ({proposals.filter(p => p.status === 'aceito').length})</span>
                </button>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 border-t border-slate-150 md:border-t-0 pt-2 md:pt-0">
                <button
                  onClick={() => fetchAdminData()}
                  className="px-3 py-1.5 text-[11px] sm:text-xs text-brand-orange hover:bg-brand-orange/10 font-bold uppercase tracking-wider rounded-lg border border-transparent transition-all cursor-pointer"
                >
                  Sincronizar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-xs text-red-600 border border-red-100 hover:bg-red-50 bg-white font-extrabold uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 sm:p-8 flex-grow">
              
              {/* Tab 1: Moderation */}
              {activeTab === "moderation" && (
                <div className="flex flex-col gap-6">
                  <div className="text-left">
                    <h3 className="text-lg font-black text-brand-blue font-display">
                      Moderação de Avaliações Recebidas
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Somente avaliações com status <span className="font-extrabold text-emerald-600">Aprovado</span> serão exibidas na página principal do site para o público geral.
                    </p>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="border border-dashed border-slate-250 py-12 sm:py-16 text-center rounded-2xl bg-slate-50/50">
                      <p className="text-slate-400 text-sm font-medium">Nenhuma avaliação foi enviada por clientes ainda.</p>
                      <p className="text-slate-400 text-xs mt-1">Crie um link de convite na aba "Gerenciador de Links" para enviar a um cliente.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 sm:max-h-[500px] sm:overflow-y-auto pr-0 sm:pr-2">
                      {reviews.map((rev) => (
                        <div 
                          key={rev.id} 
                          className={`border rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 transition-all bg-white hover:border-slate-305 ${
                            rev.status === "pending" 
                              ? "border-amber-200 bg-amber-50/10 ring-1 ring-amber-100" 
                              : rev.status === "approved"
                              ? "border-emerald-100"
                              : "border-slate-150 opacity-60"
                          }`}
                        >
                          <div className="text-left flex-grow">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              {/* Customer Stars and badge */}
                              <div className="flex gap-0.5 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3.5 h-3.5 ${i < rev.stars ? "fill-amber-400" : "text-slate-205"}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">•</span>
                              <span className="text-xs text-slate-500 font-bold">{rev.createdAt}</span>
                              
                              {/* Status Badges */}
                              {rev.status === "pending" && (
                                <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                  Pendente
                                </span>
                              )}
                              {rev.status === "approved" && (
                                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                  Aprovado no Site
                                </span>
                              )}
                              {rev.status === "rejected" && (
                                <span className="bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-100">
                                  Ocultado
                                </span>
                              )}
                            </div>

                            <p className="text-sm font-semibold text-slate-800 italic mb-2">
                              "{rev.comment}"
                            </p>

                            <div className="text-xs text-slate-500 font-bold">
                              Por: <span className="text-brand-blue font-extrabold">{rev.clientName}</span> • Servico: <span className="text-slate-600">{rev.serviceType}</span> em <span className="text-brand-orange">{rev.city}</span>
                            </div>
                          </div>

                          {/* Moderation Controls */}
                          <div className="grid grid-cols-2 md:flex gap-2 shrink-0 w-full md:w-auto justify-end border-t border-slate-105 md:border-t-0 pt-3 md:pt-0">
                            {rev.status === "pending" ? (
                              <>
                                <button
                                  onClick={() => moderateReview(rev.id, "approved")}
                                  className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 bg-emerald-600 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-xl hover:bg-emerald-700 cursor-pointer bsa-shadow"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Aprovar</span>
                                </button>
                                <button
                                  onClick={() => moderateReview(rev.id, "rejected")}
                                  className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-xl border border-red-200 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Ocultar</span>
                                </button>
                              </>
                            ) : rev.status === "approved" ? (
                              <button
                                onClick={() => moderateReview(rev.id, "rejected")}
                                className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-550 hover:bg-red-50 text-[11px] sm:text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5 text-red-400" />
                                <span>Ocultar do Site</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => moderateReview(rev.id, "approved")}
                                className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 text-emerald-600 hover:bg-emerald-50 text-[11px] sm:text-xs font-extrabold rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Anunciar no Site</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Code Link Manager */}
              {activeTab === "links" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                  
                  {/* Left Column: Form Generate */}
                  <div className="lg:col-span-5">
                    <div className="bg-slate-50 border border-slate-205 rounded-2xl p-5">
                      <h4 className="text-sm font-black text-brand-blue uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
                        Criar Link Seguro de Avaliação
                      </h4>

                      <form onSubmit={generateToken} className="flex flex-col gap-4">
                        <div>
                          <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                            Nome do Cliente (Obrigatório)
                          </label>
                          <input
                            type="text"
                            required
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="Ex: Carlos Heitor"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                              Serviço Prestado
                            </label>
                            <input
                              type="text"
                              value={serviceType}
                              onChange={(e) => setServiceType(e.target.value)}
                              placeholder="Ex: Pintura Externa"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-orange"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                              Imóvel / Cidade
                            </label>
                            <input
                              type="text"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="Ex: Cabo Frio - RJ"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-orange"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                            Validade do Link Convite
                          </label>
                          <select
                            value={expiresOption}
                            onChange={(e) => setExpiresOption(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-orange"
                          >
                            <option value="24h">Expirar após 24 horas</option>
                            <option value="3d">Expirar após 3 dias</option>
                            <option value="7d">Expirar após 7 dias</option>
                            <option value="never">Sem expiração temporal (Apenas única utilização)</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-widest cursor-pointer mt-1 flex items-center justify-center gap-1.5 transition-all bsa-shadow"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Gerar Novo Link de Avaliação</span>
                        </button>
                      </form>

                      {/* Display Newly Generated Link */}
                      {genSuccess && (
                        <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <span className="block text-[10px] font-black text-emerald-800 uppercase tracking-wider mb-1.5">
                            Link Gerado para WhatsApp!
                          </span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              readOnly
                              value={`${window.location.origin}/?token=${genSuccess}`}
                              className="w-full px-2 py-1.5 text-[11px] rounded bg-white border border-emerald-105 font-mono select-all text-slate-600 focus:outline-none"
                            />
                            <button
                              onClick={() => copyToClipboard(genSuccess)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg shrink-0 transition-colors cursor-pointer"
                              title="Copiar Link"
                            >
                              {copiedTokenId === genSuccess ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-[10px] text-emerald-600 mt-2 font-bold leading-normal">
                            Copie o link acima e envie para o cliente pelo WhatsApp. O link {expiresOption === "never" ? "nunca expira" : `expira em ${expiresOption}`} e será desativado após o envio do formulário!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Manage Table */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <h4 className="text-sm font-black text-brand-blue uppercase tracking-wider border-b border-slate-150 pb-2 flex items-center justify-between">
                      <span>Rastreamento de Convites e Links</span>
                      <span className="text-xs text-slate-400 font-bold lowercase">Única utilização</span>
                    </h4>

                    {tokens.length === 0 ? (
                      <p className="text-slate-400 text-xs italic py-6">Nenhum link foi gerado ainda.</p>
                    ) : (
                      <div className="flex flex-col gap-3 sm:max-h-[420px] sm:overflow-y-auto pr-0 sm:pr-1">
                        {tokens.map((token) => {
                          const expired = isTokenExpired(token);
                          let statusLabel = "";
                          let statusClass = "";

                          if (token.used) {
                            statusLabel = "Respondido / Usado";
                            statusClass = "bg-slate-100 text-slate-600";
                          } else if (expired) {
                            statusLabel = "Expirado";
                            statusClass = "bg-red-50 text-red-600 border border-red-100";
                          } else {
                            statusLabel = "Ativo / Disponível";
                            statusClass = "bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold";
                          }

                          return (
                            <div 
                              key={token.id} 
                              className={`p-3 sm:p-4 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white hover:border-slate-300 transition-all ${
                                token.used ? "opacity-60" : ""
                              }`}
                            >
                              <div className="text-left">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-xs font-black text-brand-blue">
                                    {token.clientName}
                                  </span>
                                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusClass}`}>
                                    {statusLabel}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">
                                  {token.serviceType} • {token.city}
                                </div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-300" />
                                  <span>
                                    Criado em: {new Date(token.createdAt).toLocaleDateString("pt-BR")}
                                    {token.expiresAt && ` • Expira em: ${new Date(token.expiresAt).toLocaleDateString("pt-BR")} às ${new Date(token.expiresAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 justify-end border-t border-slate-100 sm:border-t-0 pt-2 sm:pt-0">
                                {!token.used && !expired && (
                                  <button
                                    onClick={() => copyToClipboard(token.id)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded-lg hover:bg-slate-200 cursor-pointer grow sm:grow-0 justify-center"
                                    title="Copiar link do cliente"
                                  >
                                    {copiedTokenId === token.id ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-emerald-600">Copiado</span>
                                      </>
                                    ) : (
                                      <>
                                        <Clipboard className="w-3.5 h-3.5" />
                                        <span>Copiar Link</span>
                                      </>
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteToken(token.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100"
                                  title="Excluir Convite"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Tab 3: Portfolio Showcase Cards Manager */}
              {activeTab === "portfolio" && (
                <div className="text-left flex flex-col gap-6">
                  {editingProject ? (
                    /* Project Creation/Edition Form */
                    <form onSubmit={handleSaveProject} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-205 pb-3 gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingProject(null)}
                            className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </button>
                          <h3 className="text-sm sm:text-base font-black text-brand-blue font-display uppercase tracking-wider leading-tight">
                            {projId ? "Editar Projeto Vitrine" : "Cadastrar Novo Projeto"}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingProject(null)}
                          className="text-left text-xs text-slate-400 font-bold hover:text-slate-755 ml-7 sm:ml-0"
                        >
                          Cancelar e Voltar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Title and Category */}
                        <div className="flex flex-col gap-4">
                          <div>
                            <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                              Título do Projeto (Obrigatório)
                            </label>
                            <input
                              type="text"
                              required
                              value={projTitle}
                              onChange={(e) => setProjTitle(e.target.value)}
                              placeholder="Ex: Pintura Premium de Fachada Comercial"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-orange"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                              Categoria do Serviço
                            </label>
                            <select
                              value={projCategory}
                              onChange={(e) => setProjCategory(e.target.value as ServiceCategory)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-orange"
                            >
                              <option value="pintura">Pintura Comercial e Residencial</option>
                              <option value="hidraulica">Encanamentos / Hidráulica</option>
                              <option value="eletrica">Elétrica / Iluminação</option>
                              <option value="alvenaria">Alvenaria / Reformas e Obras</option>
                              <option value="marcenaria">Marcenaria / Divisórias e Armários</option>
                              <option value="carpintaria">Carpintaria / Telhados e Coberturas</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                              Local / Bairro e Cidade (Obrigatório)
                            </label>
                            <input
                              type="text"
                              required
                              value={projLocation}
                              onChange={(e) => setProjLocation(e.target.value)}
                              placeholder="Ex: Centro – Cabo Frio (RJ)"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-orange"
                            />
                          </div>
                        </div>

                        {/* Image Upload and Details */}
                        <div className="flex flex-col gap-4">
                          <div>
                            <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                              Foto do Projeto (URL da imagem ou Upload abaixo)
                            </label>
                            <input
                              type="text"
                              required
                              value={projImageUrl}
                              onChange={(e) => setProjImageUrl(e.target.value)}
                              placeholder="https://exemplo.com/foto.jpg"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-orange"
                            />
                          </div>

                          <div className="bg-white border border-slate-200 p-3.5 rounded-xl">
                            <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5 flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5 text-brand-orange" />
                              <span>Fazer Upload da Imagem diretamente</span>
                            </span>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer border border-slate-200 transition-colors">
                                <span>{uploadingImage ? "Enviando arquivo..." : "Escolher Foto do Computador..."}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageFileChange}
                                  className="hidden"
                                  disabled={uploadingImage}
                                />
                              </label>
                              {uploadingImage && <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
                              Formatos sugeridos: JPG, PNG. A foto será otimizada e salva no servidor da BSA.
                            </p>
                          </div>

                          {projImageUrl && (
                            <div className="mt-1">
                              <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                                Pré-visualização do card:
                              </span>
                              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                <img
                                  src={projImageUrl}
                                  alt="Preview"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                          Descrição Detalhada do Projeto (Mínimo de detalhes do que foi executado)
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={projDescription}
                          onChange={(e) => setProjDescription(e.target.value)}
                          placeholder="Ex: Reforma elétrica completa com troca de fiação antiga e instalação de painéis embutidos de LED para iluminação decorativa leve e moderna."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-orange"
                        />
                      </div>

                      {/* Before / After Section */}
                      <div className="bg-brand-gray-light border border-slate-150 p-4 rounded-xl">
                        <span className="block text-xs font-black text-brand-blue uppercase tracking-wider mb-2.5 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>Comparativos de Antes / Depois (Altamente Recomendado para Pinturas e Reformas)</span>
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">
                              Antes da Intervenção (O que estava ruim?):
                            </label>
                            <input
                              type="text"
                              value={projBeforeDesc}
                              onChange={(e) => setProjBeforeDesc(e.target.value)}
                              placeholder="Ex: Reboco esfarelando, infiltrações e manchas de mofo verde."
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">
                              Resultado Final (O que a BSA entregou?):
                            </label>
                            <input
                              type="text"
                              value={projAfterDesc}
                              onChange={(e) => setProjAfterDesc(e.target.value)}
                              placeholder="Ex: Impermeabilização total e pintura acrílica fosco premium."
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Save Panel Actions */}
                      <div className="flex gap-3 justify-end border-t border-slate-200 pt-4">
                        <button
                          type="button"
                          onClick={() => setEditingProject(null)}
                          className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-705 font-bold text-xs uppercase"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={loading || uploadingImage}
                          className="flex items-center gap-1.5 px-6 py-2.5 bg-brand-orange hover:bg-brand-orange-dark text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer bsa-shadow"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>{projId ? "Salvar Alterações" : "Cadastrar Projeto"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Project Listing Admin view */
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-3">
                        <div>
                          <h3 className="text-lg font-black text-brand-blue font-display">
                            Gerenciador de Projetos da Vitrine (Portfólio)
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Adicione novos projetos finalizados para atrair novos clientes em nossas cidades de atendimento.
                          </p>
                        </div>
                        <button
                          onClick={() => startEditProject(null)}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-orange text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-brand-orange-dark cursor-pointer bsa-shadow shrink-0 ml-auto"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Cadastrar Novo Projeto</span>
                        </button>
                      </div>

                      {projects.length === 0 ? (
                        <div className="border border-dashed border-slate-250 py-16 text-center rounded-2xl bg-slate-50/50">
                          <p className="text-slate-400 text-sm font-medium">Nenhum projeto cadastrado no portfólio.</p>
                          <button
                            type="button"
                            onClick={() => startEditProject(null)}
                            className="text-brand-orange hover:underline font-bold text-xs mt-1"
                          >
                            Clique aqui para cadastrar o primeiro projeto!
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:max-h-[520px] sm:overflow-y-auto pr-0 sm:pr-1 font-sans">
                          {projects.map((proj) => (
                            <div 
                              key={proj.id} 
                              className="border border-slate-200 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row gap-3.5 sm:gap-4 bg-white hover:border-slate-300 transition-all text-left"
                            >
                              <div className="w-full sm:w-24 h-40 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-slate-100 relative bg-slate-100">
                                <img
                                  src={proj.imageUrl}
                                  alt={proj.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-1.5 left-1.5 bg-brand-blue text-white text-[8px] font-black px-1.5 py-0.5 rounded leading-none select-none">
                                  {proj.categoryLabel || proj.category}
                                </span>
                              </div>

                              <div className="flex-grow flex flex-col justify-between min-w-0">
                                <div>
                                  <div className="flex justify-between items-start gap-2 mb-1">
                                    <h4 className="text-sm sm:text-base font-black text-brand-blue line-clamp-1" title={proj.title}>
                                      {proj.title}
                                    </h4>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-bold truncate flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{proj.location}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                                    {proj.description}
                                  </p>
                                </div>

                                <div className="flex gap-2 justify-end border-t border-slate-100 pt-2 mt-2">
                                  <button
                                    onClick={() => startEditProject(proj)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-slate-600 hover:text-brand-orange bg-slate-50 hover:bg-brand-orange/5 border border-slate-150 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors"
                                  >
                                    <Edit className="w-3 h-3" />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProject(proj.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-slate-450 hover:text-red-650 hover:bg-red-50 border border-transparent hover:border-red-100 text-[10px] font-bold uppercase rounded-lg cursor-pointer transition-colors"
                                    title="Remover projeto permanentemente"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Excluir</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Proposals */}
              {activeTab === "proposals" && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                    <div>
                      <h3 className="text-lg font-black text-brand-blue font-display">
                        Pedidos de Orçamento Recebidos
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Gerencie as solicitações enviadas através do site, altere o status de atendimento e feche contratos comerciais para iniciar obras ativas.
                      </p>
                    </div>
 
                    {/* Filters block: Status and City */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Status:</span>
                        <select
                          value={proposalFilter}
                          onChange={(e: any) => setProposalFilter(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none focus:border-brand-orange text-slate-700 cursor-pointer"
                        >
                          <option value="todos">Todos</option>
                          <option value="aberto">Aberto</option>
                          <option value="em_andamento">Em Negociação</option>
                          <option value="aceito">Aceito / Em Obras</option>
                          <option value="recusado">Recusado</option>
                          <option value="finalizado">Finalizados Geral</option>
                        </select>
                      </div>
 
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Cidade:</span>
                        <select
                          value={proposalCityFilter}
                          onChange={(e: any) => setProposalCityFilter(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none focus:border-brand-orange text-slate-700 cursor-pointer max-w-[170px]"
                        >
                          <option value="todos">Todas as Cidades</option>
                          <option value="Cabo Frio">Cabo Frio</option>
                          <option value="São Pedro da Aldeia">São Pedro da Aldeia</option>
                          <option value="Armação dos Búzios">Armação dos Búzios</option>
                          <option value="Unamar">Unamar</option>
                          <option value="Barra de São João">Barra de São João</option>
                          <option value="Rio das Ostras">Rio das Ostras</option>
                          <option value="Macaé">Macaé</option>
                        </select>
                      </div>
                    </div>
                  </div>
 
                  {filteredAndSortedProposals.length === 0 ? (
                    <div className="border border-dashed border-slate-250 py-16 text-center rounded-2xl bg-slate-50/50">
                      <p className="text-slate-400 text-sm font-medium">Nenhum pedido de orçamento encontrado com os filtros selecionados.</p>
                      <p className="text-slate-400 text-xs mt-1">Experimente alterar os filtros de status ou cidade no topo.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:max-h-[520px] sm:overflow-y-auto pr-0 sm:pr-1 font-sans">
                      {filteredAndSortedProposals.map((prop) => {
                          const servicesNamesStr = prop.services && prop.services.length > 0
                            ? prop.services.map(s => {
                                if (s === 'pintura') return 'Pintura Residencial';
                                if (s === 'hidraulica') return 'Hidráulica & Esgoto';
                                if (s === 'eletrica') return 'Elétrica Geral';
                                if (s === 'alvenaria') return 'Alvenaria & Pisos';
                                if (s === 'marcenaria') return 'Marcenaria & Painéis';
                                if (s === 'carpintaria') return 'Carpintaria & Telhados';
                                return s;
                              }).join(', ')
                            : 'Manutenção / Reforma';
 
                          const cleanPhone = prop.phone.replace(/\D/g, "");
                          const formattedPhone = cleanPhone.length <= 11 && !cleanPhone.startsWith("55") ? `55${cleanPhone}` : cleanPhone;
 
                          const firstWordName = prop.name.trim().split(" ")[0];
                          const waMessage = `Olá, ${firstWordName}! Tudo bem?\n\n` +
                            `Aqui é o consultor de orçamentos da *BSA Projetos*.\n` +
                            `Recebi o seu contato pelo nosso site buscando orçamento em *${prop.city}* para *${servicesNamesStr}*.\n\n` +
                            `Você poderia nos contar um pouquinho mais sobre o que precisa fazer para que possamos elaborar uma proposta comercial personalizada para você? 😊`;
 
                          const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(waMessage)}`;
 
                          return (
                            <div 
                              key={prop.id}
                              className={`border rounded-2xl p-4 sm:p-5 flex flex-col gap-4 text-left bg-white transition-all hover:shadow-sm ${
                                prop.status === "aberto" 
                                  ? "border-amber-250 bg-amber-50/10" 
                                  : prop.status === "em_andamento"
                                  ? "border-sky-250 bg-sky-50/10"
                                  : prop.status === "aceito"
                                  ? "border-emerald-300 bg-emerald-500/5 ring-1 ring-emerald-100"
                                  : prop.status === "recusado"
                                  ? "border-rose-200 bg-rose-50/10"
                                  : "border-slate-300 bg-slate-50/10"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-base font-black text-brand-blue truncate max-w-[200px] sm:max-w-xs">
                                      {prop.name}
                                    </h4>
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                      prop.status === "aberto"
                                        ? "bg-amber-100/80 text-amber-800 border-amber-200"
                                        : prop.status === "em_andamento"
                                        ? "bg-sky-100/80 text-sky-850 border-sky-200"
                                        : prop.status === "aceito"
                                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                        : prop.status === "recusado"
                                        ? "bg-rose-100 text-rose-800 border-rose-200"
                                        : "bg-slate-100 text-slate-800 border-slate-200"
                                    }`}>
                                      {prop.status === "aberto" ? "Aberto" : 
                                       prop.status === "em_andamento" ? "Em Negociação" : 
                                       prop.status === "aceito" ? "Contrato Fechado ✨" : 
                                       prop.status === "recusado" ? "Recusado" : "Finalizado Geral"}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                                    <span>{prop.createdAt}</span>
                                    <span className="text-slate-350">•</span>
                                    <span>Cidade: <strong className="text-brand-orange">{prop.city}</strong></span>
                                  </div>
                                </div>
 
                                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                                  {/* Direct WhatsApp connection button */}
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all bsa-shadow hover:scale-[1.02] active:scale-[0.98] shrink-0"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 fill-white/10" />
                                    <span>Falar com Cliente ({prop.phone})</span>
                                  </a>
 
                                <button
                                  onClick={() => deleteProposal(prop.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent rounded-xl transition-all cursor-pointer shrink-0"
                                  title="Excluir Registro"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
 
                            {/* Details and categories card */}
                            <div className="bg-slate-50 rounded-xl p-3 sm:p-4 text-xs text-slate-700 flex flex-col gap-3 content-start border border-slate-100">
                              <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-[11px]">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-slate-500">Serviços Solicitados:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {prop.services ? prop.services.map((serv) => (
                                      <span key={serv} className="bg-slate-200 text-slate-800 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                        {serv === 'pintura' ? 'Pintura' : 
                                         serv === 'hidraulica' ? 'Hidráulica' : 
                                         serv === 'eletrica' ? 'Elétrica' : 
                                         serv === 'alvenaria' ? 'Alvenaria' : 
                                         serv === 'marcenaria' ? 'Marcenaria' : 'Carpintaria'}
                                      </span>
                                    )) : <span className="text-slate-400 italic">Nenhum</span>}
                                  </div>
                                </div>
                                <div className="hidden sm:block text-slate-300">|</div>
                                <div>
                                  <span className="font-extrabold text-slate-500">Escopo da Obra: </span>
                                  <span className="bg-brand-blue/10 text-brand-blue font-extrabold text-[9px] uppercase px-2 py-0.5 rounded border border-brand-blue/15">
                                    {prop.scale === 'pequeno' ? 'Pequeno Reparo' : 
                                     prop.scale === 'medio' ? 'Cômodo Único' : 
                                     prop.scale === 'grande' ? 'Imóvel Inteiro' : 'Comercial'}
                                  </span>
                                </div>
                              </div>
 
                              {prop.description ? (
                                <div className="bg-white border border-slate-150/60 rounded-xl p-3 font-medium text-slate-600 leading-relaxed font-sans italic text-xs max-h-[120px] overflow-y-auto">
                                  "{prop.description}"
                                </div>
                              ) : (
                                <div className="text-slate-400 italic text-[11px] pl-1">
                                  Nenhum detalhe ou descrição complementar fornecida pelo cliente.
                                </div>
                              )}
                            </div>

                            {/* Shortcut panel if contract is active */}
                            {prop.status === "aceito" && (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in slide-in-from-top-1">
                                <div className="text-left">
                                  <div className="text-xs font-black text-emerald-800 flex items-center gap-1">
                                    <span>🛠️ Obra Ativa vinculada a este contrato</span>
                                  </div>
                                  <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                                    Fase: {prop.phase ? prop.phase.toUpperCase() : "PLANEJAMENTO"} • 
                                    Saldo: R$ {((prop.finance?.budgetTotal || 0) - (prop.finance?.payments?.filter(x => x.type === 'receita').reduce((s, x) => s + x.amount, 0) || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a faturar.
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedServiceId(prop.id);
                                    setActiveTab("services");
                                  }}
                                  className="px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 select-none pointer-events-auto"
                                >
                                  <span>Gerenciar Obras & Custos</span>
                                  <span>→</span>
                                </button>
                              </div>
                            )}
 
                            {/* Status controls */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-3 gap-2">
                              <span className="text-xs font-black text-slate-500 tracking-wide">
                                Definir Status do Orçamento:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                <button
                                  onClick={() => updateProposalStatus(prop.id, "aberto")}
                                  className={`px-2.5 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                                    prop.status === "aberto"
                                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                                      : "bg-slate-50 border-slate-200 text-slate-605 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                                  }`}
                                >
                                  Aberto
                                </button>
                                <button
                                  onClick={() => updateProposalStatus(prop.id, "em_andamento")}
                                  className={`px-2.5 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                                    prop.status === "em_andamento"
                                      ? "bg-sky-500 text-white border-sky-500 shadow-sm"
                                      : "bg-slate-50 border-slate-200 text-slate-605 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200"
                                  }`}
                                >
                                  Negociação
                                </button>
                                <button
                                  onClick={() => {
                                    setClosingContractProposal(prop);
                                    setContractValueInput(prop.scale === 'pequeno' ? "1200" : prop.scale === 'medio' ? "4500" : prop.scale === 'grande' ? "15000" : "35000");
                                  }}
                                  className={`px-2.5 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                    prop.status === "aceito"
                                      ? "bg-emerald-600 text-white border-emerald-650 shadow-sm"
                                      : "bg-emerald-50 border-emerald-100 text-emerald-850 hover:bg-emerald-100"
                                  }`}
                                >
                                  <span>✨ Fechar Contrato (Aceito)</span>
                                </button>
                                <button
                                  onClick={() => updateProposalStatus(prop.id, "recusado")}
                                  className={`px-2.5 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                                    prop.status === "recusado"
                                      ? "bg-red-500 text-white border-red-500 shadow-sm"
                                      : "bg-slate-50 border-slate-200 text-slate-605 hover:bg-red-50 hover:text-red-705"
                                  }`}
                                >
                                  Recusado
                                </button>
                                <button
                                  onClick={() => updateProposalStatus(prop.id, "finalizado")}
                                  className={`px-2.5 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer ${
                                    prop.status === "finalizado"
                                      ? "bg-slate-600 text-white border-slate-600 shadow-sm"
                                      : "bg-slate-50 border-slate-200 text-slate-605 hover:bg-slate-200 hover:text-slate-800"
                                  }`}
                                >
                                  Finalizado Geral
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Gestão de Obras & Finanças */}
              {activeTab === "services" && (
                activeServices.length === 0 ? (
                  <div className="border border-dashed border-slate-250 py-16 text-center rounded-2xl bg-slate-50/50">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold text-base font-display">Nenhuma obra ativa em andamento no momento.</p>
                    <p className="text-slate-400 text-xs mt-1.5 max-w-md mx-auto leading-relaxed text-center">
                      Vá para a aba de <strong>"Orçamentos"</strong>, selecione um pedido de orçamento recebido e clique no botão <strong>"✨ Fechar Contrato"</strong> para ativar o painel de obras, anotações e gestão financeira do projeto.
                    </p>
                    <button
                      onClick={() => setActiveTab("proposals")}
                      className="mt-6 px-4.5 py-2.5 bg-brand-orange text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all hover:bg-brand-orange-dark cursor-pointer bsa-shadow"
                    >
                      Ver Pedidos de Orçamento
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-6 text-left">
                    
                    {/* Master List: Active Works Tracker Left Column */}
                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
                      <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200/60 text-left">
                        <h4 className="text-[10.5px] font-black uppercase text-brand-blue tracking-wider mb-1">
                          📋 Obras Selecionadas ({activeServices.length})
                        </h4>
                        <p className="text-[9.5px] text-slate-500">
                          Clique em uma obra para gerenciar o andamento físico e faturamento.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
                        {activeServices.map((work) => {
                          const workFinance = work.finance || { budgetTotal: 0, payments: [] };
                          const workTotal = workFinance.budgetTotal || 0;
                          const workReceived = (workFinance.payments || []).filter(p => p.type === 'receita').reduce((s, i) => s + i.amount, 0);
                          const collectPct = workTotal > 0 ? Math.min(Math.round((workReceived / workTotal) * 100), 100) : 0;
                          const isSelected = selectedService?.id === work.id;

                          return (
                            <button
                              key={work.id}
                              onClick={() => setSelectedServiceId(work.id)}
                              className={`w-full text-left p-3.5 rounded-xl border transition-all hover:bg-slate-50 cursor-pointer ${
                                isSelected 
                                  ? "border-brand-blue bg-blue-50/20 ring-1 ring-brand-blue/30 shadow-sm" 
                                  : "bg-white border-slate-200"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-extrabold text-xs text-slate-800 line-clamp-1">
                                  {work.name}
                                </span>
                                <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  work.phase === 'entregue' ? 'bg-emerald-100 text-emerald-800' :
                                  work.phase === 'acabamento' ? 'bg-indigo-100 text-indigo-800' :
                                  work.phase === 'execucao' ? 'bg-amber-100 text-amber-800' : 'bg-slate-150 text-slate-705'
                                }`}>
                                  {work.phase === 'entregue' ? 'Entregue' :
                                   work.phase === 'acabamento' ? 'Acabamento' :
                                   work.phase === 'execucao' ? 'Execução' :
                                   work.phase === 'preparacao' ? 'Preparação' : 'Planejamento'}
                                </span>
                              </div>

                              <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between font-mono font-medium">
                                <span>R$ {workTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                <span>Cidade: {work.city}</span>
                              </div>

                              {/* Small Progress visualizer */}
                              <div className="mt-2.5">
                                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">
                                  <span>Faturado: {collectPct}%</span>
                                  <span>R$ {workReceived.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${collectPct}%` }}
                                  />
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detail Area Panel Right Column */}
                    {selectedService && (
                      <div className="flex-grow flex flex-col gap-6 font-sans">
                        
                        {/* Selected Work Header metadata */}
                        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-black text-brand-blue font-display">
                                {selectedService.name}
                              </h3>
                              <span className="text-xs bg-brand-orange/10 text-brand-orange font-extrabold px-2 py-0.5 rounded">
                                {selectedService.city}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Obra iniciada de {selectedService.createdAt} • Telefone: {selectedService.phone}
                            </p>
                          </div>

                          <a
                            href={`https://wa.me/${selectedService.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Contatar Cliente</span>
                          </a>
                        </div>

                        {/* STEP PHYSICAL CONSTRUCTION TRACKER: Phase Indicator */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left">
                          <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-4">
                            🛠️ Evolução Física & Fase de Entrega da Obra
                          </h4>

                          <div className="grid grid-cols-2 min-[500px]:grid-cols-5 gap-2">
                            {(['planejamento', 'preparacao', 'execucao', 'acabamento', 'entregue'] as const).map((currPhase) => {
                              const phaseLabelMap = {
                                planejamento: '1. Planejamento',
                                preparacao: '2. Preparação',
                                execucao: '3. Execução Ativa',
                                acabamento: '4. Acabamento',
                                entregue: '5. Entregue 🎉'
                              };
                              const isActive = (selectedService.phase || 'planejamento') === currPhase;
                              return (
                                <button
                                  key={currPhase}
                                  onClick={() => updateServicePhase(selectedService.id, currPhase)}
                                  className={`px-3 py-3 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all text-center border cursor-pointer select-none ${
                                    isActive
                                      ? "bg-brand-blue text-white border-brand-blue shadow-sm scale-[1.03]"
                                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                  }`}
                                >
                                  {phaseLabelMap[currPhase]}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Interactive Grid: Historical notes & finances */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                          
                          {/* Left Grid: Historical Notes Diary (History Book) */}
                          <div className="xl:col-span-5 flex flex-col gap-4">
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 h-[580px]">
                              <div>
                                <h4 className="text-sm font-black text-brand-blue font-display flex items-center gap-1.5">
                                  <Clipboard className="w-4 h-4 text-brand-orange" />
                                  <span>Histórico & Diário da Obra</span>
                                </h4>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  Anotações detalhadas de etapas concluídas, compras de insumos e negociações do início ao fim.
                                </p>
                              </div>

                              {/* Interactive input addition */}
                              <div className="flex gap-2 shrink-0 border-b border-slate-100 pb-3">
                                <input
                                  type="text"
                                  placeholder="Escreva uma anotação de progresso..."
                                  value={newNoteText}
                                  onChange={(e) => setNewNoteText(e.target.value)}
                                  className="flex-grow px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-orange font-medium"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') addServiceNote(selectedService.id, newNoteText);
                                  }}
                                />
                                <button
                                  onClick={() => addServiceNote(selectedService.id, newNoteText)}
                                  className="px-3 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                                >
                                  Salvar
                                </button>
                              </div>

                              {/* Historical Logs List Scrollable */}
                              <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-3">
                                {financeCalculations.notesList.length === 0 ? (
                                  <div className="my-auto text-center text-slate-400 py-6">
                                    <p className="text-xs italic font-medium">Nenhum histórico registrado.</p>
                                    <p className="text-[10px] mt-0.5">Adicione o primeiro evento físico ou financeiro acima.</p>
                                  </div>
                                ) : (
                                  [...financeCalculations.notesList].reverse().map((nt) => {
                                    const isSystem = nt.author === 'Sistema';
                                    const isFinance = nt.author === 'Finanças';
                                    
                                    return (
                                      <div 
                                        key={nt.id} 
                                        className={`p-3 rounded-xl border text-xs text-slate-705 text-left leading-relaxed ${
                                          isSystem ? 'bg-slate-50/70 border-slate-150 text-slate-500' :
                                          isFinance ? 'bg-emerald-500/5 border-emerald-100 text-emerald-800' :
                                          'bg-amber-500/5 border-amber-105 text-slate-700'
                                        }`}
                                      >
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-200 px-1.5 py-0.2 rounded leading-none text-slate-600 font-mono">
                                            {nt.author}
                                          </span>
                                          <span className="text-[9px] font-bold text-slate-400 font-mono">
                                            {nt.date}
                                          </span>
                                        </div>
                                        <p className="font-medium whitespace-pre-wrap leading-relaxed select-text">
                                          {nt.text}
                                        </p>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Grid: Bookkeeping & Financial Management */}
                          <div className="xl:col-span-7 flex flex-col gap-5">
                            
                            {/* Financial Summary KPIs */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                              
                              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-100 block">
                                  Faturado (Entradas)
                                </span>
                                <div className="text-lg font-black mt-1 font-mono">
                                  R$ {financeCalculations.totalPaymentsReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-[9.5px] mt-0.5 text-emerald-100/90 font-medium">
                                  R$ {financeCalculations.balanceToCollect.toLocaleString('pt-BR')} a faturar
                                </div>
                              </div>

                              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                                  Margem Estimada (Val/%)
                                </span>
                                <div className="text-lg font-black mt-1 text-brand-orange font-mono font-bold">
                                  R$ {financeCalculations.projectedMarginVal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                                </div>
                                <div className={`text-[10px] mt-0.5 font-bold ${
                                  financeCalculations.projectedMarginPct >= 35 ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                  Margem: {financeCalculations.projectedMarginPct.toFixed(1)}%
                                </div>
                              </div>

                              <div className="col-span-2 lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 relative overflow-hidden">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">
                                  Custos Acumulados
                                </span>
                                <div className="text-lg font-black mt-1 text-slate-800 font-mono">
                                  R$ {financeCalculations.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-[9.5px] mt-0.5 text-slate-400 font-mono font-medium truncate">
                                  Orçamento Previsto
                                </div>
                              </div>

                            </div>

                            {/* Cost settings block (Contract & Insumos Costs) */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-left">
                              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-3 flex justify-between items-center">
                                <span>🏷️ Definir Valores, Custos de Compra & Mão de Obra</span>
                                <span className="text-[9.5px] text-brand-orange font-black">Orçamento Estimado</span>
                              </h4>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">
                                    Total Contrato (R$)
                                  </label>
                                  <input
                                    type="number"
                                    value={editContractTotal}
                                    onChange={(e) => setEditContractTotal(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-2.5 py-1.8 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-brand-orange text-slate-800"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">
                                    Materiais (R$)
                                  </label>
                                  <input
                                    type="number"
                                    value={editMaterialsCost}
                                    onChange={(e) => setEditMaterialsCost(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-2.5 py-1.8 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-brand-orange text-slate-850"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">
                                    Mão de Obra (R$)
                                  </label>
                                  <input
                                    type="number"
                                    value={editLaborCost}
                                    onChange={(e) => setEditLaborCost(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-2.5 py-1.8 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-brand-orange text-slate-850"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-1">
                                    Outras Despesas (R$)
                                  </label>
                                  <input
                                    type="number"
                                    value={editOtherExpenses}
                                    onChange={(e) => setEditOtherExpenses(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-2.5 py-1.8 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-brand-orange text-slate-850"
                                  />
                                </div>
                              </div>

                              <div className="mt-3.5 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateFinanceCosts(
                                      selectedService.id,
                                      parseFloat(editContractTotal) || 0,
                                      parseFloat(editMaterialsCost) || 0,
                                      parseFloat(editLaborCost) || 0,
                                      parseFloat(editOtherExpenses) || 0
                                    );
                                  }}
                                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all shrink-0"
                                >
                                  Gravar Orçamento de Custos
                                </button>
                              </div>
                            </div>

                            {/* Fast Transaction Ledger bookkeeping (Fluxo de Caixa) */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-left flex flex-col gap-4">
                              <div>
                                <h4 className="text-sm font-black text-brand-blue font-display">
                                  💵 Demonstrativo de Lançamentos & Balancete
                                </h4>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  Registre adiantamentos, pagamentos de etapas recebidos, despesas de faturas ou diárias de serviços.
                                </p>
                              </div>

                              {/* Form to add payments */}
                              <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-xs flex flex-col sm:flex-row gap-2.5 items-end">
                                <div className="w-full sm:w-1/4">
                                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-0.5">Operação</label>
                                  <select
                                    value={newTransType}
                                    onChange={(e) => setNewTransType(e.target.value as any)}
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-extrabold focus:outline-none"
                                  >
                                    <option value="receita">📥 Entrada</option>
                                    <option value="despesa">📤 Saída</option>
                                  </select>
                                </div>

                                <div className="w-full sm:w-1/4">
                                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-0.5">Valor (R$)</label>
                                  <input
                                    type="number"
                                    placeholder="0.00"
                                    value={newTransAmount}
                                    onChange={(e) => setNewTransAmount(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none font-sans font-extrabold tracking-wide"
                                  />
                                </div>

                                <div className="flex-grow w-full">
                                  <label className="block text-[9px] font-black uppercase text-slate-500 mb-0.5">Descrição</label>
                                  <input
                                    type="text"
                                    placeholder="Ex: 'Adiantamento início'"
                                    value={newTransDesc}
                                    onChange={(e) => setNewTransDesc(e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none font-medium text-slate-700"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const parsedVal = parseFloat(newTransAmount);
                                    if (!parsedVal || !newTransDesc.trim()) {
                                      alert("Por favor preencha o valor e a descrição corretos!");
                                      return;
                                    }
                                    addFinancePayment(selectedService.id, parsedVal, newTransDesc, newTransType);
                                  }}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer whitespace-nowrap self-stretch sm:self-auto flex items-center justify-center font-extrabold"
                                >
                                  Lançar
                                </button>
                              </div>

                              {/* Transaction Records ledger */}
                              <div className="max-h-[220px] overflow-y-auto pr-1">
                                {(!serviceFinance?.payments || serviceFinance.payments.length === 0) ? (
                                  <div className="text-center text-slate-400 py-6 text-xs italic">
                                    Nenhum lançamento financeiro registrado para esta obra.
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-1.5">
                                    {serviceFinance.payments.map((pt) => {
                                      const isReceita = pt.type === 'receita';
                                      return (
                                        <div 
                                          key={pt.id}
                                          className="p-2.5 rounded-lg border border-slate-150 bg-white hover:bg-slate-50 text-[11px] flex items-center justify-between gap-3 text-left font-sans"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${isReceita ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            <div>
                                              <p className="font-extrabold text-slate-800 leading-none">
                                                {pt.description}
                                              </p>
                                              <p className="text-[9px] text-slate-400 font-bold font-mono mt-0.5">
                                                {pt.date} • {isReceita ? "Entrada" : "Saída"}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-3">
                                            <span className={`font-mono font-black text-xs ${isReceita ? 'text-emerald-700' : 'text-red-650'}`}>
                                              {isReceita ? '+' : '-'} R$ {pt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                            <button
                                              onClick={() => deleteFinancePayment(selectedService.id, pt.id)}
                                              className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-slate-400 transition-colors cursor-pointer"
                                              title="Excluir Transação"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}

            </div>

          </div>
        )}

        {/* Custom Modal for Fechar Contrato */}
        {closingContractProposal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 text-left font-sans">
              <h3 className="text-lg font-black text-brand-blue flex items-center gap-2">
                <span>✨ Fechar Contrato Comercial</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Você está fechando um contrato para o cliente <strong className="text-slate-800">{closingContractProposal.name}</strong> em <strong className="text-brand-orange">{closingContractProposal.city}</strong>.
              </p>
              
              <div className="mt-4">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">
                  Valor Estimado do Contrato (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="text"
                    value={contractValueInput}
                    onChange={(e) => setContractValueInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
                    placeholder="Ex: 5.000,00"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Este valor inicial será usado para as previsões financeiras e margem de lucros na aba <strong>"Finanças"</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 mt-6 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setClosingContractProposal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cleaned = contractValueInput.replace(/[^\d.]/g, '');
                    const parsed = parseFloat(cleaned);
                    const parsedNum = isNaN(parsed) ? (closingContractProposal.scale === 'pequeno' ? 1200 : closingContractProposal.scale === 'medio' ? 4500 : closingContractProposal.scale === 'grande' ? 15000 : 35000) : parsed;
                    
                    updateProposalStatus(closingContractProposal.id, "aceito");
                    setTimeout(() => {
                      updateFinanceCosts(closingContractProposal.id, parsedNum, 0, 0, 0);
                    }, 50);
                    
                    setClosingContractProposal(null);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all bsa-shadow hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  Confirmar Contrato
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
