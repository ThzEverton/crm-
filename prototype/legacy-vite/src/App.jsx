import { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertCircle, ArrowLeft, ArrowRight, Bell, CalendarDays, Check,
  CheckCircle2, ChevronDown, ChevronRight, CircleDollarSign, ClipboardList,
  Clock3, Download, Droplets, Ellipsis, FileText, HeartPulse, Home, LayoutDashboard,
  Leaf, LogOut, Menu, MessageCircle, Moon, MoreHorizontal, Plus, Search, Send,
  Settings, Smartphone, Sparkles, Stethoscope, Sun, TrendingDown, TrendingUp,
  UserPlus, Users, Utensils, Wallet, X
} from 'lucide-react'

const patientsSeed = [
  { id: 1, initials: 'AM', name: 'Ana Martins', goal: 'Emagrecimento', plan: 'Trimestral', next: 'Hoje, 14:30', progress: -5.2, adherence: 92, status: 'Ativo', color: '#DCE9C8' },
  { id: 2, initials: 'CS', name: 'Caio Souza', goal: 'Hipertrofia', plan: 'Semestral', next: 'Amanhã, 09:00', progress: 3.8, adherence: 86, status: 'Ativo', color: '#CBE2DE' },
  { id: 3, initials: 'LF', name: 'Luiza Freitas', goal: 'Reeducação alimentar', plan: 'Mensal', next: '08 ago, 16:00', progress: -2.1, adherence: 74, status: 'Atenção', color: '#F5D4C8' },
  { id: 4, initials: 'RM', name: 'Rafael Mendes', goal: 'Performance', plan: 'Anual', next: '12 ago, 11:30', progress: 1.4, adherence: 95, status: 'Ativo', color: '#DED8ED' },
  { id: 5, initials: 'BI', name: 'Bruna Ito', goal: 'Saúde intestinal', plan: 'Trimestral', next: '15 ago, 08:30', progress: -1.7, adherence: 68, status: 'Atenção', color: '#F2E1B7' },
]

const mealsSeed = [
  { id: 1, time: '07:30', name: 'Café da manhã', kcal: 420, protein: 24, done: true, items: 'Ovos mexidos, pão integral, mamão e café' },
  { id: 2, time: '10:30', name: 'Lanche da manhã', kcal: 180, protein: 12, done: true, items: 'Iogurte natural e castanhas' },
  { id: 3, time: '13:00', name: 'Almoço', kcal: 610, protein: 38, done: false, items: 'Arroz, feijão, frango grelhado e salada' },
  { id: 4, time: '16:30', name: 'Lanche da tarde', kcal: 250, protein: 18, done: false, items: 'Sanduíche natural e fruta' },
  { id: 5, time: '20:00', name: 'Jantar', kcal: 480, protein: 34, done: false, items: 'Batata-doce, peixe assado e legumes' },
]

const appointments = [
  { time: '08:30', end: '09:20', patient: 'Bruna Ito', type: 'Retorno', mode: 'Online', tone: 'sage' },
  { time: '10:00', end: '11:00', patient: 'Rafael Mendes', type: 'Avaliação', mode: 'Presencial', tone: 'lilac' },
  { time: '14:30', end: '15:20', patient: 'Ana Martins', type: 'Retorno', mode: 'Presencial', tone: 'coral' },
  { time: '17:00', end: '17:50', patient: 'Marina Costa', type: 'Primeira consulta', mode: 'Online', tone: 'blue' },
]

const currency = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

function usePersistedState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initialValue } catch { return initialValue }
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)) }, [key, value])
  return [value, setValue]
}

function Logo({ compact = false }) {
  return <div className="brand-lockup">
    <span className="logo-mark"><ClipboardList size={20} /><i /></span>
    {!compact && <span className="brand-name"><b>CRM</b><small>Nutricionista</small></span>}
  </div>
}

const navItems = [
  { id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'patients', label: 'Pacientes', icon: Users, count: 24 },
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'diets', label: 'Planos alimentares', icon: Utensils },
  { id: 'finance', label: 'Financeiro', icon: Wallet },
  { id: 'messages', label: 'Mensagens', icon: MessageCircle, dot: true },
]

