// 🎭 PERSONAJES
const campeones = [
  { nombre: 'Jinx',    rol: 'Tiradora · Caótica',    emoji: '💥' },
  { nombre: 'Ahri',    rol: 'Maga · Seductora',      emoji: '🦊' },
  { nombre: 'Yasuo',   rol: 'Luchador · Errante',    emoji: '🌪️' },
  { nombre: 'Thresh',  rol: 'Soporte · Oscuro',      emoji: '⛓️' },
  { nombre: 'Lux',     rol: 'Maga · Luminosa',       emoji: '✨' },
  { nombre: 'Teemo',   rol: 'Explorador · Peligroso',emoji: '🍄' },
  { nombre: 'Zed',     rol: 'Asesino · Sombras',     emoji: '🥷' },
  { nombre: 'Vi',      rol: 'Alguacil · Brutal',     emoji: '👊' },
  { nombre: 'Ekko',    rol: 'Asesino · Tiempo',      emoji: '⏱️' },
  { nombre: 'Villano', rol: 'Villano · Malvado',     emoji: '😈' }
];

function getImagen(nombre) {
  if (nombre === 'Villano') {
    return 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Veigar_0.jpg';
  }
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${nombre}_0.jpg`;
}

// ── GALERÍA ─────────────────────────────────────────
if (document.getElementById('galeria')) {
  const galeria = document.getElementById('galeria');

  campeones.forEach(c => {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => {
      localStorage.setItem('personaje', c.nombre);
      window.location.href = '/chat.html';
    };
    card.innerHTML = `
      <div class="card-badge">${c.emoji}</div>
      <img src="${getImagen(c.nombre)}" alt="${c.nombre}" loading="lazy"/>
      <div class="card-info">
        <div class="card-nombre">${c.nombre}</div>
        <div class="card-rol">${c.rol}</div>
      </div>
    `;
    galeria.appendChild(card);
  });
}

// ── CHAT ────────────────────────────────────────────
if (document.getElementById('mensajes')) {
  const personaje = localStorage.getItem('personaje') || 'Jinx';
  const datos = campeones.find(c => c.nombre === personaje) || campeones[0];
  let historial = [];

  // Header
  document.getElementById('nombre-personaje').textContent = `${datos.emoji} ${personaje}`;
  document.getElementById('nav-nombre').textContent = personaje;
  document.getElementById('avatar-img').src = getImagen(personaje);

  // Bienvenida
  const bienvenidas = {
    Jinx:    '¡Jajaja! ¡Otro que viene a jugar conmigo! ¿No sabes que jugar conmigo es PELIGROSO? 💥',
    Ahri:    'Hmmm... otra alma interesante. Cuéntame, ¿qué te trae hasta mí? 🦊',
    Yasuo:   'El viento me trajo hasta ti. Habla... pero que valga la pena.',
    Thresh:  'Bienvenido... a mi jaula. Nadie escapa de aquí... ⛓️',
    Lux:     '¡Oh, hola! ¡Qué emocionante conocerte! ¿Hablamos de magia? ✨',
    Teemo:   '¡Misión aceptada! Soy Teemo... soy muy amigable... muy... 🍄',
    Zed:     'Las sombras te guiaron hasta mí. Pregunta lo que deseas.',
    Vi:      'Al grano. ¿Qué quieres? No tengo todo el día. 👊',
    Ekko:    'Ey, ey, tranquilo. Sé exactamente cómo va a ir esto. ⏱️',
    Villano: '¡MUHAHAHA! ¡Otro imbécil que osa presentarse ante mí! 😈'
  };

  agregarMensaje(bienvenidas[personaje] || '¡Hola!', 'ia');

  // Enter para enviar
  document.getElementById('inputMsg').addEventListener('keypress', e => {
    if (e.key === 'Enter') enviarMensaje();
  });

  window.enviarMensaje = async function () {
    const input = document.getElementById('inputMsg');
    const texto = input.value.trim();
    if (!texto) return;

    agregarMensaje(texto, 'usuario');
    input.value = '';

    historial.push({ role: 'user', content: texto });

    document.getElementById('typing').style.display = 'block';
    scrollAbajo();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historial, personaje })
      });

      if (!res.ok) {
        throw new Error("Error HTTP " + res.status);
      }

      const data = await res.json();

      if (!data.content || !data.content[0]) {
        throw new Error("Respuesta inválida del servidor");
      }

      const respuesta = data.content[0].text;

      historial.push({ role: 'assistant', content: respuesta });

      document.getElementById('typing').style.display = 'none';
      agregarMensaje(respuesta, 'ia');

    } catch (error) {
      document.getElementById('typing').style.display = 'none';

      console.error("ERROR REAL:", error);

      agregarMensaje(`❌ ${error.message}`, 'ia');
    }
  };

  function agregarMensaje(texto, tipo) {
    const mensajes = document.getElementById('mensajes');
    const div = document.createElement('div');
    div.className = `mensaje ${tipo}`;

    if (tipo === 'ia') {
      div.innerHTML = `
        <img class="msg-avatar" src="${getImagen(personaje)}"/>
        <div class="burbuja">${texto}</div>
      `;
    } else {
      div.innerHTML = `<div class="burbuja">${texto}</div>`;
    }

    mensajes.appendChild(div);
    scrollAbajo();
  }

  function scrollAbajo() {
    const m = document.getElementById('mensajes');
    m.scrollTop = m.scrollHeight;
  }
}
