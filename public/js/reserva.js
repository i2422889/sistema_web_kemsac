// reserva.js — comportamiento para reserva.html
(function(){
  const form = document.getElementById('reserveForm');
  const statusEl = document.getElementById('reserveStatus');
  const clearBtn = document.getElementById('clearBtn');
  const sendBtn = form.querySelector('button[type="submit"]');

  const PENDING_KEY = 'reservas_pending_v1';

  function showMessage(text, type='success'){
    statusEl.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'message ' + (type==='error' ? 'error' : 'success');
    div.textContent = text;
    statusEl.appendChild(div);
  }

  function setLoading(isLoading){
    if(isLoading){
      sendBtn.disabled = true;
      sendBtn.textContent = 'Enviando...';
    } else {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Reservar';
    }
  }

  function validate(formData){
    const name = formData.get('name')?.trim();
    const phone = formData.get('phone')?.trim();
    const date = formData.get('date');
    const time = formData.get('time');
    const product = formData.get('product');
    if(!name) return 'El nombre es obligatorio.';
    if(!phone) return 'El teléfono es obligatorio.';
    if(!date) return 'Selecciona una fecha.';
    if(!time) return 'Selecciona una hora.';
    if(!product) return 'Selecciona un producto o servicio.';
    return null;
  }

  async function postReservationToServer(payload){
    try{
      const res = await fetch('/api/reservas', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });

      // Si no es JSON válido, captura mensaje
      const text = await res.text();
      if(!res.ok){
        throw new Error(text || 'Error en el servidor');
      }

      // Intentamos parsear JSON del body
      try{ const data = JSON.parse(text); return {ok:true, data}; } catch(e){ return {ok:true, data: text}; }
    }catch(err){
      return {ok:false, error: err.message};
    }
  }

  function saveLocally(payload){
    try{
      const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
      pending.push(Object.assign({ts: Date.now(), attempts:0}, payload));
      localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    }catch(e){
      console.error('Error guardando reserva localmente', e);
    }
  }

  async function syncPendingReservations(){
    const raw = localStorage.getItem(PENDING_KEY);
    if(!raw) return;
    let pending;
    try{ pending = JSON.parse(raw); } catch(e){ console.error('pending parse error', e); return; }
    if(!Array.isArray(pending) || pending.length === 0) return;

    showMessage('Sincronizando reservas pendientes...');

    const stillPending = [];
    for(const item of pending){
      // evita reintentos infinitos
      if(item.attempts >= 5){
        console.warn('Max attempts reached for', item);
        continue;
      }

      const payload = Object.assign({}, item);
      delete payload.ts; delete payload.attempts;

      const res = await postReservationToServer(payload);
      if(res.ok){
        console.log('Reserva pendiente sincronizada', res.data);
      } else {
        item.attempts = (item.attempts||0) + 1;
        stillPending.push(item);
      }
    }

    if(stillPending.length > 0){
      localStorage.setItem(PENDING_KEY, JSON.stringify(stillPending));
      showMessage('Algunas reservas siguen pendientes (sin conexión). Se intentará más tarde.', 'error');
    } else {
      localStorage.removeItem(PENDING_KEY);
      showMessage('Reservas pendientes sincronizadas correctamente.');
    }
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    statusEl.innerHTML = '';
    const fd = new FormData(form);
    const vError = validate(fd);
    if(vError){ showMessage(vError, 'error'); return; }

    // Construir payload limpio y con tipos correctos
    const payload = Object.fromEntries(fd.entries());
    payload.quantity = payload.quantity ? parseInt(payload.quantity, 10) : 1;

    setLoading(true);
    showMessage('Enviando reserva...');

    // Intentar enviar al servidor
    const result = await postReservationToServer(payload);

    if(!result.ok){
      // fallback: guardar localmente para reintento
      saveLocally(payload);
      setLoading(false);
      showMessage('No se pudo conectar con el servidor. La reserva se guardó localmente y se intentará sincronizar más tarde.', 'error');
      form.reset();
      return;
    }

    // Si el servidor respondió con éxito (esperamos {success:true})
    const data = result.data;
    if(data && data.success){
      setLoading(false);
      showMessage('Reserva realizada con éxito. ID: ' + (data.reserva_id || data.id || ''), 'success');
      form.reset();
      // Después de éxito, intentar sincronizar pendientes en background
      setTimeout(()=> syncPendingReservations(), 500);
      return;
    }

    // Si el servidor devolvió ok pero sin success: mostrar información
    setLoading(false);
    showMessage('Respuesta inesperada del servidor. Comprueba el servidor.', 'error');
  });

  clearBtn.addEventListener('click', function(){
    form.reset();
    statusEl.innerHTML = '';
  });

  // Rellenar fecha mínima (hoy)
  (function setMinDate(){
    const dateEl = document.getElementById('date');
    if(!dateEl) return;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth()+1).padStart(2,'0');
    const d = String(today.getDate()).padStart(2,'0');
    dateEl.min = `${y}-${m}-${d}`;
  })();

  // Al cargar la página intentamos sincronizar reservas pendientes
  window.addEventListener('load', function(){
    // Si estamos online, intentamos sincronizar
    if(navigator.onLine){
      syncPendingReservations();
    }
  });

  // Si el navegador recupera conexión, reintentar
  window.addEventListener('online', function(){
    syncPendingReservations();
  });

})();