function Sidebar({ active, setActive, open, close }) {
  return <>
    {open && <button className="scrim" aria-label="Fechar menu" onClick={close} />}
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <div className="sidebar-top"><Logo /><button className="icon-button mobile-close" onClick={close}><X size={20} /></button></div>
      <nav className="primary-nav" aria-label="Navegação principal">
        <p className="nav-caption">ATENDIMENTO</p>
        {navItems.map(item => {
          const Icon = item.icon
          return <button key={item.id} onClick={() => { setActive(item.id); close() }} className={active === item.id ? 'active' : ''}>
            <Icon size={18} strokeWidth={1.8} /><span>{item.label}</span>
            {item.count && <small>{item.count}</small>}{item.dot && <i className="unread-dot" />}
          </button>
        })}
        <p className="nav-caption second">CONTA</p>
        <button><FileText size={18} /><span>Documentos</span></button>
        <button><Settings size={18} /><span>Configurações</span></button>
      </nav>
      <div className="sidebar-foot">
        <div className="pro-note"><Sparkles size={16} /><div><b>Plano Profissional</b><small>17 dias para renovar</small></div></div>
        <div className="profile-mini"><span className="avatar dark">MN</span><div><b>Marina Nunes</b><small>CRN-3 48321</small></div><button className="bare"><MoreHorizontal size={18} /></button></div>
      </div>
    </aside>
  </>
}

function Header({ title, subtitle, onMenu, onAdd, onPatientView, installEvent, install }) {
  return <header className="topbar">
    <div className="header-copy"><button className="icon-button menu-button" onClick={onMenu}><Menu size={21} /></button><div><h1>{title}</h1><p>{subtitle}</p></div></div>
    <div className="header-actions">
      {installEvent && <button className="secondary install-button" onClick={install}><Download size={17} />Instalar app</button>}
      <button className="secondary patient-view-button" onClick={onPatientView}><Smartphone size={17} />Ver como paciente</button>
      <button className="icon-button notification"><Bell size={19} /><i /></button>
      <button className="primary" onClick={onAdd}><UserPlus size={17} />Novo paciente</button>
    </div>
  </header>
}

function StatCard({ label, value, note, trend, icon: Icon, tone }) {
  return <article className="stat-card">
    <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
    <div className="stat-meta"><span>{label}</span><strong>{value}</strong></div>
    <div className={`stat-note ${trend < 0 ? 'down' : ''}`}>{trend !== undefined && (trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />)}{note}</div>
  </article>
}

function AdherenceRing({ value, size = 45 }) {
  const color = value >= 85 ? '#2D7464' : value >= 70 ? '#D0953D' : '#D05B40'
  return <div className="ring" style={{ '--p': `${value * 3.6}deg`, '--ring': color, width: size, height: size }}><span>{value}%</span></div>
}

