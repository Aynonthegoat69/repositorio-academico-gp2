// ==================== PR INFO - SCRIPT.JS ====================

// ==================== ESTADO GLOBAL ====================
const state = {
  alunos: [],
  turmas: [
    { id: '10A', classe: '10', turma: 'A', maxAlunos: 32 },
    { id: '10B', classe: '10', turma: 'B', maxAlunos: 30 },
    { id: '11A', classe: '11', turma: 'A', maxAlunos: 29 },
    { id: '11B', classe: '11', turma: 'B', maxAlunos: 29 },
    { id: '12A', classe: '12', turma: 'A', maxAlunos: 32 },
    { id: '12B', classe: '12', turma: 'B', maxAlunos: 32 },
    { id: '13A', classe: '13', turma: 'A', maxAlunos: 32 },
    { id: '13B', classe: '13', turma: 'B', maxAlunos: 32 }
  ],
  acessos: [],
  config: { horaInicio: '12:00', horaFim: '13:00' },
  turmaSelecionada: null,
  filtroAlunosTurma: 'todos',
  alertasResolvidos: []
};

// ==================== UTILITÁRIOS ====================
function $(id) { return document.getElementById(id); }

function showToast(type, title, message) {
  const container = $('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success:'check', error:'times', warning:'exclamation', info:'info' };
  toast.innerHTML = `<i class="fas fa-${icons[type]||'info'}"></i><div><strong>${title}</strong><br><small>${message}</small></div>`;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, 4000);
}

function formatDate(date) {
  return date.toLocaleDateString('pt-AO', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

function formatShortDate(date) {
  return date.toLocaleDateString('pt-AO', { day:'2-digit', month:'2-digit', year:'numeric' });
}

function formatTime(date) {
  return date.toLocaleTimeString('pt-AO', { hour:'2-digit', minute:'2-digit' });
}

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return '-';
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return `${idade} anos`;
}

function generateQRCode(matricula) {
  return `QR-${matricula}-${Math.random().toString(36).substr(2,8).toUpperCase()}`;
}

function getStatusLabel(s) {
  return { presente:'Presente', atrasado:'Atrasado', falta:'Ausente', autorizado:'Autorizado', negado:'Negado' }[s] || 'Ausente';
}

function getStatusBadge(s) {
  const map = { presente:'badge-green', atrasado:'badge-yellow', falta:'badge-red', autorizado:'badge-green', negado:'badge-red' };
  return `<span class="badge ${map[s]||'badge-gray'}">${getStatusLabel(s)}</span>`;
}

function getInitials(nome) {
  return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
}

function getLocalLabel(valor) {
  const labels = {
    'entrada': '🚪 Entrada',
    'sala': '🏫 Sala',
    'laboratorio': '💻 Lab'
  };
  return labels[valor] || valor;
}

// ==================== FUNÇÕES DE AUXÍLIO ====================
function getAcessosAluno(matricula) {
  return state.acessos.filter(a => a.matricula === matricula);
}

function contarFaltasConsecutivas(aluno) {
  const acessos = getAcessosAluno(aluno.matricula).sort((a, b) => new Date(b.data) - new Date(a.data));
  if (acessos.length === 0) return 5;
  
  let faltas = 0;
  for (let i = 0; i < 5; i++) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    const dataStr = data.toISOString().split('T')[0];
    
    const acessoDia = acessos.find(a => a.data === dataStr);
    if (!acessoDia || acessoDia.statusHoje === 'falta') {
      faltas++;
    } else {
      break;
    }
  }
  
  return faltas;
}

function contarAtrasosSemana(aluno) {
  const acessos = getAcessosAluno(aluno.matricula);
  const hoje = new Date();
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay() + 1);
  
  return acessos.filter(a => {
    const dataAcesso = new Date(a.data);
    return dataAcesso >= inicioSemana && a.statusHoje === 'atrasado';
  }).length;
}

function frequenciaMensal(aluno) {
  const acessos = getAcessosAluno(aluno.matricula);
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  
  const acessosMes = acessos.filter(a => new Date(a.data) >= inicioMes);
  const presentes = acessosMes.filter(a => a.statusHoje === 'presente').length;
  const diasUteisMes = 20;
  
  return Math.round(presentes / diasUteisMes * 100);
}

function getUltimaLeitura(matricula) {
  const acessos = getAcessosAluno(matricula).sort((a, b) => new Date(b.data) - new Date(a.data));
  return acessos.length > 0 ? acessos[0] : null;
}

// ==================== INICIALIZAÇÃO DE DADOS ====================
function initDemoData() {
  if (state.alunos.length === 0) {
    const exemplos = [
      { nome:'João Manuel António', matricula:'INF-2025-001', numeroLista:1, classe:'10', turma:'A', contacto:'+244 923 456 789', nascimento:'2008-03-12' },
      { nome:'Maria da Silva Costa', matricula:'INF-2025-002', numeroLista:2, classe:'10', turma:'A', contacto:'+244 934 567 890', nascimento:'2008-05-20' },
      { nome:'Pedro Lopes Mendes', matricula:'INF-2025-003', numeroLista:3, classe:'10', turma:'B', contacto:'+244 945 678 901', nascimento:'2008-07-15' },
      { nome:'Ana Cristina Ferreira', matricula:'INF-2025-004', numeroLista:4, classe:'11', turma:'A', contacto:'+244 956 789 012', nascimento:'2007-09-08' },
      { nome:'Carlos Alberto Neto', matricula:'INF-2025-005', numeroLista:5, classe:'12', turma:'A', contacto:'+244 967 890 123', nascimento:'2006-11-25' },
      { nome:'Luísa Fernandes Dias', matricula:'INF-2025-006', numeroLista:6, classe:'13', turma:'B', contacto:'+244 978 901 234', nascimento:'2005-02-14' }
    ];
    
    const statusOptions = ['presente','presente','atrasado','falta','presente','presente'];
    
    exemplos.forEach((e,i) => {
      state.alunos.push({
        ...e,
        id: Date.now().toString()+Math.random().toString(36).substr(2,5),
        qrCode: generateQRCode(e.matricula),
        statusHoje: statusOptions[i%statusOptions.length],
        createdAt: new Date().toISOString()
      });
    });
    
    const locais = ['entrada', 'sala', 'laboratorio'];
    for (let i=0; i<50; i++) {
      const aluno = state.alunos[Math.floor(Math.random()*state.alunos.length)];
      const diasAtras = Math.floor(Math.random()*7);
      const dataAcesso = new Date();
      dataAcesso.setDate(dataAcesso.getDate() - diasAtras);
      
      const hora = `${9+Math.floor(Math.random()*9)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`;
      
      state.acessos.push({
        id: Date.now().toString()+i,
        aluno: aluno.nome,
        matricula: aluno.matricula,
        numeroLista: aluno.numeroLista,
        classe: aluno.classe,
        turma: aluno.turma,
        local: locais[Math.floor(Math.random()*locais.length)],
        hora: hora,
        data: dataAcesso.toISOString().split('T')[0],
        status: Math.random()>0.15?'autorizado':'negado',
        statusHoje: aluno.statusHoje,
        obs:''
      });
    }
  }
}

