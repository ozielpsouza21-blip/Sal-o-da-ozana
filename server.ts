import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to initialize Gemini client on server side
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada nas variáveis de ambiente do servidor.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Beauty Consultant API Endpoint
app.post('/api/ai/consultant', async (req, res) => {
  try {
    const { message, history, imageBase64, productsCatalog, servicesCatalog } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({ error: 'Mensagem ou imagem necessária.' });
    }

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch (keyErr: any) {
      // Fallback elegant response if API key is not yet set in Secrets
      return res.json({
        replyText:
          'Olá! Seja muito bem-vinda ao atelier Sra. Bela Mulher. Para ativar a consultoria em tempo real com Inteligência Artificial, configure a chave GEMINI_API_KEY em Settings > Secrets.',
        recommendedProductIds: [],
        recommendedServiceIds: [],
        apiKeyMissing: true,
      });
    }

    // Format products catalog context safely
    const productsListStr = (productsCatalog || [])
      .map(
        (p: any) =>
          `- ID: "${p.id}", Nome: "${p.name}", Categoria: "${p.category}", Marca: "${p.brand || 'Sra. Bela Mulher'}", Preço: R$ ${((p.promotionalPriceBRL ?? p.salePriceBRL) || 0).toFixed(2)}, Estoque: ${p.stockQuantity ?? 10} un`
      )
      .join('\n');

    // Format services catalog context safely
    const servicesListStr = (servicesCatalog || [])
      .map(
        (s: any) =>
          `- ID: "${s.id}", Nome: "${s.name}", Categoria: "${s.category}", Preço: R$ ${((s.promotionalPriceBRL ?? s.priceBRL) || 0).toFixed(2)}, Duração: ${s.durationMinutes} min, Descrição: "${s.description}"`
      )
      .join('\n');

    const systemInstruction = `Você é a Consultora Virtual de Beleza e Visagismo do atelier "Sra. Bela Mulher Atelier", localizado nos Jardins, São Paulo.

SUA PERSONALIDADE E MISSÃO:
- Acolhedora, extremamente elegante, atenciosa e especialista em visagismo, corte, colorimetria, rituais capilares e cuidados estéticos de luxo.
- Ofereça consultoria de beleza sob medida.
- Quando o usuário enviar uma foto do cabelo, rosto ou penteado, faça uma análise atenciosa de formato de rosto, textura capilar ou tom de pele e sugira os serviços e produtos ideais.

REGRAS DE OURO (CONFIABILIDADE TOTAL):
1. NUNCA invente produtos, serviços, preços ou estoques que não estejam na lista do catálogo abaixo.
2. NUNCA emita diagnósticos médicos ou promessas irreais.
3. Se a cliente solicitar algo inexistente no atelier, informe gentilmente que não dispomos desse item no momento.
4. Quando recomendar um produto ou serviço do catálogo, inclua a recomendação no seu texto E insira os IDs exatos nas propriedades "recommendedProductIds" e "recommendedServiceIds" do JSON retornado!

CATÁLOGO REAL DE PRODUTOS DISPONÍVEIS:
${productsListStr || 'Nenhum produto cadastrado no momento.'}

CATÁLOGO REAL DE SERVIÇOS DISPONÍVEIS:
${servicesListStr || 'Nenhum serviço cadastrado no momento.'}`;

    // Clean and strictly alternate conversation history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        if (!h || !h.text) continue;
        const role = (h.senderRole === 'client' || h.senderRole === 'visitor') ? 'user' : 'model';
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += `\n${h.text}`;
        } else {
          contents.push({ role, parts: [{ text: h.text }] });
        }
      }
    }

    // Ensure history starts with user role if present
    if (contents.length > 0 && contents[0].role !== 'user') {
      contents.shift();
    }

    // Latest user message & optional base64 image
    const latestParts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      latestParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    if (message) {
      latestParts.push({ text: message });
    } else if (!imageBase64) {
      latestParts.push({ text: 'Por favor, apresente orientações e recomendações sobre o atelier Sra. Bela Mulher.' });
    }

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts.push(...latestParts);
    } else {
      contents.push({ role: 'user', parts: latestParts });
    }

    let response: any = null;
    const modelsToTry = ['gemini-3.8-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                replyText: {
                  type: Type.STRING,
                  description: 'Resposta conversacional da consultora de beleza.',
                },
                recommendedProductIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'IDs dos produtos recomendados nesta mensagem.',
                },
                recommendedServiceIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'IDs dos serviços recomendados nesta mensagem.',
                },
              },
              required: ['replyText', 'recommendedProductIds', 'recommendedServiceIds'],
            },
          },
        });
        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        console.warn(`Tentativa com modelo ${modelName} falhou:`, err?.message || err);
      }
    }

    if (response && response.text) {
      const responseText = response.text || '{}';
      let parsed: any = {};
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = {
          replyText: responseText || 'Estamos à sua total disposição no Atelier Sra. Bela Mulher!',
          recommendedProductIds: [],
          recommendedServiceIds: [],
        };
      }

      return res.json({
        replyText: parsed.replyText || 'Estamos à sua total disposição no Atelier Sra. Bela Mulher!',
        recommendedProductIds: parsed.recommendedProductIds || [],
        recommendedServiceIds: parsed.recommendedServiceIds || [],
      });
    }

    return res.json({
      replyText:
        'Nossa equipe de consultoria do Atelier Sra. Bela Mulher está à sua total disposição! Como a rede da IA está com alta demanda momentânea, você pode agendar ou tirar dúvidas diretamente no nosso atendimento.',
      recommendedProductIds: [],
      recommendedServiceIds: [],
    });
  } catch (err: any) {
    console.error('Erro no servidor da Consultora Gemini AI:', err);
    return res.status(500).json({
      error: 'Erro no servidor da consultora de IA',
      details: err?.message || 'Falha no processamento.',
    });
  }
});

// Vite Middleware and HTML Route Handler
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Sra. Bela Mulher rodando na porta ${PORT}`);
  });
}

startServer();
