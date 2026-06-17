/**
 * MIMIKYU TAROT — APP PRINCIPAL
 * Depende de: js/config.js (carregado antes)
 */

// ══════════════════════════════════════════════
//   ESTADO
// ══════════════════════════════════════════════
const App = {
  state: {
    page: 'home',           // 'home' | 'schedule' | 'summary' | 'done'
    step: 1,                // 1–4
    selectedServices: [],   // índices dos serviços escolhidos
    date:    null,
    time:    null,
    name:    '',
    contact: { type: null, value: '' },
  },

  cal: {
    year:  new Date().getFullYear(),
    month: new Date().getMonth(),
  },

  // Horários bloqueados — persiste em localStorage
  booked: JSON.parse(localStorage.getItem('mimikyuBooked') || '{}'),

  TOTAL_STEPS: 4,
};

// ══════════════════════════════════════════════
//   PERSISTÊNCIA (horários bloqueados)
// ══════════════════════════════════════════════
function saveBooked() {
  try {
    localStorage.setItem('mimikyuBooked', JSON.stringify(App.booked));
  } catch (_) { /* storage indisponível — não bloqueia o fluxo */ }
}

function blockSlot(date, time) {
  if (!App.booked[date]) App.booked[date] = [];
  if (!App.booked[date].includes(time)) App.booked[date].push(time);
  saveBooked();
}

function isSlotTaken(date, time) {
  return (App.booked[date] || []).includes(time);
}

// ══════════════════════════════════════════════
//   ROTEAMENTO DE PÁGINAS
// ══════════════════════════════════════════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + id);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
  App.state.page = id;
}

function goHome() {
  resetState();
  showPage('home');
}

function goToSchedule() {
  showPage('schedule');
  renderStep(App.state.step || 1);
}

function startFlow(preselectedIndex) {
  resetState();
  if (preselectedIndex !== undefined) {
    App.state.selectedServices = [preselectedIndex];
  }
  showPage('schedule');
  renderStep(1);
}

function resetState() {
  App.state.step = 1;
  App.state.selectedServices = [];
  App.state.date = null;
  App.state.time = null;
  App.state.name = '';
  App.state.contact = { type: null, value: '' };
}

// ══════════════════════════════════════════════
//   STEPS
// ══════════════════════════════════════════════
function renderStep(n) {
  App.state.step = n;

  document.getElementById('stepNum').textContent = n;
  const pct = Math.round((n / App.TOTAL_STEPS) * 100);
  document.getElementById('progressFill').style.width = pct + '%';

  for (let i = 1; i <= App.TOTAL_STEPS; i++) {
    const el = document.getElementById('step' + i);
    if (el) el.style.display = (i === n) ? 'block' : 'none';
  }

  clearErrors();

  if (n === 1) renderServiceStep();
  if (n === 2) renderCalendar();
  if (n === 3) renderTimes();
  if (n === 4) renderContactStep();
}

function nextStep() {
  if (!validateStep(App.state.step)) return;
  if (App.state.step < App.TOTAL_STEPS) {
    renderStep(App.state.step + 1);
    window.scrollTo(0, 0);
  } else {
    buildSummary();
    showPage('summary');
  }
}

function prevStep() {
  if (App.state.step > 1) {
    renderStep(App.state.step - 1);
  } else {
    goHome();
  }
}

function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(e => e.classList.remove('show'));
}

