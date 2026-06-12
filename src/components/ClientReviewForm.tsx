import { useState, useEffect, FormEvent } from "react";
import { Star, Loader2, CheckCircle, ShieldAlert, HeartHandshake, Eye } from "lucide-react";

interface TokenData {
  clientName: string;
  serviceType: string;
  city: string;
}

export default function ClientReviewForm({ 
  tokenId, 
  onFinished 
}: { 
  tokenId: string; 
  onFinished: () => void; 
}) {
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Form values
  const [stars, setStars] = useState(5);
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [clientName, setClientName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await fetch(`/api/token-check/${tokenId}`);
        const data = await res.json();
        if (data.valid) {
          setValid(true);
          setTokenData(data.tokenData);
          setClientName(data.tokenData.clientName || "");
        } else {
          setValid(false);
          setErrorMessage(data.message || "Link de avaliação inválido ou expirado.");
        }
      } catch (err) {
        setValid(false);
        setErrorMessage("Erro ao verificar convite de avaliação. Certifique-se de estar conectado à internet.");
      } finally {
        setChecking(false);
      }
    };
    checkToken();
  }, [tokenId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("Por favor, preencha o seu comentário para enviar.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/submit-review/${tokenId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stars,
          comment,
          clientName: clientName.trim(),
          serviceType: tokenData?.serviceType,
          city: tokenData?.city,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        alert(data.error || "Houve um problema ao enviar a avaliação.");
      }
    } catch (err) {
      alert("Falha de comunicação com o servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Acessando formulário seguro...
          </p>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200 bsa-shadow p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-display font-black text-xl text-brand-blue mb-3">
            Acesso Indisponível
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            {errorMessage}
          </p>
          <div className="border-t border-slate-100 pt-6 flex flex-col gap-3">
            <p className="text-xs text-slate-400">
              Se você acabou de realizar uma obra com a <strong>BSA Projetos</strong>, solicite um novo link seguro à nossa equipe comercial.
            </p>
            <button
              onClick={onFinished}
              className="mt-2 w-full bg-brand-blue text-white py-3 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-brand-blue-light transition-colors cursor-pointer text-center"
            >
              Voltar ao Site Principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200 bsa-shadow p-8 sm:p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="font-display font-black text-2xl text-brand-blue mb-3">
            Avaliação Recebida com Sucesso!
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Olá, <strong className="text-brand-orange">{clientName}</strong>! Agradecemos imensamente o seu tempo e carinho ao avaliar nossos serviços. Sua opinião é fundamental para a melhoria de nossos padrões técnicos.
          </p>
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl mb-8 text-left">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <Eye className="w-4 h-4 text-brand-orange" />
              <span>Próximos passos</span>
            </div>
            <p className="text-slate-550 text-xs leading-relaxed">
              Sua avaliação foi encaminhada para a aprovação administrativa da BSA Projetos. Em breve, ela será publicada de forma anônima ou identificada em nosso painel de depoimentos no site principal!
            </p>
          </div>
          <button
            onClick={onFinished}
            className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white py-3.5 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors cursor-pointer bsa-shadow"
          >
            Visitar nosso Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl bg-white border border-slate-200 bsa-shadow rounded-3xl overflow-hidden">
        
        {/* Banner */}
        <div className="bg-brand-blue text-white py-6 px-6 sm:px-8 text-center flex flex-col items-center gap-2 relative">
          <div className="p-2 bg-brand-orange text-white rounded-xl mb-1">
            <HeartHandshake className="w-5 h-5 animate-bounce" />
          </div>
          <h1 className="font-display font-black text-xl tracking-tight leading-tight">
            Sua Opinião é Essencial para Nós!
          </h1>
          <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">
            BSA Projetos & Reformas
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 text-left flex flex-col gap-5">
          
          <div className="text-center sm:text-left bg-slate-50 border border-slate-150 p-4 rounded-2xl">
            <p className="text-slate-750 text-xs sm:text-sm leading-relaxed">
              Olá, <strong className="text-brand-orange text-base font-extrabold">{tokenData?.clientName}</strong>!
            </p>
            <p className="text-slate-550 text-xs sm:text-sm leading-relaxed mt-1">
              Como foi sua experiência com o serviço de <strong className="text-brand-blue">{tokenData?.serviceType}</strong> realizado em <strong className="text-brand-blue">{tokenData?.city}</strong>?
            </p>
          </div>

          {/* Interactive Stars Selection */}
          <div className="flex flex-col items-center gap-2 my-4">
            <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 tracking-wider">
              Selecione a quantidade de estrelas:
            </span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const filled = hoveredStars !== null ? starValue <= hoveredStars : starValue <= stars;
                return (
                  <button
                    type="button"
                    key={starValue}
                    onClick={() => setStars(starValue)}
                    onMouseEnter={() => setHoveredStars(starValue)}
                    onMouseLeave={() => setHoveredStars(null)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                    title={`Nota ${starValue}`}
                  >
                    <Star 
                      className={`w-10 h-10 ${
                        filled 
                          ? "text-amber-400 fill-amber-400" 
                          : "text-slate-200 stroke-1"
                      }`} 
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-extrabold text-amber-500 uppercase mt-1 tracking-widest select-none">
              {stars === 1 && "Muito Insatisfeito"}
              {stars === 2 && "Insatisfeito"}
              {stars === 3 && "Regular"}
              {stars === 4 && "Muito Satisfeito"}
              {stars === 5 && "Excelente / Perfeito!"}
            </span>
          </div>

          {/* Client Display Name */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5">
              Como prefere que seu nome apareça no depoimento?
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: Camila V. ou Camila"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange bg-slate-50 text-sm font-semibold"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-1.5">
              Seu Depoimento / Comentários
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Fale um pouco sobre a organização, limpeza pós-obra, pontualidade, atendimento, qualidade do reboco ou marcenaria..."
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange bg-slate-50 text-xs sm:text-sm font-medium leading-relaxed resize-none"
            />
          </div>

          {/* Privacy Note */}
          <p className="text-[10px] text-slate-400 leading-relaxed text-center italic">
            * Ao enviar este formulário, você autoriza a BSA Projetos a publicar sua avaliação de forma anônima ou com o nome editável fornecido acima em nosso portfólio público.
          </p>

          {/* Action Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold uppercase text-xs tracking-widest transition-all hover:bg-brand-blue-light disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 bsa-shadow"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enviando avaliação...</span>
              </>
            ) : (
              <span>Enviar Minha Avaliação</span>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
