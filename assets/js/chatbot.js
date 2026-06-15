/* =============================================================
   CHATBOT WIDGET — chatbot.js
   Criado por: Claude (IA) + Arthur
   -
   Descrição: Lógica completa do assistente virtual.
   -
   Fluxo da conversa:
     1. Bot pede o nome do usuário
     2. Exibe 3 grupos de tópicos (cards clicáveis)
     3. Dentro do grupo, exibe chips com as perguntas
     4. Exibe a resposta; perguntas de preço redirecionam
        para o WhatsApp com mensagem pré-preenchida
     5. Botão "← Voltar" retorna aos grupos
     6. Botão "Encerrar conversa" reseta tudo após 2s
   -
   Para adicionar/editar perguntas: mexa apenas no array GROUPS.
   Para trocar o número do WhatsApp: altere WHATSAPP_NUMBER.
   NÃO edite este arquivo sem avisar o Arthur.
   ============================================================= */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Número do WhatsApp da agência — altere aqui (somente dígitos)       */
  var WHATSAPP_NUMBER = '5511932153865';
  /* ------------------------------------------------------------------ */

  /* ---------- Base de conhecimento em grupos ----------
     Arthur: edite as perguntas e respostas aqui.
     Cada grupo tem: icon (emoji), title, desc e um array de questions.
     Cada question tem: q (pergunta exibida) e a (resposta em texto).
     Se a === null, o chat redireciona para o WhatsApp automaticamente.
     --------------------------------------------------------- */
  var GROUPS = [
    {
      icon: '🔍',
      title: 'Como funciona',
      desc: 'Sistema, links e painel',
      questions: [
        {
          q: 'Como funciona o sistema?',
          a: 'Você configura a oferta e os links com nossa equipe. Cada indicador recebe um link exclusivo para compartilhar. Quando alguém converte por esse link, você vê tudo no painel em tempo real — quem indicou, quem chegou e quanto faturou. Sem planilha, sem achismo.',
        },
        {
          q: 'Como funciona o link de indicação?',
          a: 'Cada indicador — colaborador ou cliente — recebe um link único e rastreado. Quando alguém se cadastra por esse link, o sistema registra automaticamente a origem, o status e a receita gerada por aquela indicação.',
        },
        {
          q: 'O que aparece no painel de controle?',
          a: 'O painel exibe: ranking dos melhores indicadores, lista completa de leads, status de cada oportunidade e a receita atribuída a cada indicação. Tudo em tempo real, atualizado automaticamente.',
        },
        {
          q: 'Como sei que o sistema está funcionando?',
          a: 'Você acompanha pelo painel: visualizações, leads captados, conversões e receita atribuída a cada indicação. Nada fica no escuro.',
        },
        {
          q: 'Quanto tempo leva para implementar?',
          a: 'A configuração inicial leva entre 1 e 3 dias úteis. Após isso, o sistema já está rodando e seus indicadores já podem compartilhar os links.',
        },
        {
          q: 'Precisa instalar algum app?',
          a: 'Não. Tudo funciona via link e WhatsApp. Zero atrito para quem indica e para quem é indicado.',
        },
      ],
    },
    {
      icon: '⚙️',
      title: 'Configuração e uso',
      desc: 'Personalização, equipe e marca',
      questions: [
        {
          q: 'Posso configurar o desconto ou recompensa?',
          a: 'Sim. Você define o valor, a condição e quando o desconto é válido — desconto em reais, porcentagem, brinde ou condição especial. Você controla o que faz sentido para a sua margem.',
        },
        {
          q: 'Posso personalizar com a minha marca?',
          a: 'Totalmente. Cor, logo, oferta, textos e fotos. Seu cliente não vê o nome de nenhuma outra empresa — só a sua. É a cara da sua loja, não um template genérico.',
        },
        {
          q: 'Meus colaboradores podem ter links?',
          a: 'Sim. Você cria links separados para clientes e para cada membro da equipe. Do vendedor ao caixa, qualquer pessoa pode gerar leads rastreados — e você monitora quem traz mais resultado.',
        },
        {
          q: 'Minha equipe pode acessar o painel?',
          a: 'Sim, o sistema tem acesso multi-administrador. Sua equipe acompanha os resultados sem precisar da sua intervenção a cada momento.',
        },
        {
          q: 'Preciso ter site ou loja virtual?',
          a: 'Não. A plataforma funciona de forma independente, com uma página exclusiva para o seu programa de indicações — hospedada no seu domínio, com a identidade visual da sua marca.',
        },
      ],
    },
    {
      icon: '💬',
      title: 'Valores e contato',
      desc: 'Falar com nossa equipe',
      questions: [
        {
          q: 'Quanto custa o sistema?',
          a: null, /* redireciona para WhatsApp */
        },
      ],
    },
  ];

  /* ---------- Helpers ---------- */
  function buildWhatsAppUrl(name) {
    var msg = name
      ? 'Olá! Meu nome é ' + name + ' e tenho interesse no sistema de indicações. Gostaria de saber os valores e planos disponíveis.'
      : 'Olá! Tenho interesse no sistema de indicações e gostaria de saber os valores e planos disponíveis.';
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  /* ---------- Estado da conversa ----------
     userName: salva o primeiro nome digitado para personalizar as mensagens.
     isDark: controla o tema claro/escuro (toggled pelo botão no header).
     step: rastreia em qual etapa do fluxo o usuário está.
       'name'     → aguardando o usuário digitar o nome
       'groups'   → exibindo os 3 grupos de tópicos
       'questions'→ exibindo perguntas de um grupo específico
       'answered' → exibindo a resposta de uma pergunta
     --------------------------------------------------------- */
  var userName = '';
  var isDark   = false;

  /* ---------- HTML do widget ----------
     Todo o markup do chatbot é gerado aqui via JS e injetado
     no <body> — assim não interferimos no HTML do seu amigo.
     --------------------------------------------------------- */
  var wrapper = document.createElement('div');
  wrapper.id = 'chatbot-wrapper';
  wrapper.innerHTML = [
    '<div id="chatbot-bubble">',
      '<strong>Tem alguma dúvida?</strong>',
      'Acesse o Chat Inteligente',
    '</div>',

    '<div id="chatbot-window">',
      '<div id="chatbot-header">',
        '<div class="cb-avatar">🤖</div>',
        '<div class="cb-info">',
          '<strong>Assistente Virtual</strong>',
          '<small>Responde na hora ⚡</small>',
        '</div>',
        '<button id="cb-theme-btn" title="Alternar tema">',
          '<span class="cb-theme-icon">🌙</span>',
          '<span class="cb-theme-label">Escuro</span>',
        '</button>',
      '</div>',

      '<div id="chatbot-messages"></div>',

      '<div id="chatbot-action-bar">',
        '<button class="cb-action-btn" id="cb-back-btn">← Voltar</button>',
        '<button class="cb-action-btn" id="cb-end-btn">Encerrar conversa</button>',
      '</div>',

      '<div id="chatbot-input-row">',
        '<input id="chatbot-input" type="text" placeholder="Digite aqui…" autocomplete="off">',
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
  var toggle    = document.getElementById('chatbot-toggle');
  var chatWin   = document.getElementById('chatbot-window');
  var messages  = document.getElementById('chatbot-messages');
  var input     = document.getElementById('chatbot-input');
  var sendBtn   = document.getElementById('chatbot-send');
  var actionBar = document.getElementById('chatbot-action-bar');
  var backBtn   = document.getElementById('cb-back-btn');
  var endBtn    = document.getElementById('cb-end-btn');
  var bubble    = document.getElementById('chatbot-bubble');
  var badge     = document.getElementById('chatbot-badge');
  var themeBtn  = document.getElementById('cb-theme-btn');

  /* ---------- Tema claro / escuro ----------
     Alterna a classe .dark na janela do chat.
     Todas as cores são CSS vars — não há hardcode aqui.
     --------------------------------------------------------- */
  themeBtn.addEventListener('click', function () {
    isDark = !isDark;
    chatWin.classList.toggle('dark', isDark);
    themeBtn.querySelector('.cb-theme-icon').textContent  = isDark ? '☀️' : '🌙';
    themeBtn.querySelector('.cb-theme-label').textContent = isDark ? 'Claro' : 'Escuro';
  });

  /* ---------- Balão de chamada ----------
     Aparece ao carregar (showBubble) e se repete a cada 20s.
     Some sozinho após 6s. Clicar nele abre o chat.
     --------------------------------------------------------- */
  var bubbleTimer;
  function showBubble() {
    bubble.style.display = 'block';
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(function () { bubble.style.display = 'none'; }, 6000);
  }
  showBubble();
  setInterval(showBubble, 20000);
  bubble.addEventListener('click', openChat);

  /* ---------- Abrir / fechar ---------- */
  function openChat() {
    chatWin.classList.add('open');
    toggle.classList.add('open');
    bubble.style.display = 'none';
    badge.style.display  = 'none';
    if (messages.children.length === 0) startConversation();
    setTimeout(function () { input.focus(); }, 120);
  }

  toggle.addEventListener('click', function () {
    if (chatWin.classList.contains('open')) {
      chatWin.classList.remove('open');
      toggle.classList.remove('open');
    } else {
      openChat();
    }
  });

  /* ---------- Fluxo de etapas ----------
     startConversation → pede o nome
     showGroups        → exibe os 3 cards de categoria
     selectGroup       → exibe os chips de pergunta do grupo
     deliverAnswer     → exibe a resposta (ou botão WhatsApp se a === null)
     --------------------------------------------------------- */
  /* step: 'name' | 'groups' | 'questions' | 'answered' */
  var step          = 'name';
  var activeGroup   = null;

  function startConversation() {
    step = 'name';
    userName = '';
    messages.innerHTML = '';
    setActionBar(false, false);
    input.placeholder = 'Digite o seu nome…';

    delay(function () {
      addBotMsg('Que bom ter você aqui! 👋');
    }, 0);
    delay(function () {
      addBotMsg('Como posso te chamar?');
    }, 600);
  }

  function showGroups() {
    step = 'groups';
    setActionBar(false, true);
    input.placeholder = 'Ou digite sua dúvida…';

    delay(function () {
      addBotMsg('Sobre o que você quer saber, ' + userName + '?');
      var container = document.createElement('div');
      container.className = 'cb-groups';

      GROUPS.forEach(function (group) {
        var btn = document.createElement('button');
        btn.className = 'cb-group-btn';
        btn.innerHTML =
          '<span class="cb-group-icon">' + group.icon + '</span>' +
          '<span class="cb-group-info">' +
            '<span class="cb-group-title">' + group.title + '</span>' +
            '<span class="cb-group-desc">' + group.desc + '</span>' +
          '</span>' +
          '<span class="cb-group-arrow">›</span>';
        btn.addEventListener('click', function () { selectGroup(group); });
        container.appendChild(btn);
      });

      messages.appendChild(container);
      scrollBottom();
    }, 400);
  }

  function selectGroup(group) {
    activeGroup = group;
    addUserMsg(group.icon + ' ' + group.title);

    /* Grupo "Valores" → vai direto para o WhatsApp */
    if (group.questions.length === 1 && group.questions[0].a === null) {
      deliverAnswer(group.questions[0]);
      return;
    }
    

    step = 'questions';
    setActionBar(true, true);

    delay(function () {
      addBotMsg('Escolha a sua dúvida:');
      var container = document.createElement('div');
      container.className = 'cb-chips';

      group.questions.forEach(function (item) {
        var btn = document.createElement('button');
        btn.className = 'cb-chip';
        btn.textContent = item.q;
        btn.addEventListener('click', function () {
          addUserMsg(item.q);
          deliverAnswer(item);
        });
        container.appendChild(btn);
      });

      messages.appendChild(container);
      scrollBottom();
    }, 350);
  }

  function deliverAnswer(item) {
    step = 'answered';
    setActionBar(true, true);

    delay(function () {
      if (item.a === null) {
        var waUrl = buildWhatsAppUrl(userName);
        var div = document.createElement('div');
        div.className = 'cb-msg bot';
        div.innerHTML =
          'Os valores são ajustados ao porte e às necessidades de cada negócio. ' +
          'Nossa equipe está pronta para te apresentar uma proposta personalizada!' +
          '<br><a class="cb-wa-link" href="' + waUrl + '" target="_blank" rel="noopener">' +
            '&#128172; Falar no WhatsApp' +
          '</a>';
        messages.appendChild(div);
      } else {
        addBotMsg(item.a);
      }
      scrollBottom();
    }, 380);
  }

  /* ---------- Barra de ações (Voltar / Encerrar) ----------
     setActionBar(showBack, showEnd): controla visibilidade dos botões.
     "← Voltar" retorna para showGroups().
     "Encerrar conversa": mostra despedida, desabilita input por 2s,
     depois limpa tudo e reinicia startConversation() — mantém a LP leve.
     --------------------------------------------------------- */
  function setActionBar(showBack, showEnd) {
    backBtn.style.visibility = showBack ? 'visible' : 'hidden';
    endBtn.style.visibility  = showEnd  ? 'visible' : 'hidden';
    actionBar.classList.toggle('visible', showBack || showEnd);
  }

  backBtn.addEventListener('click', function () {
    if (step === 'questions' || step === 'answered') {
      addBotMsg('Tudo bem! Vamos voltar para os tópicos.');
      showGroups();
    }
  });

  endBtn.addEventListener('click', function () {
    addBotMsg('Conversa encerrada. Foi um prazer te ajudar' + (userName ? ', ' + userName : '') + '! 👋');
    setActionBar(false, false);
    input.disabled = true;
    sendBtn.disabled = true;

    delay(function () {
      /* Reset completo para a próxima visita */
      messages.innerHTML = '';
      input.disabled = false;
      sendBtn.disabled = false;
      userName = '';
      startConversation();
    }, 2200);
  });

  /* ---------- Envio por digitação ----------
     Na etapa 'name': captura o primeiro nome e avança para showGroups().
     Nas demais etapas: tenta encontrar uma pergunta cujas palavras
     batem com o que o usuário digitou. Se não achar, volta para os grupos.
     --------------------------------------------------------- */
  function handleSend() {
    var text = input.value.trim();
    if (!text) return;
    input.value = '';

    if (step === 'name') {
      userName = text.split(' ')[0]; /* primeiro nome */
      addUserMsg(text);
      showGroups();
      return;
    }

    /* Nas outras etapas, tenta encontrar resposta por texto livre */
    addUserMsg(text);
    var found = null;
    var lc = text.toLowerCase();
    GROUPS.forEach(function (group) {
      group.questions.forEach(function (item) {
        if (!found && item.q.toLowerCase().split(' ').some(function (w) {
          return w.length > 3 && lc.includes(w);
        })) {
          found = item;
        }
      });
    });

    if (found) {
      deliverAnswer(found);
    } else {
      delay(function () {
        addBotMsg('Não encontrei uma resposta para isso. Que tal escolher um dos tópicos abaixo?');
        showGroups();
      }, 380);
    }
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') handleSend(); });

  /* ---------- Utilitários ---------- */
  function addBotMsg(text) {
    var div = document.createElement('div');
    div.className = 'cb-msg bot';
    div.textContent = text;
    messages.appendChild(div);
    scrollBottom();
  }

  function addUserMsg(text) {
    var div = document.createElement('div');
    div.className = 'cb-msg user';
    div.textContent = text;
    messages.appendChild(div);
    scrollBottom();
  }

  function scrollBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function delay(fn, ms) {
    setTimeout(fn, ms);
  }

})();