// ══════════════════════════════════════════════
//   VALIDAÇÃO
// ══════════════════════════════════════════════
function validateStep(n) {
  if (n === 1) {
    if (App.state.selectedServices.length === 0) {
      showError('err1', 'Selecione ao menos um serviço para continuar.');
      return false;
    }
  }
  if (n === 2) {
    if (!App.state.date) {
      showError('err2', 'Escolha uma data para continuar.');
      return false;
    }
  }
  if (n === 3) {
    if (!App.state.time) {
      showError('err3', 'Escolha um horário para continuar.');
      return false;
    }
  }
  if (n === 4) {
    const name = document.getElementById('inputName').value.trim();
    if (!name) { showError('err4', 'Digite seu nome para continuar.'); return false; }

    const type = App.state.contact.type;
    let val = '';
    if (type === 'whatsapp')  val = document.getElementById('inputWpp').value.trim();
    if (type === 'instagram') val = document.getElementById('inputInsta').value.trim();
    if (type === 'tiktok')    val = document.getElementById('inputTiktok').value.trim();

    if (!type || !val) {
      showError('err4', 'Informe seu meio de contato e preencha o campo.');
      return false;
    }

    // Sanitiza: não armazena valor raw — só guarda no state após encode
    App.state.name = sanitizeText(name);
    App.state.contact.value = sanitizeText(val);
  }
  return true;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}

// Sanitização básica de input (evita XSS ao injetar no DOM via textContent)
function sanitizeText(str) {
  return String(str).replace(/[<>"'`]/g, '').trim().substring(0, 200);
}

// ══════════════════════════════════════════════
//   STEP 1 — SERVIÇOS
// ══════════════════════════════════════════════
function renderServiceStep() {
  const grid = document.getElementById('servicesPickGrid');
  grid.innerHTML = '';

  CONFIG.services.forEach((svc, idx) => {
    const card = document.createElement('div');
    const selected = App.state.selectedServices.includes(idx);
    card.className = 'pick-svc-card' + (svc.highlighted ? ' highlighted' : '') + (selected ? ' selected' : '');
    card.dataset.idx = idx;
    card.innerHTML = `
      <div class="pick-svc-img-wrap">
        <img src="${escAttr(svc.image)}" alt="${escAttr(svc.name)}" class="pick-svc-img"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="pick-svc-icon" style="display:none">${svc.icon}</div>
      </div>
      <div class="pick-svc-info">
        ${svc.highlighted ? '<div class="badge-popular">Popular</div>' : ''}
        <div class="pick-svc-name">${escHTML(svc.name)}</div>
        <div class="pick-svc-desc">${escHTML(svc.description)}</div>
        <div class="pick-svc-price">${escHTML(svc.priceLabel)}</div>
      </div>
      <div class="pick-svc-check">${selected ? '✓' : ''}</div>
    `;
    card.addEventListener('click', () => toggleService(idx));
    grid.appendChild(card);
  });
}

function toggleService(idx) {
  const i = App.state.selectedServices.indexOf(idx);
  if (i === -1) {
    App.state.selectedServices.push(idx);
  } else {
    App.state.selectedServices.splice(i, 1);
  }
  renderServiceStep();
}

// ══════════════════════════════════════════════
//   STEP 2 — CALENDÁRIO
// ══════════════════════════════════════════════
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const WEEK_PT   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

function renderCalendar() {
  document.getElementById('calMonth').textContent =
    MONTHS_PT[App.cal.month] + ' ' + App.cal.year;

  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';

  WEEK_PT.forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-weekday';
    el.textContent = d;
    grid.appendChild(el);
  });

  const today = new Date(); today.setHours(0,0,0,0);
  const firstDay = new Date(App.cal.year, App.cal.month, 1).getDay();
  const daysInMonth = new Date(App.cal.year, App.cal.month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const thisDate = new Date(App.cal.year, App.cal.month, d);
    const dateStr  = dateToStr(thisDate);
    const isPast   = thisDate < today;
    const isToday  = thisDate.toDateString() === today.toDateString();
    const isSelected = App.state.date === dateStr;

    const el = document.createElement('div');
    el.className = 'cal-day' +
      (isPast ? ' disabled' : '') +
      (isToday ? ' today' : '') +
      (isSelected ? ' selected' : '');
    el.textContent = d;

    if (!isPast) {
      el.addEventListener('click', () => pickDate(dateStr));
    }
    grid.appendChild(el);
  }
}