function Dashboard({ goTo }) {
  return <div className="dashboard page-enter">
    <section className="welcome-row">
      <div><p className="eyebrow">QUARTA-FEIRA · 05 DE AGOSTO</p><h2>Bom dia, Marina.</h2><p>Seu consultório está em ritmo saudável. Há 3 pontos que pedem atenção.</p></div>
      <div className="week-switch"><button className="icon-button"><ArrowLeft size={16} /></button><span>03 — 09 ago</span><button className="icon-button"><ArrowRight size={16} /></button></div>
    </section>

    <section className="stats-grid">
      <StatCard label="Pacientes ativos" value="24" note="+3 este mês" trend={3} icon={Users} tone="mint" />
      <StatCard label="Consultas hoje" value="4" note="Próxima às 08:30" icon={CalendarDays} tone="purple" />
      <StatCard label="Receita no mês" value="R$ 8.420" note="12% acima de julho" trend={12} icon={CircleDollarSign} tone="yellow" />
      <StatCard label="Pendências" value="R$ 740" note="3 pagamentos" trend={-3} icon={AlertCircle} tone="peach" />
    </section>

    <section className="dashboard-main">
      <article className="panel agenda-panel">
        <div className="panel-head"><div><span className="kicker">AGENDA DE HOJE</span><h3>Seu dia em 4 encontros</h3></div><button className="text-button" onClick={() => goTo('agenda')}>Abrir agenda <ArrowRight size={15} /></button></div>
        <div className="day-rhythm">
          {appointments.map((a, index) => <div className="appointment" key={a.time}>
            <div className="time"><b>{a.time}</b><small>{a.end}</small></div>
            <div className="rail"><i className={a.tone} />{index < appointments.length - 1 && <span />}</div>
            <div className="appointment-copy"><b>{a.patient}</b><p>{a.type} <em>·</em> {a.mode}</p></div>
            <button className="icon-button"><ChevronRight size={17} /></button>
          </div>)}
        </div>
      </article>

      <aside className="right-stack">
        <article className="panel attention-panel">
          <div className="panel-head compact"><div><span className="kicker">ATENÇÃO</span><h3>Precisa de você</h3></div><span className="count-badge">3</span></div>
          <div className="attention-list">
            <button><span className="signal danger" /><div><b>Luiza está sem responder</b><small>Último feedback há 6 dias</small></div><ChevronRight size={16} /></button>
            <button><span className="signal warn" /><div><b>3 pagamentos pendentes</b><small>R$ 740,00 em aberto</small></div><ChevronRight size={16} /></button>
            <button><span className="signal calm" /><div><b>Plano de Bruna vence amanhã</b><small>Revisar antes do envio</small></div><ChevronRight size={16} /></button>
          </div>
        </article>
        <article className="insight-card">
          <div className="insight-top"><Sparkles size={17} /><span>INSIGHT DA SEMANA</span></div>
          <strong>Seus pacientes bebem mais água às terças.</strong>
          <p>A adesão hídrica fica 18% acima da média nesse dia. Use esse padrão nas mensagens de incentivo.</p>
          <button>Ver indicadores <ArrowRight size={15} /></button>
        </article>
      </aside>
    </section>

    <section className="panel patient-overview">
      <div className="panel-head"><div><span className="kicker">ACOMPANHAMENTO</span><h3>Adesão dos pacientes</h3></div><div className="legend"><span><i className="good" />85% ou mais</span><span><i className="medium" />70–84%</span><span><i className="low" />Abaixo de 70%</span></div></div>
      <div className="table-wrap"><table><thead><tr><th>Paciente</th><th>Objetivo</th><th>Último check-in</th><th>Evolução</th><th>Adesão</th><th /></tr></thead><tbody>
        {patientsSeed.map((p, i) => <tr key={p.id}><td><div className="patient-cell"><span className="avatar" style={{ background: p.color }}>{p.initials}</span><div><b>{p.name}</b><small>{p.plan}</small></div></div></td><td>{p.goal}</td><td>{i === 2 ? '6 dias atrás' : i === 4 ? '3 dias atrás' : 'Hoje'}</td><td className={p.progress >= 0 ? 'positive' : 'negative'}>{p.progress > 0 ? '+' : ''}{p.progress} kg</td><td><AdherenceRing value={p.adherence} /></td><td><button className="icon-button"><Ellipsis size={18} /></button></td></tr>)}
      </tbody></table></div>
    </section>
  </div>
}

function PatientsPage({ patients, setPatients, onAdd }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const shown = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  return <div className="page-enter page-stack">
    <section className="section-heading"><div><span className="kicker">CARTEIRA CLÍNICA</span><h2>Pacientes</h2><p>Prontuários, evolução e rotina de acompanhamento em um só lugar.</p></div><button className="primary" onClick={onAdd}><Plus size={17} />Adicionar paciente</button></section>
    <div className="filters"><label className="search-field"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome..." /></label><button className="filter active">Todos <span>{patients.length}</span></button><button className="filter">Precisam de atenção <span>2</span></button><button className="filter">Planos vencendo <span>3</span></button></div>
    <section className="patient-grid">
      {shown.map(p => <button className="patient-card" key={p.id} onClick={() => setSelected(p)}>
        <div className="patient-card-top"><span className="avatar large" style={{ background: p.color }}>{p.initials}</span><span className={`status ${p.status === 'Ativo' ? 'active' : 'warning'}`}>{p.status}</span></div>
        <h3>{p.name}</h3><p>{p.goal}</p>
        <div className="patient-divider" />
        <div className="patient-card-stats"><span><small>EVOLUÇÃO</small><b className={p.progress >= 0 ? 'positive' : 'negative'}>{p.progress > 0 ? '+' : ''}{p.progress} kg</b></span><span><small>ADESÃO</small><b>{p.adherence}%</b></span></div>
        <div className="next-consult"><CalendarDays size={15} /><span>{p.next}</span><ChevronRight size={15} /></div>
      </button>)}
    </section>
    {selected && <PatientDrawer patient={selected} onClose={() => setSelected(null)} />}
  </div>
}

