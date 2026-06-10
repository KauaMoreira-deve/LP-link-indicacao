/* ===== CHATBOT WIDGET ===== */
(function () {
  'use strict';

  /* ---------- Base de conhecimento ---------- */
  const FAQ = [
    {
      keywords: ['funciona', 'como', 'sistema', 'plataforma'],
      question: 'Como funciona o sistema?',
      answer:
        'Você cadastra seus colaboradores ou clientes, eles recebem um link exclusivo de indicação e cada lead gerado por esse link é rastreado automaticamente no painel. Simples assim!',
    },
    {
      keywords: ['indicação', 'link', 'compartilhar', 'indicar'],
      question: 'Como funciona o link de indicação?',
      answer:
        'Cada indicador recebe um link único. Quando alguém acessa e se cadastra por esse link, o sistema registra a indicação automaticamente e vincula ao indicador correto.',
    },
    {
      keywords: ['rastreamento', 'rastrear', 'lead', 'origem'],
      question: 'Como o sistema rastreia os leads?',
      answer:
        'O link de cada indicador carrega um identificador único. Quando o lead converte, o sistema registra de qual indicador veio, qual canal e o status do negócio.',
    },
    {
      keywords: ['painel', 'dashboard', 'ranking', 'relatório'],
      question: 'O que tem no painel de controle?',
      answer:
        'O painel mostra ranking dos melhores indicadores, lista completa de leads, status de cada oportunidade e a receita gerada por cada indicação.',
    },
    {
      keywords: ['preço', 'valor', 'custo', 'plano', 'investimento'],
      question: 'Quanto custa o sistema?',
      answer:
        'Os planos variam de acordo com o volume de indicadores e funcionalidades desejadas. Entre em contato pelo formulário para receber uma proposta personalizada.',
    },
    {
      keywords: ['cupom', 'desconto', 'recompensa', 'bônus', 'comissão'],
      question: 'Posso configurar cupons ou descontos?',
      answer:
        'Sim! Você define o valor e a condição da recompensa — pode ser desconto, cashback ou qualquer outra regra que faça sentido para o seu negócio.',
    },
    {
      keywords: ['personalizar', 'personalização', 'logo', 'cor', 'marca'],
      question: 'Posso personalizar com a minha marca?',
      answer:
        'Totalmente. Você configura cor, logo, textos e imagens. O sistema fica com a cara da sua empresa, sem aparecer como template genérico.',
    },
    {
      keywords: ['equipe', 'multi', 'administrador', 'acesso', 'usuário'],
      question: 'Minha equipe pode acessar?',
      answer:
        'Sim, o plano inclui acesso multi-administrador. Sua equipe acompanha os resultados sem precisar da sua intervenção.',
    },
    {
      keywords: ['integração', 'crm', 'whatsapp', 'api', 'conectar'],
      question: 'O sistema integra com outras ferramentas?',
      answer:
        'Temos integrações com as principais ferramentas de CRM e comunicação. Fale conosco para verificar a compatibilidade com a sua stack atual.',
    },
    {
      keywords: ['suporte', 'ajuda', 'atendimento', 'contato', 'dúvida'],
      question: 'Como posso tirar dúvidas?',
      answer:
        'Você pode usar este chat ou preencher o formulário de contato na página. Nosso time responde em poucos minutos durante o horário comercial.',
    },
  ];

  /* ---------- Helpers ---------- */
  function normalize(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ');
  }

  function findAnswer(input) {
    const words = normalize(input).split(/\s+/);
    let best = null;
    let bestScore = 0;

    FAQ.forEach(function (item) {
      let score = 0;
      item.keywords.forEach(function (kw) {
        if (words.some(function (w) { return w.includes(normalize(kw)); })) {
          score++;
        }
      });
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    });

    if (bestScore === 0) {
      return 'Não encontrei uma resposta específica para isso. Tente reformular ou use o formulário de contato — nosso time te responde rapidinho!';
    }
    return best.answer;
  }

  /* ---------- HTML do widget ---------- */
  var wrapper = document.createElement('div');
  wrapper.id = 'chatbot-wrapper';
  wrapper.innerHTML = [
    '<div id="chatbot-bubble">',
      '<span>Tem alguma dúvida?</span>',
      'Acesse o Chat Inteligente',
    '</div>',

    '<div id="chatbot-window">',
      '<div id="chatbot-header">',
        '<div class="cb-avatar">🤖</div>',
        '<div class="cb-info">',
          '<strong>Assistente Virtual</strong>',
          '<small>Responde na hora ⚡</small>',
        '</div>',
      '</div>',
      '<div id="chatbot-messages"></div>',
      '<div id="chatbot-suggestions"></div>',
      '<div id="chatbot-input-row">',
        '<input id="chatbot-input" type="text" placeholder="Digite sua dúvida…" autocomplete="off">',
        '<button id="chatbot-send" aria-label="Enviar">',
          '<svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>',
        '</button>',
      '</div>',
    '</div>',

    '<button id="chatbot-toggle" aria-label="Abrir chat">',
      '<div id="chatbot-badge">1</div>',
      '<svg class="cb-icon-chat" viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>',
      '<svg class="cb-icon-close" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>',
    '</button>',
  ].join('');

  document.body.appendChild(wrapper);

  /* ---------- Referências ---------- */
  var toggle     = document.getElementById('chatbot-toggle');
  var window_    = document.getElementById('chatbot-window');
  var messages   = document.getElementById('chatbot-messages');
  var input      = document.getElementById('chatbot-input');
  var sendBtn    = document.getElementById('chatbot-send');
  var suggestBox = document.getElementById('chatbot-suggestions');
  var bubble     = document.getElementById('chatbot-bubble');
  var badge      = document.getElementById('chatbot-badge');

  /* ---------- Balão aparece / some ---------- */
  var bubbleTimer;
  function showBubble() {
    bubble.style.display = 'block';
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () {
      bubble.style.display = 'none';
    }, 6000);
  }

  showBubble();
  setInterval(showBubble, 20000);

  bubble.addEventListener('click', openChat);

  /* ---------- Abrir / fechar ---------- */
  function openChat() {
    window_.classList.add('open');
    toggle.classList.add('open');
    bubble.style.display = 'none';
    badge.style.display = 'none';
    if (messages.children.length === 0) {
      addBotMessage('Olá! Sou o assistente virtual desta plataforma. Escolha uma das perguntas frequentes abaixo ou digite a sua dúvida:');
      renderSuggestions();
    }
    setTimeout(function () { input.focus(); }, 100);
  }

  toggle.addEventListener('click', function () {
    if (window_.classList.contains('open')) {
      window_.classList.remove('open');
      toggle.classList.remove('open');
    } else {
      openChat();
    }
  });

  /* ---------- Renderizar sugestões ---------- */
  function renderSuggestions() {
    suggestBox.innerHTML = '';
    FAQ.slice(0, 5).forEach(function (item) {
      var btn = document.createElement('button');
      btn.className = 'cb-suggestion';
      btn.textContent = item.question;
      btn.addEventListener('click', function () {
        addUserMessage(item.question);
        setTimeout(function () {
          addBotMessage(item.answer);
        }, 400);
        suggestBox.innerHTML = '';
      });
      suggestBox.appendChild(btn);
    });
  }

  /* ---------- Adicionar mensagens ---------- */
  function addMessage(text, type) {
    var div = document.createElement('div');
    div.className = 'cb-msg ' + type;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function addBotMessage(text)  { addMessage(text, 'bot'); }
  function addUserMessage(text) { addMessage(text, 'user'); }

  /* ---------- Enviar ---------- */
  function handleSend() {
    var text = input.value.trim();
    if (!text) return;
    addUserMessage(text);
    input.value = '';
    suggestBox.innerHTML = '';
    setTimeout(function () {
      addBotMessage(findAnswer(text));
    }, 450);
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleSend();
  });
})();