// ==================== MENU TOGGLE ====================
function toggleMenu() {
  const sidebar = $('sidebar');
  const mainContent = $('main-content');
  const overlay = $('sidebar-overlay');
  const toggleBtn = $('menu-toggle');
  
  if (sidebar.classList.contains('closed')) {
    sidebar.classList.remove('closed');
    mainContent.classList.remove('expanded');
    if (overlay) overlay.classList.add('active');
    toggleBtn.innerHTML = '<i class="fas fa-times"></i>';
  } else {
    sidebar.classList.add('closed');
    mainContent.classList.add('expanded');
    if (overlay) overlay.classList.remove('active');
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
  }
}

function closeMenuOnClickOutside() {
  const sidebar = $('sidebar');
  const overlay = $('sidebar-overlay');
  const mainContent = $('main-content');
  const toggleBtn = $('menu-toggle');
  
  if (window.innerWidth <= 992 && !sidebar.classList.contains('closed')) {
    sidebar.classList.add('closed');
    mainContent.classList.add('expanded');
    if (overlay) overlay.classList.remove('active');
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
  }
}

// ==================== NAVEGAÇÃO ====================
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const pageEl = $(`page-${page}`);
  if (pageEl) {
    pageEl.classList.add('active');
  }
  
  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');
  
  if (page !== 'turmas') {
    const turmasView = $('turmas-view');
    const alunosTurmaView = $('alunos-turma-view');
    if (turmasView) turmasView.style.display = 'block';
    if (alunosTurmaView) alunosTurmaView.style.display = 'none';
    state.turmaSelecionada = null;
    mostrarBotaoNovoAluno(false);
  }
  
  const loaders = {
    'dashboard': renderDashboard,
    'turmas': renderTurmas,
    'acessos': renderAcessosPage
  };
  
  if (loaders[page]) {
    setTimeout(() => loaders[page](), 100);
  }
  
  // Fechar menu no mobile após clicar
  if (window.innerWidth <= 992) {
    toggleMenu();
  }
}

function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const page = item.dataset.page;
      if (page) navigateTo(page);
    });
  });
}

// ==================== BOTÃO NOVO ALUNO ====================
function mostrarBotaoNovoAluno(mostrar) {
  const btnNovaTurma = $('btn-nova-turma');
  const btnNovoAluno = $('btn-novo-aluno');
  
  if (btnNovaTurma) btnNovaTurma.style.display = mostrar ? 'none' : 'inline-flex';
  if (btnNovoAluno) btnNovoAluno.style.display = mostrar ? 'inline-flex' : 'none';
}

// ==================== DASHBOARD ====================
function renderKPIs() {
  const totalAlunos = state.alunos.length;
  const totalTurmas = state.turmas.length;
  const hoje = new Date().toISOString().split('T')[0];
  const acessosHoje = state.acessos.filter(a => a.data === hoje);
  const presentes = acessosHoje.filter(a => a.status === 'autorizado').length;
  const faltas = totalAlunos - presentes;
  
  $('kpi-total-alunos').textContent = totalAlunos;
  $('kpi-total-turmas').textContent = totalTurmas;
  $('kpi-presentes').textContent = presentes;
  $('kpi-faltas').textContent = faltas;
}