function PatientDrawer({ patient, onClose }) {
  return <div className="drawer-layer"><button className="scrim" onClick={onClose} aria-label="Fechar" /><aside className="drawer page-enter">
    <div className="drawer-head"><button className="icon-button" onClick={onClose}><X size={20} /></button><span>Prontuário do paciente</span><button className="icon-button"><MoreHorizontal size={20} /></button></div>
    <div className="drawer-profile"><span className="avatar xl" style={{ background: patient.color }}>{patient.initials}</span><h2>{patient.name}</h2><p>{patient.goal} · Plano {patient.plan}</p><span className="status active">Acompanhamento ativo</span></div>
    <div className="drawer-stats"><div><small>PESO ATUAL</small><b>68,4 kg</b><em>−5,2 kg</em></div><div><small>GORDURA</small><b>24,8%</b><em>−3,1%</em></div><div><small>ADESÃO</small><b>{patient.adherence}%</b><em>Boa</em></div></div>
    <div className="drawer-section"><span className="kicker">ÚLTIMA AVALIAÇÃO · 28 JUL</span><div className="weight-chart"><div className="chart-grid"/><svg viewBox="0 0 320 100" preserveAspectRatio="none"><path d="M0 18 C42 22,56 38,92 43 S142 67,183 59 S238 78,320 83" fill="none" stroke="#2d7464" strokeWidth="3"/><circle cx="320" cy="83" r="5" fill="#e76b4a"/></svg><span>73,6</span><b>68,4 kg</b></div></div>
    <div className="drawer-section"><span className="kicker">ATALHOS</span><div className="quick-grid"><button><Activity size={18} />Nova avaliação</button><button><Utensils size={18} />Editar dieta</button><button><MessageCircle size={18} />Enviar mensagem</button><button><FileText size={18} />Gerar relatório</button></div></div>
    <button className="primary wide">Abrir prontuário completo <ArrowRight size={17} /></button>
  </aside></div>
}

function AgendaPage() {
  const [day, setDay] = useState(5)
  const week = [{ n: 3, d: 'SEG' }, { n: 4, d: 'TER' }, { n: 5, d: 'QUA' }, { n: 6, d: 'QUI' }, { n: 7, d: 'SEX' }]
  return <div className="page-enter page-stack"><section className="section-heading"><div><span className="kicker">AGOSTO DE 2026</span><h2>Agenda</h2><p>Consultas online e presenciais organizadas por dia.</p></div><button className="primary"><Plus size={17} />Nova consulta</button></section>
    <section className="calendar-shell panel"><div className="week-head"><button className="icon-button"><ArrowLeft size={18}/></button>{week.map(d => <button key={d.n} onClick={() => setDay(d.n)} className={day === d.n ? 'selected' : ''}><small>{d.d}</small><b>{d.n}</b>{d.n === 5 && <i/>}</button>)}<button className="icon-button"><ArrowRight size={18}/></button></div>
      <div className="calendar-body"><div className="hours">{['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'].map(h => <span key={h}>{h}</span>)}</div><div className="schedule-column">{day === 5 ? appointments.map((a,i)=><button key={a.time} className={`calendar-event ${a.tone}`} style={{top:`${22+i*86}px`}}><b>{a.time} · {a.patient}</b><small>{a.type} · {a.mode}</small></button>) : <div className="empty-day"><CalendarDays size={28}/><b>Agenda livre</b><small>Nenhuma consulta nesse dia.</small></div>}</div></div>
    </section></div>
}

