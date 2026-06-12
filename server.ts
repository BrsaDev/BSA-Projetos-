import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

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

// Helper for loading/saving DB
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

interface DBStructure {
  tokens: ReviewToken[];
  reviews: Review[];
  projects: PortfolioProject[];
}

const DEFAULT_PROJECTS: PortfolioProject[] = [
  {
    id: "p1",
    title: "Reforma Estrutural & Revestimento Fino de Piscina",
    category: "alvenaria",
    categoryLabel: "Alvenaria",
    location: "Condomínio Ogiva, Cabo Frio",
    description: "Retirada de azulejos antigos trincados, impermeabilização com manta bicomponente elástica e assentamento fino de pastilhas de porcelana em gradiente de azul. Acabamento perfeito com rejunte acrílico anti-mofo.",
    imageUrl: "https://picsum.photos/seed/bsapool1/700/500",
    beforeAfter: {
      beforeDesc: "Vazamento ativo pelas fissuras, pastilhas soltas e infiltração na fundação.",
      afterDesc: "Estanqueidade 100% garantida por teste de carga, visual moderno e brilhante com pastilhas novas."
    }
  },
  {
    id: "p2",
    title: "Instalação de Gesso 3D e Pintura de Alto Padrão",
    category: "pintura",
    categoryLabel: "Pintura",
    location: "Geribá, Armação dos Búzios",
    description: "Aplicação de placas de gesso decorativas 3D, emassamento minucioso para emendas invisíveis e pintura premium com acabamento acetinado de fácil limpeza. Linhas de corte perfeitas no gesso.",
    imageUrl: "https://picsum.photos/seed/bsapaintgipse/700/500",
    beforeAfter: {
      beforeDesc: "Parede de sala vazia com pequenas imperfeições no reboco e cor desbotada.",
      afterDesc: "Parede focal tridimensional artística com luz rasgante e toque aveludado impecável."
    }
  },
  {
    id: "p3",
    title: "Banheiro de Luxo com Tubulação Termofusão (PPR)",
    category: "hidraulica",
    categoryLabel: "Hidráulica",
    location: "Praia do Forte, Cabo Frio",
    description: "Retrofitting hidráulico completo de banheiro antigo. Substituição de canos de metal enferrujados por canos PPR de termofusão (eliminando conexões roscáveis e riscos de vazamentos). Instalação de misturadores monocomando.",
    imageUrl: "https://picsum.photos/seed/bsabathroomhyd/700/500",
    beforeAfter: {
      beforeDesc: "Infiltração grave descendo para o vizinho e metais obsoletos enferrujados.",
      afterDesc: "Tubulação moderna embutida com nicho de porcelanato esculpido e metais funcionais sem vazamentos."
    }
  },
  {
    id: "p4",
    title: "Painel Ripado em MDF e Cozinha sob Medida",
    category: "marcenaria",
    categoryLabel: "Marcenaria",
    location: "Unamar, Cabo Frio",
    description: "Fabricação e montagem de móveis planejados para cozinha gourmet. Painel ripado de alta definição em MDF Naval resistente à maresia litorânea e ferragens amortecidas de fechamento suave.",
    imageUrl: "https://picsum.photos/seed/bsacabinetwood/700/500",
    beforeAfter: {
      beforeDesc: "Cozinha sem aproveitamento de espaço com armários prontos de aglomerado estufados.",
      afterDesc: "Móveis planejados resistentes à umidade do salitre, com divisórias pensadas e fechamento leve."
    }
  },
  {
    id: "p5",
    title: "Quadro Geral de Distribuição & Fita LED Decorativa",
    category: "eletrica",
    categoryLabel: "Elétrica",
    location: "Centro, São Pedro da Aldeia",
    description: "Reestruturação total do padrão elétrico residencial. Divisão adequada de circuitos de alta potência (ar-condicionado e chuveiro), implementação de dispositivos DR (contra choque) e DPS (surto de raios). Instalação de perfis de iluminação LED.",
    imageUrl: "https://picsum.photos/seed/bsaelectricalled/700/500",
    beforeAfter: {
      beforeDesc: "Disjuntores antigos pretos incompatíveis e fiação geral aquecendo, sem aterramento.",
      afterDesc: "Rede elétrica sintonizada sob as normas NBR 5410, segura contra curtos e esteticamente moderna."
    }
  },
  {
    id: "p6",
    title: "Assentamento de Porcelanato Retificado de Grande Formato",
    category: "alvenaria",
    categoryLabel: "Alvenaria",
    location: "Prainha, Arraial do Cabo",
    description: "Colocação de piso porcelanato retificado 90x90cm com niveladores de precisão. Juntas de apenas 1.5mm, contrapiso previamente impermeabilizado contra umidade subida do solo arenoso próximo da praia.",
    imageUrl: "https://picsum.photos/seed/bsatilefloor/700/500",
    beforeAfter: {
      beforeDesc: "Piso cerâmico antigo estufado devido à dilatação e umidade do lençol freático.",
      afterDesc: "Piso plano como um espelho de forma estanque, resistente e fácil de limpar."
    }
  }
];