function renderFluxoChart() {
  const canvas = $('fluxoChart');
  if (!canvas) return;
  
  const periodo = $('filtro-periodo')?.value || 'todos';
  const ctx = canvas.getContext('2d');
  if (window.fluxoChartInstance) window.fluxoChartInstance.destroy();
  
  let horas;
  const hoje = new Date().toISOString().split('T')[0];
  
  if (periodo === 'manha') {
    horas = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00'];
  } else if (periodo === 'tarde') {
    horas = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];
  } else {
    horas = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  }
  
  const dadosPorHora = horas.map(hora => {
    const [h] = hora.split(':');
    const horaNum = parseInt(h);
    
    return state.acessos.filter(a => {
      if (a.data !== hoje) return false;
      const horaAcesso = parseInt(a.hora.split(':')[0]);
      
      if (periodo === 'manha') {
        return horaAcesso >= 9 && horaAcesso < 12 && horaAcesso === horaNum;
      } else if (periodo === 'tarde') {
        return horaAcesso >= 12 && horaAcesso < 18 && horaAcesso === horaNum;
      } else {
        return horaAcesso >= 9 && horaAcesso < 18 && horaAcesso === horaNum;
      }
    }).length;
  });
  
  let chartColor = '#00b894';
  if (periodo === 'manha') chartColor = '#0984e3';
  if (periodo === 'tarde') chartColor = '#f9ca74';
  
  window.fluxoChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: horas,
      datasets: [{
        label: 'Acessos',
        data: dadosPorHora,
        backgroundColor: chartColor + '99',
        borderColor: chartColor,
        borderWidth: 2,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} acessos`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(232,228,220,0.5)' },
          ticks: { color: '#636e72', stepSize: 5 }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#636e72' }
        }
      }
    }
  });
}

function renderAlertasCompact() {
  const container = $('alerts-compact');
  if (!container) return;
  
  const alertas = gerarAlertasFrequencia().filter(a => !a.resolvido).slice(0, 3);
  
  if (alertas.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-medium);font-size:13px">✅ Sem alertas activos</div>';
    return;
  }
  
  container.innerHTML = alertas.map(a => {
    const isWarning = a.tipo !== 'CRITICO';
    const icon = a.tipo === 'CRITICO' ? '⚠️' : 'ℹ️';
    
    return `
      <div class="alert-compact ${isWarning ? 'warning' : ''}">
        <div class="alert-icon">${icon}</div>
        <div class="alert-content">
          <div class="alert-title">${a.aluno.nome} • ${a.aluno.classe}ª${a.aluno.turma}</div>
          <div class="alert-desc">${a.motivo}</div>
          <div class="alert-action" onclick="navigateTo('acessos')">Ver detalhes →</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderActivityFeed() {
  const container = $('activity-feed');
  if (!container) return;
  
  const recentes = state.acessos.slice(-5).reverse();
  
  container.innerHTML = recentes.map(a => {
    const statusClass = a.status === 'autorizado' ? 'ok' : a.statusHoje === 'atrasado' ? 'late' : 'no';
    const statusLabel = a.status === 'autorizado' ? '✅' : a.statusHoje === 'atrasado' ? '⏰' : '❌';
    const initials = getInitials(a.aluno);
    
    return `
      <div class="activity-item ${a.statusHoje === 'atrasado' ? 'late' : ''}">
        <div class="activity-avatar">${initials}</div>
        <div class="activity-details">
          <div class="activity-name">${a.aluno}</div>
          <div class="activity-meta">${a.classe}ª${a.turma} • ${getLocalLabel(a.local)}</div>
        </div>
        <div class="activity-time">${a.hora}</div>
        <span class="activity-status ${statusClass}">${statusLabel}</span>
      </div>
    `;
  }).join('');
}

function renderRankingTurmas() {
  const container = $('ranking-turmas');
  if (!container) return;
  
  const statsPorTurma = {};
  state.turmas.forEach(t => {
    const alunos = state.alunos.filter(a => a.classe === t.classe && a.turma === t.turma);
    const presentes = alunos.filter(a => a.statusHoje === 'presente').length;
    const percent = alunos.length > 0 ? Math.round(presentes/alunos.length*100) : 0;
    statsPorTurma[`${t.classe}ª${t.turma}`] = { percent, total: alunos.length };
  });
  
  const top5 = Object.entries(statsPorTurma)
    .sort((a, b) => b[1].percent - a[1].percent)
    .slice(0, 5);
  
  container.innerHTML = top5.map(([turma, stats], i) => {
    let posClass = 'normal';
    if (i === 0) posClass = 'gold';
    else if (i === 1) posClass = 'silver';
    else if (i === 2) posClass = 'bronze';
    
    return `
      <div class="ranking-item-compact">
        <div class="ranking-pos ${posClass}">${i+1}</div>
        <div class="ranking-turma">${turma}</div>
        <div class="ranking-percent">${stats.percent}%</div>
        <div class="ranking-bar"><div class="ranking-fill" style="width:${stats.percent}%"></div></div>
      </div>
    `;
  }).join('');
}

function renderDashboard() {
  renderKPIs();
  renderFluxoChart();
  renderAlertasCompact();
  renderActivityFeed();
  renderRankingTurmas();
}

// ==================== TURMAS ====================
function renderTurmas() {
  const grid = $('turmas-grid');
  if (!grid) return;
  
  const search = $('search-turma')?.value.toLowerCase() || '';
  const filtradas = state.turmas.filter(t => `${t.classe}${t.turma}`.toLowerCase().includes(search));
  
  if (filtradas.length === 0) {
    grid.innerHTML = '<div class="card" style="grid-column:1/-1"><div class="empty-state"><div class="empty-icon">📚</div><h3>Nenhuma turma encontrada</h3><p>Tente ajustar a busca</p></div></div>';
    return;
  }
  
  grid.innerHTML = filtradas.map(t => {
    const alunosTurma = state.alunos.filter(a => a.classe === t.classe && a.turma === t.turma);
    const presentes = alunosTurma.filter(a => a.statusHoje === 'presente').length;
    
    return `
      <div class="card turma-card" style="cursor:pointer" onclick="abrirTurma('${t.id}')">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--primary);display:flex;align-items:center;justify-content:center;color:white;font-size:18px">
            <i class="fas fa-users"></i>
          </div>
          <div>
            <div style="font-size:15px;font-weight:600;color:var(--text-dark)">${t.classe}ª Classe • Turma ${t.turma}</div>
            <div style="font-size:12px;color:var(--text-medium);margin-top:2px">Curso de Informática</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;font-size:12px;color:var(--text-medium);margin-bottom:12px">
          <span><i class="fas fa-user"></i> ${alunosTurma.length}/${t.maxAlunos} alunos</span>
          <span><i class="fas fa-check"></i> ${presentes} presentes hoje</span>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn-sm" style="flex:1" onclick="event.stopPropagation();abrirTurma('${t.id}')">Ver Alunos</button>
          <button class="btn-outline-sm" style="flex:1" onclick="event.stopPropagation();editarTurma('${t.id}')">Editar</button>
          <button class="btn-outline-sm" style="background:rgba(239,68,68,0.1);color:#e74c3c;border-color:#e74c3c" onclick="event.stopPropagation();confirmarEliminarTurma('${t.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function abrirTurma(turmaId) {
  const turma = state.turmas.find(t => t.id === turmaId);
  if (!turma) return;
  
  state.turmaSelecionada = turmaId;
  state.filtroAlunosTurma = 'todos';
  
  const tituloEl = $('turma-selecionada-titulo');
  const infoEl = $('turma-selecionada-info');
  
  if (tituloEl) tituloEl.textContent = `${turma.classe}ª Classe • Turma ${turma.turma}`;
  if (infoEl) {
    const alunosTurma = state.alunos.filter(a => a.classe === turma.classe && a.turma === turma.turma);
    infoEl.textContent = `${alunosTurma.length} alunos • Curso de Informática`;
  }
  
  actualizarContadoresFiltros(state.alunos.filter(a => a.classe === turma.classe && a.turma === turma.turma));
  
  const turmasView = $('turmas-view');
  const alunosTurmaView = $('alunos-turma-view');
  
  if (turmasView) turmasView.style.display = 'none';
  if (alunosTurmaView) alunosTurmaView.style.display = 'block';
  
  mostrarBotaoNovoAluno(true);
  
  renderListaAlunosTurma();
}

function voltarParaTurmas() {
  const turmasView = $('turmas-view');
  const alunosTurmaView = $('alunos-turma-view');
  
  if (turmasView) turmasView.style.display = 'block';
  if (alunosTurmaView) alunosTurmaView.style.display = 'none';
  
  state.turmaSelecionada = null;
  mostrarBotaoNovoAluno(false);
  
  renderTurmas();
}

function actualizarContadoresFiltros(alunos) {
  const todos = alunos.length;
  const presentes = alunos.filter(a => a.statusHoje === 'presente').length;
  const atrasados = alunos.filter(a => a.statusHoje === 'atrasado').length;
  const faltas = alunos.filter(a => !a.statusHoje || a.statusHoje === 'falta').length;
  
  const elTodos = $('filtro-todos-count');
  const elPresentes = $('filtro-presente-count');
  const elAtrasados = $('filtro-atrasado-count');
  const elFaltas = $('filtro-falta-count');
  
  if (elTodos) elTodos.textContent = `(${todos})`;
  if (elPresentes) elPresentes.textContent = `(${presentes})`;
  if (elAtrasados) elAtrasados.textContent = `(${atrasados})`;
  if (elFaltas) elFaltas.textContent = `(${faltas})`;
}

function filtrarAlunosTurma(filtro, btn) {
  document.querySelectorAll('#alunos-turma-view .turma-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  state.filtroAlunosTurma = filtro;
  renderListaAlunosTurma();
}

function renderListaAlunosTurma() {
  const container = $('alunos-turma-lista');
  if (!container || !state.turmaSelecionada) return;
  
  const turma = state.turmas.find(t => t.id === state.turmaSelecionada);
  if (!turma) return;
  
  const search = $('search-aluno-turma')?.value.toLowerCase() || '';
  
  let filtrados = state.alunos.filter(a => {
    const matchTurma = a.classe === turma.classe && a.turma === turma.turma;
    const matchSearch = !search || a.nome.toLowerCase().includes(search) || a.matricula.toLowerCase().includes(search);
    const matchStatus = state.filtroAlunosTurma === 'todos' || a.statusHoje === state.filtroAlunosTurma;
    return matchTurma && matchSearch && matchStatus;
  });
  
  filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
  
  if (filtrados.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding:30px"><div class="empty-icon">👤</div><h3>Nenhum aluno encontrado</h3><p>Tente ajustar os filtros</p></div>';
    return;
  }
  
  container.innerHTML = filtrados.map(a => {
    const statusClass = a.statusHoje === 'presente' ? 'presente' : a.statusHoje === 'atrasado' ? 'atrasado' : 'falta';
    const statusLabel = getStatusLabel(a.statusHoje);
    
    return `
      <div class="aluno-turma-item ${statusClass}" onclick="abrirInfoAluno('${a.matricula}')">
        <div class="aluno-numero">${String(a.numeroLista || '--').padStart(3, '0')}</div>
        <div class="aluno-info">
          <div class="aluno-nome">${a.nome}</div>
          <div class="aluno-matricula">${a.matricula}</div>
        </div>
        <span class="aluno-status ${statusClass}">${statusLabel}</span>
      </div>
    `;
  }).join('');
}

// ==================== MODAL INFO ALUNO ====================
function abrirInfoAluno(matricula) {
  const aluno = state.alunos.find(a => a.matricula === matricula);
  if (!aluno) return;
  
  const avatarEl = $('info-avatar');
  const nomeEl = $('info-nome');
  const turmaClasseEl = $('info-turma-classe');
  const matriculaEl = $('info-matricula');
  const numeroListaEl = $('info-numero-lista');
  const nascimentoEl = $('info-nascimento');
  const idadeEl = $('info-idade');
  const contactoEl = $('info-contacto');
  const statusEl = $('info-status');
  
  if (avatarEl) avatarEl.textContent = getInitials(aluno.nome);
  if (nomeEl) nomeEl.textContent = aluno.nome;
  if (turmaClasseEl) turmaClasseEl.textContent = `${aluno.classe}ª Classe • Turma ${aluno.turma}`;
  if (matriculaEl) matriculaEl.textContent = aluno.matricula;
  if (numeroListaEl) numeroListaEl.textContent = String(aluno.numeroLista || '--').padStart(3, '0');
  if (nascimentoEl) nascimentoEl.textContent = aluno.nascimento ? formatShortDate(new Date(aluno.nascimento)) : '-';
  if (idadeEl) idadeEl.textContent = calcularIdade(aluno.nascimento);
  if (contactoEl) contactoEl.textContent = aluno.contacto || 'Não registado';
  
  if (statusEl) {
    const statusClass = aluno.statusHoje === 'presente' ? 'normal' : aluno.statusHoje === 'atrasado' ? 'merito' : 'risco';
    const statusLabel = getStatusLabel(aluno.statusHoje);
    statusEl.textContent = statusLabel;
    statusEl.className = `status-pill ${statusClass}`;
  }
  
  const modalEl = $('modal-info-aluno');
  if (modalEl) modalEl.dataset.matricula = matricula;
  
  openModal('modal-info-aluno');
}

function abrirHistoricoDoModal() {
  const modalEl = $('modal-info-aluno');
  const matricula = modalEl?.dataset.matricula;
  if (matricula) abrirHistoricoAluno(matricula);
}

function editarAlunoDoModal() {
  const modalEl = $('modal-info-aluno');
  const matricula = modalEl?.dataset.matricula;
  if (!matricula) return;
  
  const aluno = state.alunos.find(a => a.matricula === matricula);
  if (!aluno) return;
  
  const tituloEl = $('modal-aluno-title');
  const idEl = $('aluno-id');
  const nomeEl = $('aluno-nome');
  const matriculaEl = $('aluno-matricula');
  const numeroListaEl = $('aluno-numero-lista');
  const nascimentoEl = $('aluno-nascimento');
  const classeEl = $('aluno-classe');
  const turmaEl = $('aluno-turma');
  const contactoEl = $('aluno-contacto');
  
  if (tituloEl) tituloEl.textContent = 'Editar Aluno';
  if (idEl) idEl.value = aluno.id;
  if (nomeEl) nomeEl.value = aluno.nome;
  if (matriculaEl) matriculaEl.value = aluno.matricula;
  if (numeroListaEl) numeroListaEl.value = aluno.numeroLista;
  if (nascimentoEl) nascimentoEl.value = aluno.nascimento || '';
  if (classeEl) classeEl.value = aluno.classe;
  if (turmaEl) turmaEl.value = aluno.turma;
  if (contactoEl) contactoEl.value = aluno.contacto || '';
  
  closeModal('modal-info-aluno');
  openModal('modal-aluno');
}

function showQRModalFromInfo() {
  const modalEl = $('modal-info-aluno');
  const matricula = modalEl?.dataset.matricula;
  if (matricula) showQRModal(matricula);
}

// ==================== HISTÓRICO DE LEITURAS ====================
function abrirHistoricoAluno(matricula) {
  const aluno = state.alunos.find(a => a.matricula === matricula);
  if (!aluno) return;
  
  closeModal('modal-info-aluno');
  
  const histAvatar = $('hist-avatar');
  const histNome = $('hist-nome');
  const histTurma = $('hist-turma');
  
  if (histAvatar) histAvatar.textContent = getInitials(aluno.nome);
  if (histNome) histNome.textContent = aluno.nome;
  if (histTurma) histTurma.textContent = `${aluno.classe}ª Classe • Turma ${aluno.turma}`;
  
  const acessosAluno = state.acessos.filter(a => a.matricula === matricula);
  
  const total = acessosAluno.length;
  const presentes = acessosAluno.filter(a => a.status === 'autorizado').length;
  const atrasados = acessosAluno.filter(a => a.statusHoje === 'atrasado').length;
  const faltas = total - presentes;
  
  $('hist-total').textContent = total;
  $('hist-presentes').textContent = presentes;
  $('hist-atrasados').textContent = atrasados;
  $('hist-faltas').textContent = faltas;
  
  renderHistoricoChart(acessosAluno);
  renderHistoricoTable(acessosAluno);
  
  const modalEl = $('modal-historico-aluno');
  if (modalEl) modalEl.dataset.matricula = matricula;
  
  openModal('modal-historico-aluno');
}

function renderHistoricoChart(acessos) {
  const canvas = $('histChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (window.histChartInstance) window.histChartInstance.destroy();
  
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const contagemPorDia = [0, 0, 0, 0, 0, 0, 0];
  
  acessos.forEach(a => {
    const data = new Date(a.data);
    const dia = data.getDay() - 1;
    if (dia >= 0 && dia < 7) {
      contagemPorDia[dia]++;
    }
  });
  
  window.histChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: diasSemana,
      datasets: [{
        label: 'Leituras',
        data: contagemPorDia,
        backgroundColor: 'rgba(0,184,148,0.6)',
        borderColor: '#00b894',
        borderWidth: 2,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 12,
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} leituras`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(232,228,220,0.5)' },
          ticks: { color: '#636e72', stepSize: 1 }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#636e72' }
        }
      }
    }
  });
}