function DietsPage() {
  const [meals, setMeals] = usePersistedState('crm-meals-editor', mealsSeed)
  const total = useMemo(() => meals.reduce((acc, m) => ({ kcal: acc.kcal + Number(m.kcal), protein: acc.protein + Number(m.protein) }), { kcal: 0, protein: 0 }), [meals])
  const addMeal = () => setMeals([...meals, { id: Date.now(), time: '21:30', name: 'Ceia', kcal: 190, protein: 14, items: 'Iogurte proteico e canela' }])
  return <div className="page-enter page-stack"><section className="section-heading"><div><span className="kicker">PLANO ALIMENTAR</span><h2>Dieta de Ana Martins</h2><p>Estrutura diária com cálculo nutricional automático.</p></div><div className="action-pair"><button className="secondary"><FileText size={17}/>Gerar PDF</button><button className="primary">Salvar plano</button></div></section>
    <section className="macro-strip"><div><small>ENERGIA</small><strong>{total.kcal}</strong><span>kcal / 2.100</span></div><div><small>PROTEÍNAS</small><strong>{total.protein}g</strong><span>meta 140g</span></div><div><small>CARBOIDRATOS</small><strong>226g</strong><span>48% do total</span></div><div><small>GORDURAS</small><strong>62g</strong><span>29% do total</span></div><div className="macro-visual"><i style={{width:`${Math.min(100,total.kcal/21)}%`}}/><span>{Math.round(total.kcal/21)}% da meta</span></div></section>
    <section className="meal-editor"><div className="meal-list">{meals.map((m,index)=><article className="meal-row" key={m.id}><div className="meal-order"><span>{String(index+1).padStart(2,'0')}</span><i/></div><div className="meal-time"><Clock3 size={15}/><input value={m.time} onChange={e=>setMeals(meals.map(x=>x.id===m.id?{...x,time:e.target.value}:x))}/></div><div className="meal-content"><input className="meal-name" value={m.name} onChange={e=>setMeals(meals.map(x=>x.id===m.id?{...x,name:e.target.value}:x))}/><p>{m.items}</p><button className="text-button"><Plus size={14}/>Adicionar alimento</button></div><div className="meal-numbers"><b>{m.kcal} kcal</b><small>{m.protein}g proteína</small></div><button className="icon-button" onClick={()=>setMeals(meals.filter(x=>x.id!==m.id))}><X size={17}/></button></article>)}<button className="add-meal" onClick={addMeal}><Plus size={18}/>Adicionar refeição</button></div>
      <aside className="food-search panel"><span className="kicker">BANCO DE ALIMENTOS</span><h3>Adicionar ao plano</h3><label className="search-field"><Search size={16}/><input placeholder="Buscar alimento..."/></label><p className="food-caption">USADOS RECENTEMENTE</p>{['Ovo de galinha, cozido','Arroz integral, cozido','Peito de frango, grelhado','Banana prata'].map((f,i)=><button className="food-item" key={f}><div><b>{f}</b><small>{[146,124,159,98][i]} kcal · 100 g</small></div><Plus size={16}/></button>)}</aside>
    </section></div>
}

function FinancePage() {
  return <div className="page-enter page-stack"><section className="section-heading"><div><span className="kicker">GESTÃO FINANCEIRA</span><h2>Financeiro</h2><p>Receitas, planos e vencimentos do consultório.</p></div><button className="primary"><Plus size={17}/>Registrar pagamento</button></section>
    <section className="finance-hero"><div><span>RECEITA EM AGOSTO</span><strong>{currency(8420)}</strong><p><TrendingUp size={15}/>12% acima do mês anterior</p></div><div className="mini-bars">{[48,62,54,78,66,88,73,92,82,100,86,94].map((h,i)=><i key={i} style={{height:`${h}%`}} className={i===9?'peak':''}/>)}</div><div className="finance-side"><span>A RECEBER</span><b>{currency(2340)}</b><small>nos próximos 30 dias</small></div></section>
    <section className="finance-grid"><article className="panel"><div className="panel-head"><div><span className="kicker">MOVIMENTAÇÕES</span><h3>Pagamentos recentes</h3></div><button className="text-button">Ver todos <ArrowRight size={14}/></button></div><div className="payment-list">{patientsSeed.slice(0,4).map((p,i)=><div key={p.id}><span className="avatar" style={{background:p.color}}>{p.initials}</span><div><b>{p.name}</b><small>{p.plan} · {i===2?'Pix':'Cartão'}</small></div><strong>{currency([690,1190,249,1890][i])}</strong><span className={i===2?'payment pending':'payment paid'}>{i===2?'Pendente':'Pago'}</span></div>)}</div></article><aside className="panel plans-panel"><span className="kicker">PLANOS ATIVOS</span><h3>Distribuição</h3>{[['Mensal',6,25],['Trimestral',9,38],['Semestral',5,21],['Anual',4,16]].map(([n,q,p])=><div className="plan-line" key={n}><div><b>{n}</b><span>{q} pacientes</span></div><i><em style={{width:`${p}%`}}/></i><strong>{p}%</strong></div>)}</aside></section>
  </div>
}