function readDB(): DBStructure {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      let updated = false;
      if (!parsed.tokens) {
        parsed.tokens = [];
        updated = true;
      }
      if (!parsed.reviews) {
        parsed.reviews = [];
        updated = true;
      }
      if (!parsed.projects) {
        parsed.projects = DEFAULT_PROJECTS;
        updated = true;
      }
      if (updated) {
        writeDB(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error("Erro ao ler banco de dados JSON:", err);
  }
  return { tokens: [], reviews: [], projects: DEFAULT_PROJECTS };
}

function writeDB(data: DBStructure) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Erro ao escrever no banco de dados JSON:", err);
  }
}

// Ensure database and uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  writeDB({ tokens: [], reviews: [], projects: DEFAULT_PROJECTS });
} else {
  // force double check on default projects migration on startup
  readDB();
}

app.use(express.json({ limit: "15mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Admin credentials middleware / check
const adminPassphrase = process.env.BSA_ADMIN_PASSPHRASE || "bsa2026";

function authenticateAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Acesso administrativo não autorizado: Senha requerida." });
  }
  const token = authHeader.replace("Bearer ", "");
  if (token !== adminPassphrase) {
    return res.status(403).json({ error: "Senha administrativa incorreta." });
  }
  next();
}

// --- PUBLIC ROUTE ---
// Fetch approved reviews for landing page
app.get("/api/public-reviews", (req, res) => {
  const db = readDB();
  const approved = db.reviews.filter((r) => r.status === "approved");
  res.json(approved);
});

// Fetch active showcase/portfolio projects
app.get("/api/projects", (req, res) => {
  const db = readDB();
  res.json(db.projects || []);
});

// --- TOKEN CHECK ROUTE ---
// Check if a token is valid, non-expired, and unused
app.get("/api/token-check/:tokenId", (req, res) => {
  const { tokenId } = req.params;
  const db = readDB();
  const token = db.tokens.find((t) => t.id === tokenId);

  if (!token) {
    return res.json({ valid: false, message: "Link de avaliação inválido ou inexistente." });
  }

  if (token.used) {
    return res.json({ valid: false, message: "Este link já foi utilizado para enviar uma avaliação." });
  }

  if (token.expiresAt) {
    const expired = new Date() > new Date(token.expiresAt);
    if (expired) {
      return res.json({ valid: false, message: "Este link de avaliação expirou." });
    }
  }

  res.json({
    valid: true,
    tokenData: {
      clientName: token.clientName,
      serviceType: token.serviceType,
      city: token.city,
    },
  });
});

// --- SUBMIT REVIEW ROUTE ---
// Allows a client to submit a moderation-pending review using a valid token
app.post("/api/submit-review/:tokenId", (req, res) => {
  const { tokenId } = req.params;
  const { stars, comment, clientName, serviceType, city } = req.body;

  const db = readDB();
  const tokenIndex = db.tokens.findIndex((t) => t.id === tokenId);

  if (tokenIndex === -1) {
    return res.status(400).json({ error: "Token inválido." });
  }

  const token = db.tokens[tokenIndex];

  if (token.used) {
    return res.status(400).json({ error: "Token de convite já utilizado." });
  }

  if (token.expiresAt) {
    const expired = new Date() > new Date(token.expiresAt);
    if (expired) {
      return res.status(400).json({ error: "Este token de convite já expirou." });
    }
  }

  // Validate review parameters
  const score = Number(stars);
  if (isNaN(score) || score < 1 || score > 5) {
    return res.status(400).json({ error: "Nota inválida. Por favor envie de 1 a 5 estrelas." });
  }

  if (!comment || typeof comment !== "string" || comment.trim().length === 0) {
    return res.status(400).json({ error: "O comentário da avaliação é obrigatório." });
  }

  // Consume the token (single use)
  db.tokens[tokenIndex].used = true;

  // Add review as pending
  const newReview: Review = {
    id: Math.random().toString(36).substring(2, 11),
    clientName: (clientName || token.clientName || "Cliente").trim(),
    serviceType: (serviceType || token.serviceType || "Serviço").trim(),
    city: (city || token.city || "Cabo Frio").trim(),
    stars: score,
    comment: comment.trim(),
    status: "pending",
    createdAt: new Date().toLocaleDateString("pt-BR"),
  };

  db.reviews.push(newReview);
  writeDB(db);

  res.json({ success: true, message: "Avaliação registrada com sucesso para moderação!" });
});


// --- ADMIN SECURE ROUTES ---

// Authenticate Admin Connection
app.post("/api/admin/auth", (req, res) => {
  const { passphrase } = req.body;
  if (!passphrase) {
    return res.status(400).json({ error: "Senha é obrigatória." });
  }
  if (passphrase !== adminPassphrase) {
    return res.status(403).json({ error: "Senha administrativa incorreta." });
  }
  res.json({ authenticated: true });
});

// Fetch all tokens and reviews
app.get("/api/admin/data", authenticateAdmin, (req, res) => {
  const db = readDB();
  res.json(db);
});

// Generate evaluation token
app.post("/api/admin/generate-token", authenticateAdmin, (req, res) => {
  const { clientName, serviceType, city, expiresOption } = req.body;

  if (!clientName || typeof clientName !== "string" || clientName.trim() === "") {
    return res.status(400).json({ error: "O nome do cliente é obrigatório." });
  }

  const db = readDB();

  // Create unique short-ID
  const id = Math.random().toString(36).substring(2, 12).toUpperCase();

  // Expiration option setup
  let expiresAt: string | null = null;
  if (expiresOption === "24h") {
    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  } else if (expiresOption === "3d") {
    expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  } else if (expiresOption === "7d") {
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  const newToken: ReviewToken = {
    id,
    clientName: clientName.trim(),
    serviceType: serviceType ? serviceType.trim() : "Obras Gerais",
    city: city ? city.trim() : "Cabo Frio - RJ",
    expiresAt,
    used: false,
    createdAt: new Date().toISOString(),
  };

  db.tokens.push(newToken);
  writeDB(db);

  res.json({ success: true, token: newToken });
});

// Approve or reject reviews
app.post("/api/admin/moderate-review", authenticateAdmin, (req, res) => {
  const { reviewId, action } = req.body; // action can be 'approved' or 'rejected'

  if (!reviewId || !["approved", "rejected", "pending"].includes(action)) {
    return res.status(400).json({ error: "Parâmetros de moderação inválidos." });
  }

  const db = readDB();
  const reviewIndex = db.reviews.findIndex((r) => r.id === reviewId);

  if (reviewIndex === -1) {
    return res.status(404).json({ error: "Avaliação não encontrada." });
  }

  db.reviews[reviewIndex].status = action;
  writeDB(db);

  res.json({ success: true, message: `Avaliação foi marcada como ${action} com sucesso.` });
});

// Add or Edit Portfolio Project
app.post("/api/admin/projects", authenticateAdmin, (req, res) => {
  const { id, title, category, location, description, imageUrl, beforeDesc, afterDesc } = req.body;

  if (!title || !category || !location || !description || !imageUrl) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios (Título, Categoria, Local, Descrição e Imagem)." });
  }

  const db = readDB();
  if (!db.projects) {
    db.projects = [];
  }

  // Create or lookup categoryLabel
  const categoryLabels: Record<string, string> = {
    alvenaria: "Alvenaria",
    pintura: "Pintura",
    eletrica: "Elétrica",
    hidraulica: "Hidráulica",
    marcenaria: "Marcenaria",
    carpintaria: "Carpintaria",
  };

  const projectData: PortfolioProject = {
    id: id || `p_${Math.random().toString(36).substring(2, 11)}`,
    title: title.trim(),
    category: category,
    categoryLabel: categoryLabels[category] || "Geral",
    location: location.trim(),
    description: description.trim(),
    imageUrl: imageUrl,
  };

  if (beforeDesc || afterDesc) {
    projectData.beforeAfter = {
      beforeDesc: (beforeDesc || "").trim(),
      afterDesc: (afterDesc || "").trim()
    };
  }

  const existingIndex = db.projects.findIndex((p) => p.id === projectData.id);
  if (existingIndex !== -1) {
    // Update
    db.projects[existingIndex] = projectData;
  } else {
    // Create
    db.projects.push(projectData);
  }

  writeDB(db);
  res.json({ success: true, project: projectData });
});

// Delete Portfolio Project
app.delete("/api/admin/projects/:id", authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const db = readDB();
  if (!db.projects) {
    db.projects = [];
  }

  const index = db.projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Projeto não encontrado." });
  }

  db.projects.splice(index, 1);
  writeDB(db);

  res.json({ success: true, message: "Projeto excluído com sucesso do portfólio." });
});