function pickDate(dateStr) {
  App.state.date = dateStr;
  App.state.time = null;
  renderCalendar();
}

function prevMonth() {
  App.cal.month--;
  if (App.cal.month < 0) { App.cal.month = 11; App.cal.year--; }
  renderCalendar();
}
function nextMonth() {
  App.cal.month++;
  if (App.cal.month > 11) { App.cal.month = 0; App.cal.year++; }
  renderCalendar();
}

function dateToStr(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function formatDatePT(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ══════════════════════════════════════════════
//   STEP 3 — HORÁRIOS
// ══════════════════════════════════════════════
function renderTimes() {
  const label = document.getElementById('selectedDateLabel');
  if (label) label.textContent = formatDatePT(App.state.date);

  const grid = document.getElementById('timeGrid');
  grid.innerHTML = '';

  CONFIG.availableTimes.forEach(t => {
    const taken = isSlotTaken(App.state.date, t);
    const el = document.createElement('div');
    el.className = 'time-slot' +
      (taken ? ' taken' : '') +
      (App.state.time === t ? ' selected' : '');
    el.textContent = t;
    if (!taken) {
      el.addEventListener('click', () => pickTime(t));
    }
    grid.appendChild(el);
  });
}

function pickTime(t) {
  App.state.time = t;
  renderTimes();
}

// ══════════════════════════════════════════════
//   STEP 4 — NOME + CONTATO
// ══════════════════════════════════════════════
function renderContactStep() {
  // restaura valores se voltou
  if (App.state.name)  document.getElementById('inputName').value = App.state.name;
  if (App.state.contact.type) {
    pickContact(App.state.contact.type);
    const inputMap = { whatsapp: 'inputWpp', instagram: 'inputInsta', tiktok: 'inputTiktok' };
    const inp = document.getElementById(inputMap[App.state.contact.type]);
    if (inp) inp.value = App.state.contact.value;
  }
}

function pickContact(type) {
  App.state.contact.type = type;
  document.querySelectorAll('.contact-opt').forEach(c => {
    c.classList.toggle('selected', c.dataset.type === type);
  });
}

// ══════════════════════════════════════════════
//   RESUMO
// ══════════════════════════════════════════════
function buildSummary() {
  const svcs = App.state.selectedServices.map(i => CONFIG.services[i]);
  const total = svcs.reduce((a, s) => a + s.price, 0);
  const svcNames = svcs.map(s => s.name).join(' + ');

  const contactLabels = {
    whatsapp:  'WhatsApp',
    instagram: 'Instagram',
    tiktok:    'TikTok',
  };

  setText('sumService', svcNames);
  setText('sumDate',    formatDatePT(App.state.date));
  setText('sumTime',    App.state.time + 'h');
  setText('sumName',    App.state.name);
  setText('sumContact', contactLabels[App.state.contact.type] + ': ' + App.state.contact.value);
  setText('sumPrice',   'R$' + total);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ══════════════════════════════════════════════
//   FINALIZAR — envia notificação ao dono
// ══════════════════════════════════════════════
function finalizar() {
  // Bloqueia o slot
  blockSlot(App.state.date, App.state.time);

  // Monta mensagem para o dono (sem expor número do cliente na URL do cliente)
  const svcs = App.state.selectedServices.map(i => CONFIG.services[i]);
  const total = svcs.reduce((a, s) => a + s.price, 0);
  const svcNames = svcs.map(s => `${s.name} (${s.priceLabel})`).join(' + ');

  const contactLabels = { whatsapp: 'WhatsApp', instagram: 'Instagram', tiktok: 'TikTok' };
  const contactLine = contactLabels[App.state.contact.type] + ': ' + App.state.contact.value;

  const msg =
    `🃏 *Novo agendamento — Mimikyu Tarot*\n\n` +
    `📌 Serviço: ${svcNames}\n` +
    `💰 Total: R$${total}\n` +
    `📅 Data: ${formatDatePT(App.state.date)}\n` +
    `🕐 Horário: ${App.state.time}h\n` +
    `👤 Nome: ${App.state.name}\n` +
    `📬 Contato: ${contactLine}`;

  // Abre WhatsApp do DONO com os dados do pedido
  const url = 'https://wa.me/' + CONFIG.owner.whatsappNumber +
    '?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');

  showPage('done');
}

// ══════════════════════════════════════════════
//   MODAL DE SERVIÇO (mini tela iFood)
// ══════════════════════════════════════════════
function openServiceModal(idx) {
  const svc = CONFIG.services[idx];
  if (!svc) return;

  document.getElementById('modalImg').src = svc.image;
  document.getElementById('modalImgIcon').textContent = svc.icon;
  document.getElementById('modalName').textContent = svc.name;
  document.getElementById('modalDesc').textContent = svc.details;
  document.getElementById('modalPrice').textContent = svc.priceLabel;
  document.getElementById('modalBtn').onclick = () => {
    closeModal();
    startFlow(idx);
  };

  // mostra imagem ou ícone
  const img = document.getElementById('modalImg');
  img.onerror = () => {
    img.style.display = 'none';
    document.getElementById('modalImgIcon').style.display = 'flex';
  };
  img.style.display = 'block';
  document.getElementById('modalImgIcon').style.display = 'none';

  document.getElementById('serviceModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('serviceModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════════
//   FAQ
// ══════════════════════════════════════════════
function toggleFaq(el) {
  el.parentElement.classList.toggle('open');
}

// ══════════════════════════════════════════════
//   HELPERS DE SEGURANÇA
// ══════════════════════════════════════════════
function escHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escAttr(str) { return escHTML(str); }

// ══════════════════════════════════════════════
//   INIT
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Renderiza home dinâmico
  renderHomeServices();
  renderFAQ();

  // Contato options — bind por data-type
  document.querySelectorAll('.contact-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const t = opt.dataset.type;
      pickContact(t);
      const inputMap = { whatsapp: 'inputWpp', instagram: 'inputInsta', tiktok: 'inputTiktok' };
      const inp = document.getElementById(inputMap[t]);
      if (inp) inp.focus();
    });
  });

  // Fechar modal ao clicar no backdrop
  const modal = document.getElementById('serviceModal');
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });
  }

  // Escape fecha modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});