function MessagesPage() {
  const [active, setActive] = useState(patientsSeed[0])
  const [text, setText] = useState('')
  const [messages, setMessages] = usePersistedState('crm-chat', [
    { id: 1, who: 'them', text: 'Bom dia, Marina! Consegui seguir o plano ontem inteiro.', time: '08:42' },
    { id: 2, who: 'me', text: 'Ótimo, Ana. Vi seu registro — o almoço ficou bem equilibrado.', time: '08:47' },
    { id: 3, who: 'them', text: 'Hoje vou precisar almoçar fora. Qual substituição você recomenda?', time: '08:49' },
  ])
  const send = e => { e.preventDefault(); if (!text.trim()) return; setMessages([...messages, {id: Date.now(), who:'me', text:text.trim(), time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}]); setText('') }
  return <div className="messages-page page-enter"><aside className="chat-list"><div><span className="kicker">CONVERSAS</span><h2>Mensagens</h2></div><label className="search-field"><Search size={16}/><input placeholder="Buscar conversa..."/></label>{patientsSeed.map((p,i)=><button key={p.id} onClick={()=>setActive(p)} className={active.id===p.id?'selected':''}><span className="avatar" style={{background:p.color}}>{p.initials}</span><div><b>{p.name}</b><small>{i===0?'Qual substituição você reco...':'Tudo certo, obrigada!'}</small></div><time>{i===0?'08:49':'Ontem'}</time>{i===0&&<i/>}</button>)}</aside><section className="chat-window"><header><span className="avatar" style={{background:active.color}}>{active.initials}</span><div><b>{active.name}</b><small><i/> Online agora</small></div><button className="secondary"><Stethoscope size={16}/>Abrir prontuário</button></header><div className="chat-body"><span className="date-separator">HOJE</span>{messages.map(m=><div key={m.id} className={`bubble ${m.who}`}><p>{m.text}</p><small>{m.time}{m.who==='me'&&<Check size={13}/>}</small></div>)}</div><form className="chat-compose" onSubmit={send}><button type="button" className="icon-button"><Plus size={19}/></button><input value={text} onChange={e=>setText(e.target.value)} placeholder="Escreva uma mensagem..."/><button className="send-button" aria-label="Enviar"><Send size={18}/></button></form></section></div>
}