// Upload image (base64)
app.post("/api/admin/upload-image", authenticateAdmin, (req, res) => {
  const { filename, base64 } = req.body;
  if (!base64) {
    return res.status(400).json({ error: "Nenhuma imagem foi recebida." });
  }

  try {
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Formato de imagem inválido." });
    }

    const imageBuffer = Buffer.from(matches[2], "base64");
    
    const timestamp = Date.now();
    const sanitisedFilename = (filename || "upload.jpg")
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .toLowerCase();
    
    const outputFilename = `${timestamp}_${sanitisedFilename}`;
    const outputPath = path.join(process.cwd(), "uploads", outputFilename);

    fs.writeFileSync(outputPath, imageBuffer);

    res.json({ 
      success: true, 
      url: `/uploads/${outputFilename}` 
    });
  } catch (err: any) {
    console.error("Erro no processamento do upload:", err);
    res.status(500).json({ error: "Erro de servidor ao processar imagem." });
  }
});

// Delete a generated token
app.delete("/api/admin/token/:tokenId", authenticateAdmin, (req, res) => {
  const { tokenId } = req.params;
  const db = readDB();
  const index = db.tokens.findIndex((t) => t.id === tokenId);

  if (index === -1) {
    return res.status(404).json({ error: "Token não encontrado." });
  }

  db.tokens.splice(index, 1);
  writeDB(db);

  res.json({ success: true, message: "Token excluído com sucesso." });
});


// --- INTEGRATED VITE SERVING MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve HTML
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BSA BACKEND] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
