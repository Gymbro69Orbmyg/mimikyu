/**
 * ╔══════════════════════════════════════════╗
 * ║   MIMIKYU TAROT — CONFIGURAÇÃO GERAL     ║
 * ║   Edite este arquivo para personalizar   ║
 * ╚══════════════════════════════════════════╝
 *
 * PARA ADICIONAR UM SERVIÇO:
 *   - Copie um bloco de {} dentro de SERVICES
 *   - Adicione a imagem em assets/servicos/
 *   - Defina highlighted: true para destacar
 */

const CONFIG = {

  // ── DONO DO SITE ───────────────────────────
  owner: {
    whatsappNumber: '5575998111385',       // número com código do país, sem + ou espaço
    tiktokUrl:      'https://www.tiktok.com/@mimikyu6666',
    instagramUrl:   '',                    // deixe vazio se não tiver ainda
  },

  // ── HORÁRIOS DISPONÍVEIS ───────────────────
  // Segunda a domingo, 07:00 às 18:00
  availableTimes: [
    '07:00','08:00','09:00','10:00','11:00','12:00',
    '13:00','14:00','15:00','16:00','17:00','18:00',
  ],

  // ── SERVIÇOS ──────────────────────────────
  // highlighted: true  → card com borda vermelha em destaque
  // image: caminho relativo a partir da raiz do site
  services: [
    {
      id:          'uma-pergunta',
      name:        '1 Pergunta',
      price:       10,
      priceLabel:  'R$10',
      description: 'Uma pergunta objetiva com leitura focada nas cartas.',
      details:     'Ideal para quem tem uma dúvida específica e quer uma resposta clara. Você envia sua pergunta e recebe a leitura completa com a interpretação das cartas pelo meio de contato escolhido.',
      image:       'assets/servicos/servico-1pergunta.png',
      icon:        '🃏',
      highlighted: false,
    },
    {
      id:          'tres-perguntas',
      name:        '3 Perguntas',
      price:       25,
      priceLabel:  'R$25',
      description: 'Três perguntas numa leitura mais completa e aprofundada.',
      details:     'Para quem precisa de uma visão mais ampla. Você envia três perguntas e recebe a leitura completa das cartas para cada uma, com interpretação detalhada pelo meio de contato escolhido.',
      image:       'assets/servicos/servico-3perguntas.png',
      icon:        '🔮',
      highlighted: true,   // ← DESTAQUE
    },
    // ── ADICIONE NOVOS SERVIÇOS ABAIXO ──────
    // {
    //   id:          'leitura-amor',
    //   name:        'Amor & Relacionamentos',
    //   price:       40,
    //   priceLabel:  'R$40',
    //   description: 'Leitura específica para assuntos do coração.',
    //   details:     'Descrição longa que aparece na mini tela do serviço.',
    //   image:       'assets/servicos/servico-amor.png',
    //   icon:        '❤️',
    //   highlighted: false,
    // },
  ],

  // ── FAQ ───────────────────────────────────
  // Adicione ou remova perguntas livremente
  faq: [
    {
      q: 'Como funciona?',
      a: 'Você escolhe o serviço, agenda um horário e informa seu contato. No horário combinado faço a leitura e envio as cartas com a interpretação direto para você.',
    },
    {
      q: 'Como recebo minha leitura?',
      a: 'Pelo contato que você informar no agendamento — WhatsApp, Instagram ou TikTok. Você recebe as cartas e a interpretação direto na sua caixa de mensagens.',
    },
    {
      q: 'Quais horários estão disponíveis?',
      a: 'Atendo de segunda a domingo, das 07h às 18h. Os horários já ocupados aparecem bloqueados automaticamente.',
    },
    {
      q: 'Como funciona o pagamento?',
      a: 'O pagamento é feito diretamente comigo no horário agendado, pelo meio de contato que você escolher. Combinamos antes de iniciar a leitura.',
    },
  ],

  // ── TEXTOS DO SITE ────────────────────────
  texts: {
    heroTagline:  'Tarot Online',
    heroTitle:    'Respostas que você precisa',
    heroSubtitle: 'Consultas de tarot direto pelo seu contato preferido.',
  },

};

// Não edite abaixo desta linha
if (typeof module !== 'undefined') module.exports = CONFIG;