function PatientApp({ close }) {
  const [tab, setTab] = useState('home')
  const [water, setWater] = usePersistedState('crm-water', 5)
  const [meals, setMeals] = usePersistedState('crm-patient-meals', mealsSeed)
  const [dark, setDark] = useState(false)
  const toggleMeal = id => setMeals(meals.map(m => m.id === id ? { ...m, done: !m.done } : m))
  return <div className="patient-preview-layer"><div className="preview-toolbar"><div><button className="icon-button" onClick={close}><X size={20}/></button><span><b>Prévia do paciente</b><small>Ana Martins</small></span></div><p>Esta é a experiência que seu paciente verá.</p><button className="secondary" onClick={()=>setDark(!dark)}>{dark?<Sun size={16}/>:<Moon size={16}/>} {dark?'Tema claro':'Tema escuro'}</button></div><div className={`phone ${dark?'dark-mode':''}`}><div className="phone-status"><span>09:41</span><div><i/><i/><b/></div></div><main className="phone-content">
    {tab==='home'&&<><header className="mobile-greeting"><div><small>QUARTA, 05 DE AGOSTO</small><h2>Bom dia, Ana.</h2></div><button><Bell size={19}/><i/></button></header><section className="goal-card"><div><small>SEU PROGRESSO</small><strong>−5,2 <em>kg</em></strong><p>Você percorreu 64% do seu objetivo</p></div><div className="goal-ring"><span>64%</span></div></section><section className="today-section"><div className="mobile-section-head"><div><small>HOJE</small><h3>Seu ritmo</h3></div><span>{meals.filter(m=>m.done).length}/{meals.length} refeições</span></div><div className="mobile-meals">{meals.slice(0,4).map(m=><button key={m.id} onClick={()=>toggleMeal(m.id)} className={m.done?'done':''}><span className="check-circle">{m.done&&<Check size={14}/>}</span><time>{m.time}</time><div><b>{m.name}</b><small>{m.kcal} kcal</small></div><ChevronRight size={16}/></button>)}</div></section><section className="water-card"><div><Droplets size={19}/><div><b>Água</b><small>{water*250} ml de 2.000 ml</small></div></div><div className="water-drops">{Array.from({length:8}).map((_,i)=><i key={i} className={i<water?'filled':''}/>)}</div><button onClick={()=>setWater(water>=8?0:water+1)}><Plus size={16}/>250 ml</button></section><section className="next-mobile"><CalendarDays size={20}/><div><small>PRÓXIMA CONSULTA</small><b>Hoje, 14:30</b><span>Presencial · 50 minutos</span></div><ChevronRight size={18}/></section></>}
    {tab==='diet'&&<><header className="mobile-page-title"><div><small>PLANO ATUAL</small><h2>Minha dieta</h2></div><button><MoreHorizontal size={20}/></button></header><p className="mobile-intro">Toque em uma refeição para marcar como concluída.</p><div className="diet-mobile-list">{meals.map(m=><button key={m.id} onClick={()=>toggleMeal(m.id)} className={m.done?'done':''}><div className="meal-mobile-time"><time>{m.time}</time><span>{m.done?<CheckCircle2 size={19}/>:<span/>}</span></div><div><h3>{m.name}</h3><p>{m.items}</p><small>{m.kcal} kcal · {m.protein}g proteína</small></div></button>)}</div></>}
    {tab==='progress'&&<><header className="mobile-page-title"><div><small>ACOMPANHAMENTO</small><h2>Minha evolução</h2></div></header><section className="mobile-weight"><small>PESO ATUAL</small><strong>68,4 <em>kg</em></strong><span>−5,2 kg desde o início</span><div className="mobile-chart"><svg viewBox="0 0 300 120" preserveAspectRatio="none"><path d="M0 18 C35 20 60 42 92 44 S150 61 180 67 S238 79 300 98" fill="none" stroke="currentColor" strokeWidth="4"/><circle cx="300" cy="98" r="6" fill="#e76b4a"/></svg></div><div className="chart-labels"><span>MAR</span><span>ABR</span><span>MAI</span><span>JUN</span><span>JUL</span><span>AGO</span></div></section><div className="mobile-metrics"><div><small>GORDURA</small><b>24,8%</b><span>−3,1%</span></div><div><small>MASSA MAGRA</small><b>51,4 kg</b><span>+0,8 kg</span></div></div><section className="encouragement"><Leaf size={21}/><div><b>Consistência que aparece.</b><p>Você registrou 18 refeições seguidas. Continue nesse ritmo.</p></div></section></>}
    {tab==='profile'&&<><header className="mobile-page-title"><div><small>SUA CONTA</small><h2>Perfil</h2></div></header><div className="mobile-profile"><span className="avatar xl" style={{background:'#DCE9C8'}}>AM</span><h3>Ana Martins</h3><p>Plano Trimestral · ativo</p></div><div className="profile-menu"><button><Users size={18}/><span>Dados pessoais</span><ChevronRight size={17}/></button><button><Bell size={18}/><span>Notificações</span><ChevronRight size={17}/></button><button><Wallet size={18}/><span>Pagamentos</span><ChevronRight size={17}/></button><button><FileText size={18}/><span>Documentos</span><ChevronRight size={17}/></button><button><LogOut size={18}/><span>Sair</span></button></div></>}
  </main><nav className="phone-nav">{[{id:'home',l:'Início',I:Home},{id:'diet',l:'Dieta',I:Utensils},{id:'progress',l:'Evolução',I:Activity},{id:'profile',l:'Perfil',I:Users}].map(({id,l,I})=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><I size={20}/><span>{l}</span></button>)}</nav></div></div>
}