function renderHistoricoTable(acessos) {
  const tbody = $('hist-table-body');
  if (!tbody) return;
  
  const acessosOrdenados = [...acessos].sort((a, b) => new Date(b.data) - new Date(a.data));
  
  if (acessosOrdenados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-medium)">Sem leituras registadas</td></tr>';
    return;
  }
  
  tbody.innerHTML = acessosOrdenados.slice(0, 10).map(a => {
    const statusBadge = a.status === 'autorizado' 
      ? '<span class="badge badge-green">✅ Autorizado</span>'
      : '<span class="badge badge-red">❌ Negado</span>';
    
    return `
      <tr>
        <td>${formatShortDate(new Date(a.data))}</td>
        <td><strong>${a.hora}</strong></td>
        <td>${getLocalLabel(a.local)}</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

function exportarHistoricoAluno() {
  const modalEl = $('modal-historico-aluno');
  const matricula = modalEl?.dataset.matricula;
  
  if (!matricula) {
    showToast('warning', 'Erro', 'Aluno não identificado');
    return;
  }
  
  const aluno = state.alunos.find(a => a.matricula === matricula);
  const acessosAluno = state.acessos.filter(a => a.matricula === matricula);
  
  if (acessosAluno.length === 0) {
    showToast('warning', 'Sem dados', 'Não há leituras para exportar');
    return;
  }
  
  let csv = `Histórico de Leituras - ${aluno.nome}\n`;
  csv += `Matrícula: ${aluno.matricula}\n`;
  csv += `Turma: ${aluno.classe}ª${aluno.turma}\n\n`;
  csv += 'Data,Hora,Local,Status\n';
  
  acessosAluno.forEach(a => {
    csv += `${a.data},${a.hora},${a.local},${a.status}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `historico-${aluno.matricula}.csv`;
  link.click();
  
  showToast('success', 'Exportado', 'Histórico descarregado com sucesso');
}

// ==================== GESTÃO DE TURMAS ====================
function editarTurma(turmaId) {
  const turma = state.turmas.find(t => t.id === turmaId);
  if (!turma) return;
  
  const tituloEl = $('modal-turma-title');
  const idEditEl = $('turma-id-edit');
  const classeEl = $('turma-classe');
  const nomeEl = $('turma-nome');
  const maxEl = $('turma-max-alunos');
  
  if (tituloEl) tituloEl.textContent = 'Editar Turma';
  if (idEditEl) idEditEl.value = turmaId;
  if (classeEl) classeEl.value = turma.classe;
  if (nomeEl) nomeEl.value = turma.turma;
  if (maxEl) maxEl.value = turma.maxAlunos;
  
  openModal('modal-turma');
}

function confirmarEliminarTurma(turmaId) {
  const modalEl = $('modal-confirmar-eliminar');
  if (modalEl) modalEl.dataset.turmaId = turmaId;
  openModal('modal-confirmar-eliminar');
}

function eliminarTurma(turmaId) {
  state.turmas = state.turmas.filter(t => t.id !== turmaId);
  closeModal('modal-confirmar-eliminar');
  renderTurmas();
  renderDashboard();
  showToast('success', 'Turma Eliminada', 'A turma foi removida com sucesso');
}

function saveTurma(e) {
  e.preventDefault();
  
  const turmaId = $('turma-id-edit')?.value;
  const classe = $('turma-classe')?.value;
  const turma = $('turma-nome')?.value;
  const maxAlunos = parseInt($('turma-max-alunos')?.value) || 32;
  
  if (!classe || !turma) {
    showToast('warning', 'Campos Obrigatórios', 'Preencha classe e turma');
    return;
  }
  
  const novaId = `${classe}${turma}`;
  
  if (turmaId) {
    const index = state.turmas.findIndex(t => t.id === turmaId);
    if (index !== -1) {
      if (novaId !== turmaId && state.turmas.some(t => t.id === novaId)) {
        showToast('error', 'Turma Já Existe', `Já existe uma turma ${classe}ª${turma}`);
        return;
      }
      state.turmas[index] = { id: novaId, classe, turma, maxAlunos };
      showToast('success', 'Turma Actualizada', `${classe}ª${turma} foi actualizada`);
    }
  } else {
    if (state.turmas.some(t => t.id === novaId)) {
      showToast('error', 'Turma Já Existe', `Já existe uma turma ${classe}ª${turma}`);
      return;
    }
    state.turmas.push({ id: novaId, classe, turma, maxAlunos });
    showToast('success', 'Turma Criada', `${classe}ª${turma} foi registada`);
  }
  
  closeModal('modal-turma');
  renderTurmas();
  renderDashboard();
  e.target.reset();
  const idEditEl = $('turma-id-edit');
  if (idEditEl) idEditEl.value = '';
}

// ==================== MODAL ALUNO ====================
function saveAluno(e) {
  e.preventDefault();
  
  const alunoId = $('aluno-id')?.value;
  const nome = $('aluno-nome')?.value.trim();
  const matricula = $('aluno-matricula')?.value.trim();
  const numeroLista = $('aluno-numero-lista')?.value.trim();
  const nascimento = $('aluno-nascimento')?.value;
  const classe = $('aluno-classe')?.value;
  const turma = $('aluno-turma')?.value;
  const contacto = $('aluno-contacto')?.value.trim() || '';
  
  if (!nome || !matricula || !numeroLista || !classe || !turma) {
    showToast('warning', 'Campos Obrigatórios', 'Preencha todos os campos marcados com *');
    return;
  }
  
  if (!alunoId && state.alunos.some(a => a.matricula === matricula)) {
    showToast('error', 'Matrícula Duplicada', 'Já existe um aluno com esta matrícula');
    return;
  }
  
  if (alunoId) {
    const index = state.alunos.findIndex(a => a.id === alunoId);
    if (index !== -1) {
      state.alunos[index] = {
        ...state.alunos[index],
        nome, matricula, numeroLista: parseInt(numeroLista), nascimento, classe, turma, contacto
      };
      showToast('success', 'Aluno Actualizado', `${nome} foi actualizado`);
    }
  } else {
    const aluno = {
      id: Date.now().toString()+Math.random().toString(36).substr(2,5),
      nome, matricula, numeroLista: parseInt(numeroLista), nascimento, classe, turma, contacto,
      qrCode: generateQRCode(matricula), statusHoje: null, createdAt: new Date().toISOString()
    };
    
    state.alunos.push(aluno);
    showToast('success', 'Aluno Guardado', `${nome} foi registado com sucesso`);
  }
  
  closeModal('modal-aluno');
  renderTurmas();
  renderDashboard();
  
  if (e.target) e.target.reset();
  const idEl = $('aluno-id');
  if (idEl) idEl.value = '';
  const tituloEl = $('modal-aluno-title');
  if (tituloEl) tituloEl.textContent = 'Novo Aluno';
}

// ==================== MODAIS ====================
function openModal(modalId) { 
  const modal = $(modalId);
  if (modal) modal.classList.add('open'); 
}

function closeModal(modalId) { 
  const modal = $(modalId);
  if (modal) modal.classList.remove('open'); 
}

function showQRModal(matricula) {
  const aluno = state.alunos.find(a => a.matricula === matricula);
  if (!aluno) {
    showToast('error', 'Aluno não encontrado', 'Verifique a matrícula');
    return;
  }
  
  const nomeEl = $('qr-nome');
  const matriculaEl = $('qr-matricula');
  const turmaEl = $('qr-turma');
  const numeroListaEl = $('qr-numero-lista');
  
  if (nomeEl) nomeEl.textContent = aluno.nome;
  if (matriculaEl) matriculaEl.textContent = `Matrícula: ${aluno.matricula}`;
  if (turmaEl) turmaEl.textContent = `${aluno.classe}ª Classe • Turma ${aluno.turma}`;
  if (numeroListaEl) numeroListaEl.textContent = `Nº Lista: ${String(aluno.numeroLista || '---').padStart(3, '0')}`;
  
  openModal('modal-qr');
}

// ==================== ALERTAS DE FREQUÊNCIA ====================
function gerarAlertasFrequencia() {
  const alertas = [];
  
  state.alunos.forEach(aluno => {
    const faltasConsecutivas = contarFaltasConsecutivas(aluno);
    if (faltasConsecutivas >= 3) {
      alertas.push({
        id: aluno.id,
        tipo: 'CRITICO',
        aluno: aluno,
        motivo: `${faltasConsecutivas} faltas consecutivas`,
        accao: 'Contactar encarregado urgentemente',
        resolvido: state.alertasResolvidos.includes(aluno.id)
      });
    }
    
    const atrasosSemana = contarAtrasosSemana(aluno);
    if (atrasosSemana >= 3 && faltasConsecutivas < 3) {
      alertas.push({
        id: aluno.id,
        tipo: 'ATENCAO',
        aluno: aluno,
        motivo: `${atrasosSemana} atrasos esta semana`,
        accao: 'Enviar aviso preventivo',
        resolvido: state.alertasResolvidos.includes(aluno.id)
      });
    }
  });
  
  return alertas.sort((a, b) => {
    if (a.resolvido !== b.resolvido) return a.resolvido ? 1 : -1;
    if (a.tipo === 'CRITICO') return -1;
    if (b.tipo === 'CRITICO') return 1;
    return 0;
  });
}

function renderAlertasFrequencia() {
  const container = $('alertas-frequencia-lista');
  if (!container) return;
  
  const alertas = gerarAlertasFrequencia();
  
  const alertBadge = $('alert-badge');
  if (alertBadge) {
    const naoResolvidos = alertas.filter(a => !a.resolvido).length;
    alertBadge.textContent = naoResolvidos;
    alertBadge.style.display = naoResolvidos > 0 ? 'flex' : 'none';
  }
  
  if (alertas.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding:20px"><i class="fas fa-check-circle" style="color:var(--primary);font-size:32px;margin-bottom:12px"></i><p>Sem alertas de frequência</p></div>';
    return;
  }
  
  container.innerHTML = alertas.map(alerta => {
    const iconClass = alerta.tipo === 'CRITICO' ? 'critico' : 'atencao';
    const icon = alerta.tipo === 'CRITICO' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle';
    const itemClass = alerta.resolvido ? 'resolvido' : (alerta.tipo === 'CRITICO' ? '' : 'atencao');
    
    return `
      <div class="alerta-frequencia-item ${itemClass}">
        <div class="alerta-icon ${iconClass}">
          <i class="fas ${icon}"></i>
        </div>
        <div class="alerta-info">
          <div class="alerta-aluno-nome">${alerta.aluno.nome} - ${alerta.aluno.classe}ª${alerta.aluno.turma}</div>
          <div class="alerta-detalhes">${alerta.motivo} • ${alerta.accao}</div>
        </div>
        <div class="alerta-acoes">
          ${!alerta.resolvido ? `
            <button class="btn btn-secondary btn-sm" onclick="contactarEncarregado('${alerta.aluno.matricula}')">
              <i class="fas fa-phone"></i> Contactar
            </button>
            <button class="btn btn-primary btn-sm" onclick="resolverAlerta('${alerta.id}')">
              <i class="fas fa-check"></i> Resolver
            </button>
          ` : `
            <span style="color:var(--primary);font-size:12px;font-weight:600">
              <i class="fas fa-check-circle"></i> Resolvido
            </span>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function resolverAlerta(alunoId) {
  if (!state.alertasResolvidos.includes(alunoId)) {
    state.alertasResolvidos.push(alunoId);
  }
  renderAlertasFrequencia();
  showToast('success', 'Alerta Resolvido', 'O alerta foi marcado como resolvido');
}

function resolverTodosAlertas() {
  state.alunos.forEach(aluno => {
    if (!state.alertasResolvidos.includes(aluno.id)) {
      state.alertasResolvidos.push(aluno.id);
    }
  });
  renderAlertasFrequencia();
  showToast('success', 'Todos Resolvidos', 'Todos os alertas foram marcados como resolvidos');
}

function contactarEncarregado(matricula) {
  const aluno = state.alunos.find(a => a.matricula === matricula);
  if (!aluno) return;
  
  const mensagem = `Olá, somos da PR Info. Notamos que ${aluno.nome} tem tido faltas/atrasos. Há algum problema? Podemos ajudar?`;
  const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
  
  showToast('info', 'WhatsApp Aberto', 'Mensagem pré-preenchida');
}

// ==================== LISTA DE PRESENÇA ====================
function renderListaPresencaDia() {
  const container = $('lista-presenca-dia-content');
  if (!container) return;
  
  const turmaId = $('lista-turma-select')?.value;
  
  if (!turmaId) {
    container.innerHTML = `<div class="empty-state" style="padding:40px"><i class="fas fa-clipboard-list" style="font-size:48px;opacity:0.3;margin-bottom:16px"></i><p>Seleccione uma turma para ver a lista de presença</p></div>`;
    return;
  }
  
  const [classe, turma] = [turmaId.charAt(0), turmaId.charAt(1)];
  const alunosTurma = state.alunos.filter(a => a.classe === classe && a.turma === turma);
  alunosTurma.sort((a, b) => a.numeroLista - b.numeroLista);
  
  const presentes = alunosTurma.filter(a => a.statusHoje === 'presente');
  const atrasados = alunosTurma.filter(a => a.statusHoje === 'atrasado');
  const ausentes = alunosTurma.filter(a => !a.statusHoje || a.statusHoje === 'falta');
  
  container.innerHTML = `
    <div class="lista-presenca-resumo">
      <div class="lista-coluna presentes">
        <h4><i class="fas fa-check-circle"></i> PRESENTES (${presentes.length})</h4>
        <div class="lista-alunos">
          ${presentes.map(a => `<div class="lista-aluno-item"><span class="lista-aluno-numero">${String(a.numeroLista).padStart(2, '0')}</span><span class="lista-aluno-nome">${a.nome}</span><span class="lista-aluno-hora">${getUltimaLeitura(a.matricula)?.hora || '--:--'}</span></div>`).join('')}
        </div>
      </div>
      ${atrasados.length > 0 ? `<div class="lista-coluna atrasados"><h4><i class="fas fa-clock"></i> ATRASADOS (${atrasados.length})</h4><div class="lista-alunos">${atrasados.map(a => `<div class="lista-aluno-item"><span class="lista-aluno-numero">${String(a.numeroLista).padStart(2, '0')}</span><span class="lista-aluno-nome">${a.nome}</span><span class="lista-aluno-hora">${getUltimaLeitura(a.matricula)?.hora || '--:--'}</span></div>`).join('')}</div></div>` : ''}
      ${ausentes.length > 0 ? `<div class="lista-coluna ausentes"><h4><i class="fas fa-times-circle"></i> AUSENTES (${ausentes.length})</h4><div class="lista-alunos">${ausentes.map(a => `<div class="lista-aluno-item"><span class="lista-aluno-numero">${String(a.numeroLista).padStart(2, '0')}</span><span class="lista-aluno-nome">${a.nome}</span><span class="lista-aluno-hora">${getUltimaLeitura(a.matricula) ? formatShortDate(new Date(getUltimaLeitura(a.matricula).data)) : '--'}</span></div>`).join('')}</div></div>` : ''}
    </div>
    <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="exportarListaPresencaPDF()"><i class="fas fa-file-pdf"></i> Baixar PDF</button>
      <button class="btn btn-secondary" onclick="enviarListaProfessores()"><i class="fas fa-envelope"></i> Enviar</button>
      <button class="btn btn-secondary" onclick="window.print()"><i class="fas fa-print"></i> Imprimir</button>
    </div>
  `;
}

function exportarListaPresencaPDF() {
  showToast('info', 'PDF a gerar', 'A lista de presença está a ser preparada');
  setTimeout(() => showToast('success', 'PDF Pronto', 'O download começou'), 1500);
}

function enviarListaProfessores() {
  showToast('success', 'Enviado', 'A lista foi enviada aos professores');
}

// ==================== ACESSOS QR PAGE ====================
function renderAcessosPage() {
  renderStatsAcessos();
  renderUltimasLeituras();
  renderHistoricoAcessosPage();
  renderAlertasFrequencia();
}

function renderStatsAcessos() {
  const hoje = new Date().toISOString().split('T')[0];
  const acessosHoje = state.acessos.filter(a => a.data === hoje);
  
  $('stat-total-leituras').textContent = acessosHoje.length;
  $('stat-autorizados').textContent = acessosHoje.filter(a => a.status === 'autorizado').length;
  $('stat-atrasados').textContent = state.alunos.filter(a => a.statusHoje === 'atrasado').length;
  $('stat-negados').textContent = acessosHoje.filter(a => a.status === 'negado').length;
}

function renderUltimasLeituras() {
  const container = $('ultimas-leituras-local');
  if (!container) return;
  
  const local = $('filtro-local-ultimas')?.value || 'entrada';
  const hoje = new Date().toISOString().split('T')[0];
  const filtradas = state.acessos.filter(a => a.data === hoje && a.local === local).slice(-5).reverse();
  
  if (filtradas.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding:20px"><p>Sem leituras neste local</p></div>';
    return;
  }
  
  container.innerHTML = filtradas.map(a => {
    const statusClass = a.status === 'autorizado' ? 'badge-green' : 'badge-red';
    const statusLabel = a.status === 'autorizado' ? '✅' : '❌';
    
    return `
      <div class="ocorrencia-item ${a.status === 'negado' ? 'denied' : ''}">
        <div class="oc-icon" style="color:${a.status === 'autorizado' ? 'var(--primary)' : '#ef4444'}">
          <i class="fas fa-${a.status === 'autorizado' ? 'qrcode' : 'ban'}"></i>
        </div>
        <div class="oc-info">
          <div class="oc-aluno-nome">${a.aluno} <span class="oc-tipo-span">• ${a.classe}${a.turma}</span></div>
          <div class="oc-desc-text">Nº ${String(a.numeroLista).padStart(3,'0')} • ${getLocalLabel(a.local)}</div>
          <div class="oc-date-text">${a.hora}</div>
        </div>
        <span class="badge ${statusClass}">${statusLabel}</span>
      </div>
    `;
  }).join('');
}

function renderHistoricoAcessosPage() {
  const tbody = $('access-history-table');
  if (!tbody) return;
  
  const local = $('filtro-local')?.value || 'todos';
  const classe = $('filtro-classe')?.value || 'todas';
  const turma = $('filtro-turma')?.value || 'todas';
  const search = $('search-acessos')?.value.toLowerCase() || '';
  const hoje = new Date().toISOString().split('T')[0];
  
  let filtrados = state.acessos.filter(a => {
    const matchData = a.data === hoje;
    const matchLocal = local === 'todos' || a.local === local;
    const matchClasse = classe === 'todas' || a.classe === classe;
    const matchTurma = turma === 'todas' || a.turma === turma;
    const matchSearch = !search || a.aluno.toLowerCase().includes(search) || a.matricula.toLowerCase().includes(search);
    return matchData && matchLocal && matchClasse && matchTurma && matchSearch;
  });
  
  filtrados.sort((a, b) => b.id - a.id);
  
  if (filtrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-medium);padding:24px">Nenhum acesso registado</td></tr>';
    return;
  }
  
  tbody.innerHTML = filtrados.map(a => `
    <tr>
      <td>${a.hora}</td>
      <td><strong>${a.aluno}</strong><br><small style="color:var(--text-medium)">${a.matricula}</small></td>
      <td><strong>${String(a.numeroLista||'---').padStart(3,'0')}</strong></td>
      <td>${a.classe}ª</td>
      <td>${a.turma}</td>
      <td>${getLocalLabel(a.local)}</td>
      <td>${getStatusBadge(a.status === 'autorizado' ? 'presente' : 'negado')}</td>
    </tr>
  `).join('');
}

function exportarCSV() {
  const hoje = new Date().toISOString().split('T')[0];
  const acessosHoje = state.acessos.filter(a => a.data === hoje);
  
  if (acessosHoje.length === 0) {
    showToast('warning', 'Sem dados', 'Não há leituras para exportar');
    return;
  }
  
  let csv = 'Hora,Aluno,Matricula,Numero Lista,Classe,Turma,Local,Status\n';
  acessosHoje.forEach(a => {
    csv += `${a.hora},${a.aluno},${a.matricula},${a.numeroLista},${a.classe},${a.turma},${a.local},${a.status}\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `acessos-${hoje}.csv`;
  link.click();
  
  showToast('success', 'Exportado', 'Relatório CSV descarregado');
}

// ==================== EVENTOS GLOBAIS ====================
function setupEventListeners() {
  setupNavigation();
  
  // Botão Novo Aluno
  const btnNovoAluno = $('btn-novo-aluno');
  if (btnNovoAluno) {
    btnNovoAluno.onclick = () => {
      const tituloEl = $('modal-aluno-title');
      const formEl = $('form-aluno');
      const idEl = $('aluno-id');
      
      if (tituloEl) tituloEl.textContent = 'Novo Aluno';
      if (formEl) formEl.reset();
      if (idEl) idEl.value = '';
      
      if (state.turmaSelecionada) {
        const turma = state.turmas.find(t => t.id === state.turmaSelecionada);
        if (turma) {
          $('aluno-classe').value = turma.classe;
          $('aluno-turma').value = turma.turma;
        }
      }
      
      openModal('modal-aluno');
    };
  }
  
  const globalSearch = $('global-search');
  if (globalSearch) {
    globalSearch.addEventListener('input', e => {
      const term = e.target.value.toLowerCase();
      if (term.length > 2) {
        navigateTo('turmas');
        const searchInput = $('search-turma');
        if (searchInput) {
          searchInput.value = term;
          renderTurmas();
        }
      }
    });
  }
  
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
  
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const sidebar = $('sidebar');
      if (!sidebar.classList.contains('closed')) {
        toggleMenu();
      }
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      const tituloEl = $('modal-aluno-title');
      const formEl = $('form-aluno');
      const idEl = $('aluno-id');
      
      if (tituloEl) tituloEl.textContent = 'Novo Aluno';
      if (formEl) formEl.reset();
      if (idEl) idEl.value = '';
      openModal('modal-aluno');
    }
  });
  
  const formAluno = $('form-aluno');
  if (formAluno) formAluno.onsubmit = saveAluno;
  
  const btnCloseAluno = $('btn-close-aluno');
  const btnCancelAluno = $('btn-cancel-aluno');
  if (btnCloseAluno) btnCloseAluno.onclick = () => closeModal('modal-aluno');
  if (btnCancelAluno) btnCancelAluno.onclick = () => closeModal('modal-aluno');
  
  const btnCloseQr = $('btn-close-qr');
  const btnFecharQr = $('btn-fechar-qr');
  if (btnCloseQr) btnCloseQr.onclick = () => closeModal('modal-qr');
  if (btnFecharQr) btnFecharQr.onclick = () => closeModal('modal-qr');
  
  const formTurma = $('form-turma');
  if (formTurma) formTurma.onsubmit = saveTurma;
  
  const btnNovaTurma = $('btn-nova-turma');
  if (btnNovaTurma) btnNovaTurma.onclick = () => {
    const tituloEl = $('modal-turma-title');
    const formEl = $('form-turma');
    const idEditEl = $('turma-id-edit');
    
    if (tituloEl) tituloEl.textContent = 'Nova Turma';
    if (formEl) formEl.reset();
    if (idEditEl) idEditEl.value = '';
    openModal('modal-turma');
  };
  
  const btnCloseTurma = $('btn-close-turma');
  const btnCancelTurma = $('btn-cancel-turma');
  if (btnCloseTurma) btnCloseTurma.onclick = () => closeModal('modal-turma');
  if (btnCancelTurma) btnCancelTurma.onclick = () => closeModal('modal-turma');
}

// ==================== INICIALIZAÇÃO ====================
function init() {
  // Verificação de segurança (requer auth.js)
  if (typeof requireAuth === 'function') {
    if (!requireAuth()) return;
  } else if (localStorage.getItem('prinfo_logged_in') !== 'true') {
    window.location.href = 'login.html';
    return;
  }

  initDemoData();
  
  // Criar overlay se não existir
  if (!$('sidebar-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebar-overlay';
    overlay.onclick = closeMenuOnClickOutside;
    document.body.appendChild(overlay);
  }
  
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const greetingEl = $('greeting');
  if (greetingEl) greetingEl.textContent = `${saudacao}, Coordenador`;
  
  const dateEl = $('current-date');
  if (dateEl) dateEl.textContent = formatDate(new Date());
  
  setupEventListeners();
  renderDashboard();
  renderTurmas();
  
  console.log('✅ PR Info - Sistema carregado!');
  console.log('💡 Dicas: Ctrl+N = Novo Aluno • ESC = Fechar menu/modais');
}

// ==================== EXPORTAR FUNÇÕES ====================
window.navigateTo = navigateTo;
window.toggleMenu = toggleMenu;
window.openModal = openModal;
window.closeModal = closeModal;
window.showQRModal = showQRModal;
window.abrirTurma = abrirTurma;
window.voltarParaTurmas = voltarParaTurmas;
window.filtrarAlunosTurma = filtrarAlunosTurma;
window.renderListaAlunosTurma = renderListaAlunosTurma;
window.abrirInfoAluno = abrirInfoAluno;
window.abrirHistoricoDoModal = abrirHistoricoDoModal;
window.editarAlunoDoModal = editarAlunoDoModal;
window.showQRModalFromInfo = showQRModalFromInfo;
window.editarTurma = editarTurma;
window.confirmarEliminarTurma = confirmarEliminarTurma;
window.renderAcessosPage = renderAcessosPage;
window.renderUltimasLeituras = renderUltimasLeituras;
window.renderHistoricoAcessosPage = renderHistoricoAcessosPage;
window.exportarCSV = exportarCSV;
window.renderAlertasFrequencia = renderAlertasFrequencia;
window.resolverAlerta = resolverAlerta;
window.resolverTodosAlertas = resolverTodosAlertas;
window.contactarEncarregado = contactarEncarregado;
window.renderListaPresencaDia = renderListaPresencaDia;
window.exportarListaPresencaPDF = exportarListaPresencaPDF;
window.enviarListaProfessores = enviarListaProfessores;
window.renderFluxoChart = renderFluxoChart;
window.exportarHistoricoAluno = exportarHistoricoAluno;

// ==================== INICIAR ====================
document.addEventListener('DOMContentLoaded', init);
