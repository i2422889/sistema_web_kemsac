// chatbot.js — lógica del widget de chat externalizada
(function(){
  // Configura aquí el número del asesor en formato internacional sin + ni 00.
  // Ejemplo para Perú: '51987654321' (51 = código país)
  const ADVISOR_PHONE = '51987654321';

  const chatToggle = document.getElementById('chatToggle');
  const chatWindow = document.getElementById('chatWindow');
  const closeBtn = document.getElementById('closeBtn');
  const minimizeBtn = document.getElementById('minimizeBtn');
  const messagesEl = document.getElementById('messages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');

  let open = false;
  let awaitingAdvisorConfirmation = false; // evita preguntar repetidamente

  function openChat(){ chatWindow.classList.add('open'); open = true; chatInput.focus(); }
  function closeChat(){ chatWindow.classList.remove('open'); open = false; chatToggle.focus(); }

  chatToggle.addEventListener('click', ()=> open ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);
  minimizeBtn.addEventListener('click', ()=> chatWindow.classList.toggle('open'));

  function appendMessage(text, who='bot', asHtml=false){
    const div = document.createElement('div');
    div.className = 'msg ' + (who==='user' ? 'user' : 'bot');
    if(asHtml) div.innerHTML = text; else div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function isAskingForAdvisor(text){
    if(!text) return false;
    const m = text.toLowerCase();
    const re = /asesor|asesora|hablar con (un|una)? asesor|contactar (a )?asesor|quiero hablar con|hablar con alguien|soporte humano|hablar con soporte|hablar con un agente|asesoría|habla con alguien/;
    return re.test(m);
  }

  function botResponse(msg){
    const m = msg.toLowerCase();
    if(/hola|buenos|buenas/.test(m)) return '¡Hola! ¿En qué puedo ayudarte hoy?';
    if(/precio|valor|cuesta/.test(m)) return '¿De qué producto te interesa el precio? Si tienes un código o nombre, escríbelo.';
    if(/horario|hora|abierto/.test(m)) return 'Nuestro horario es de Lunes a Viernes de 8:30 a 18:00 y Sábados de 9:00 a 13:00.';
    if(/envío|delivery|reparto/.test(m)) return 'Realizamos envíos a todo el país. El costo depende de la zona y el tamaño del pedido.';
    if(/gracias|ok|perfecto/.test(m)) return 'Con gusto. Si necesitas más ayuda, aquí estaré.';
    return null;
  }

  // Crea botones de acción dentro de un mensaje del bot (usar innerHTML)
  function askToContactAdvisor(userText){
    if(awaitingAdvisorConfirmation) return;
    awaitingAdvisorConfirmation = true;

    const html = `
      <div>¿Quieres que te comunique con un asesor por WhatsApp?</div>
      <div class="action-buttons">
        <button class="action-btn primary" data-action="contact_whatsapp">Sí, contactar</button>
        <button class="action-btn ghost" data-action="decline_contact">No, gracias</button>
      </div>
    `;

    const node = appendMessage(html, 'bot', true);

    // Delegamos eventos en messagesEl (ver abajo) para que funcionen en mensajes dinámicos
    // guardamos el contexto del mensaje del usuario para prefill
    node.dataset.context = userText;
  }

  // Abre WhatsApp con mensaje prellenado
  function openWhatsApp(prefill){
    if(!ADVISOR_PHONE){
      alert('Número de asesor no configurado en chatbot.js');
      return;
    }
    const base = `https://wa.me/${ADVISOR_PHONE}`;
    const url = base + '?text=' + encodeURIComponent(prefill);
    // Abrir en nueva pestaña — en móviles abriría la app
    window.open(url, '_blank');
  }

  function sendMessage(){
    const text = chatInput.value.trim();
    if(!text) return;
    appendMessage(text, 'user');
    chatInput.value = '';

    // Mostrar que el bot está escribiendo
    appendMessage('Escribiendo...', 'bot');

    setTimeout(()=>{
      // quitar último 'Escribiendo...'
      const last = messagesEl.querySelector('.msg.bot:last-child');
      if(last && last.textContent === 'Escribiendo...') last.remove();

      // Detectar intención de contactar con asesor
      if(isAskingForAdvisor(text)){
        askToContactAdvisor(text);
        return;
      }

      // respuestas simples
      const reply = botResponse(text);
      if(reply){ appendMessage(reply, 'bot'); return; }

      // fallback
      appendMessage('Disculpa, no entendí bien. Puedes probar con "horario", "precio <producto>", o escribir tu consulta y te responderé.', 'bot');
    }, 700 + Math.random()*700);
  }

  // Delegación de eventos para botones dinámicos dentro de mensajes
  messagesEl.addEventListener('click', function(e){
    const btn = e.target.closest('[data-action]');
    if(!btn) return;
    const action = btn.getAttribute('data-action');
    const parentMsg = btn.closest('.msg');
    const context = parentMsg ? parentMsg.dataset.context : '';

    if(action === 'contact_whatsapp'){
      // Construir mensaje prefill para el asesor
      const prefill = `Hola, quiero comunicarme con un asesor. Mi consulta: ${context || ''}`.trim();
      openWhatsApp(prefill);
      appendMessage('Se abrirá WhatsApp para contactar con un asesor. Si no se abre, revisa que tu dispositivo tenga WhatsApp instalado o usa la versión web.', 'bot');
      awaitingAdvisorConfirmation = false;
    } else if(action === 'decline_contact'){
      appendMessage('Perfecto, sigo aquí para ayudarte por chat.', 'bot');
      awaitingAdvisorConfirmation = false;
    }
  });

  sendBtn.addEventListener('click', (e)=>{ e.preventDefault(); sendMessage(); });
  chatInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ e.preventDefault(); sendMessage(); } });

  (function init(){
    appendMessage('¡Hola! Soy el asistente virtual de KEMSAC. ¿En qué puedo ayudarte?', 'bot');
  })();

})();