function NewPatientModal({ close, addPatient }) {
  const [form, setForm] = useState({ name:'', goal:'Emagrecimento', plan:'Mensal' })
  const submit = e => { e.preventDefault(); if(!form.name.trim()) return; const initials=form.name.split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase(); addPatient({...form,id:Date.now(),initials,next:'A agendar',progress:0,adherence:0,status:'Ativo',color:'#CBE2DE'}); close() }
  return <div className="modal-layer"><button className="scrim" onClick={close} aria-label="Fechar"/><form className="modal" onSubmit={submit}><div className="modal-head"><div><span className="kicker">NOVO PRONTUÁRIO</span><h2>Adicionar paciente</h2></div><button type="button" className="icon-button" onClick={close}><X size={20}/></button></div><p>Comece pelo essencial. Os dados clínicos podem ser preenchidos depois.</p><label><span>Nome completo</span><input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex.: Camila Rodrigues" required/></label><div className="form-row"><label><span>Objetivo principal</span><select value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})}><option>Emagrecimento</option><option>Hipertrofia</option><option>Reeducação alimentar</option><option>Performance</option><option>Saúde intestinal</option></select></label><label><span>Plano</span><select value={form.plan} onChange={e=>setForm({...form,plan:e.target.value})}><option>Mensal</option><option>Trimestral</option><option>Semestral</option><option>Anual</option></select></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={close}>Cancelar</button><button className="primary">Criar prontuário <ArrowRight size={16}/></button></div></form></div>
}

const pageMeta = {
  dashboard: ['Visão geral', 'Indicadores e prioridades do consultório'],
  patients: ['Pacientes', 'Gestão da carteira clínica'],
  agenda: ['Agenda', 'Consultas e compromissos'],
  diets: ['Planos alimentares', 'Editor e cálculo nutricional'],
  finance: ['Financeiro', 'Receitas e vencimentos'],
  messages: ['Mensagens', 'Comunicação com pacientes'],
}

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [modal, setModal] = useState(false)
  const [patientPreview, setPatientPreview] = useState(false)
  const [patients, setPatients] = usePersistedState('crm-patients', patientsSeed)
  const [installEvent, setInstallEvent] = useState(null)
  useEffect(() => { const handler=e=>{e.preventDefault();setInstallEvent(e)}; window.addEventListener('beforeinstallprompt',handler); return()=>window.removeEventListener('beforeinstallprompt',handler) },[])
  const install = async () => { if(!installEvent)return; await installEvent.prompt(); setInstallEvent(null) }
  const content = {
    dashboard: <Dashboard goTo={setActive}/>,
    patients: <PatientsPage patients={patients} setPatients={setPatients} onAdd={()=>setModal(true)}/>,
    agenda: <AgendaPage/>, diets: <DietsPage/>, finance: <FinancePage/>, messages: <MessagesPage/>
  }[active]
  return <div className="app-shell">
    <Sidebar active={active} setActive={setActive} open={menuOpen} close={()=>setMenuOpen(false)}/>
    <main className="workspace"><Header title={pageMeta[active][0]} subtitle={pageMeta[active][1]} onMenu={()=>setMenuOpen(true)} onAdd={()=>setModal(true)} onPatientView={()=>setPatientPreview(true)} installEvent={installEvent} install={install}/><div className="content-area">{content}</div></main>
    {modal&&<NewPatientModal close={()=>setModal(false)} addPatient={p=>setPatients([...patients,p])}/>} {patientPreview&&<PatientApp close={()=>setPatientPreview(false)}/>} 
  </div>
}