// ── Renderiza cards de serviço na HOME ───────
function renderHomeServices() {
  const grid = document.getElementById('homeServicesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  CONFIG.services.forEach((svc, idx) => {
    const card = document.createElement('div');
    card.className = 'home-svc-card' + (svc.highlighted ? ' highlighted' : '');
    card.innerHTML = `
      <div class="home-svc-img-wrap">
        <img src="${escAttr(svc.image)}" alt="${escAttr(svc.name)}" class="home-svc-img"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="home-svc-icon-ph" style="display:none">${svc.icon}</div>
        ${svc.highlighted ? '<div class="badge-popular home-badge">Popular</div>' : ''}
      </div>
      <div class="home-svc-body">
        <div class="home-svc-name">${escHTML(svc.name)}</div>
        <div class="home-svc-desc">${escHTML(svc.description)}</div>
        <div class="home-svc-price">${escHTML(svc.priceLabel)}</div>
      </div>
    `;
    card.addEventListener('click', () => openServiceModal(idx));
    grid.appendChild(card);
  });
}

// ── Renderiza FAQ ─────────────────────────────
function renderFAQ() {
  const list = document.getElementById('faqList');
  if (!list) return;
  list.innerHTML = '';

  CONFIG.faq.forEach(item => {
    const el = document.createElement('div');
    el.className = 'faq-item';
    el.innerHTML = `
      <div class="faq-q">${escHTML(item.q)}</div>
      <div class="faq-a">${escHTML(item.a)}</div>
    `;
    el.querySelector('.faq-q').addEventListener('click', function () {
      toggleFaq(this);
    });
    list.appendChild(el);
  });
}
