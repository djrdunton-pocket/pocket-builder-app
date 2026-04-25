import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const USERS = [
  { id: 'u1', name: 'James Hartley',    email: 'admin@pocketbuilder.co',    role: 'admin'    },
  { id: 'u2', name: 'Sarah Mitchell',   email: 'builder@pocketbuilder.co',  role: 'builder'  },
  { id: 'u3', name: 'Mr & Mrs Johnson', email: 'client@pocketbuilder.co',   role: 'client'   },
  { id: 'u4', name: 'Dave Reynolds',    email: 'supplier@pocketbuilder.co', role: 'supplier' },
]

const DEMO_PROJECTS = [
  {
    id: 'proj-1',
    name: '4 Bed Detached New Build',
    address: '12 Maple Drive, Guildford, Surrey',
    startDate: '2025-05-01',
    endDate: '2025-11-30',
    budget: '285000',
    clientId: 'u3',
    builderId: 'u2',
    supplierIds: ['u4'],
    changeRequests: [
      { id: 'cr1', text: 'Add bi-fold doors to rear elevation', status: 'Pending', by: 'Mr & Mrs Johnson', date: '2025-04-20' }
    ],
    phases: [
      { id: 'ph1', name: 'Groundworks',  start: '2025-05-01', end: '2025-05-28', status: 'Complete',    milestones: [] },
      { id: 'ph2', name: 'Structure',    start: '2025-06-01', end: '2025-07-31', status: 'In Progress', milestones: [
        { id: 'ms1', text: 'Structural engineer sign-off needed', resolved: false, replies: [] }
      ]},
      { id: 'ph3', name: 'Roofing',      start: '2025-08-01', end: '2025-08-20', status: 'Not Started', milestones: [] },
      { id: 'ph4', name: 'First Fix',    start: '2025-09-01', end: '2025-09-30', status: 'Not Started', milestones: [] },
      { id: 'ph5', name: 'Second Fix',   start: '2025-10-01', end: '2025-10-31', status: 'Not Started', milestones: [] },
      { id: 'ph6', name: 'Finishing',    start: '2025-11-01', end: '2025-11-28', status: 'Not Started', milestones: [] },
    ],
    unavailable: [
      { id: 'un1', label: 'Builder summer shutdown', start: '2025-08-04', end: '2025-08-08', party: 'builder' }
    ],
    messages: {
      client: [
        { id: 'm1', from: 'builder', fromName: 'Sarah Mitchell',  text: 'Site start confirmed for Monday 5th May, 7:30am.', ts: '2025-04-28T09:14:00', read: true },
        { id: 'm2', from: 'client',  fromName: 'Mr Johnson',      text: 'Great — will there be parking for the team?',     ts: '2025-04-28T10:02:00', read: true },
        { id: 'm3', from: 'builder', fromName: 'Sarah Mitchell',  text: "Yes, use the front drive. I'll send the site rules today.", ts: '2025-04-28T10:15:00', read: false },
      ],
      supplier: [
        { id: 's1', from: 'builder', fromName: 'Sarah Mitchell', text: 'Can you quote for the groundworks materials?', ts: '2025-04-27T09:00:00', read: true },
        { id: 's2', from: 'supplier', fromName: 'Dave Reynolds', text: "I'll have a quote over to you by Friday.", ts: '2025-04-27T11:30:00', read: true },
      ]
    },
    documents: [
      { id: 'd1', name: 'Planning Permission.pdf',         uploadedBy: 'u2', uploaderName: 'Sarah Mitchell',   uploaderRole: 'builder', date: '2025-01-15', size: '2.4 MB', visibleTo: ['client','supplier'] },
      { id: 'd2', name: 'Architectural Drawings Rev C.pdf',uploadedBy: 'u2', uploaderName: 'Sarah Mitchell',   uploaderRole: 'builder', date: '2025-02-20', size: '8.7 MB', visibleTo: ['client'] },
      { id: 'd3', name: 'Structural Calculations.pdf',     uploadedBy: 'u3', uploaderName: 'Mr & Mrs Johnson', uploaderRole: 'client',  date: '2025-03-05', size: '3.2 MB', visibleTo: ['client','supplier'] },
    ],
    photos: [
      { id: 'ph_1', caption: 'Foundation trenches dug', date: '2025-05-10', uploadedBy: 'u2', visibleTo: ['client','supplier'], url: null },
      { id: 'ph_2', caption: 'Concrete pour complete',  date: '2025-05-22', uploadedBy: 'u2', visibleTo: ['client'],           url: null },
    ],
    invoices: [
      { id: 'inv1', number: 'INV-001', description: 'Groundworks — stage payment', amount: 14500, vat: 2900, dueDate: '2025-06-01', status: 'Paid',    paidDate: '2025-05-30' },
      { id: 'inv2', number: 'INV-002', description: 'Structure — stage payment 1', amount: 28000, vat: 5600, dueDate: '2025-07-01', status: 'Unpaid',  paidDate: null },
      { id: 'inv3', number: 'INV-003', description: 'Structure — stage payment 2', amount: 28000, vat: 5600, dueDate: '2025-08-01', status: 'Overdue', paidDate: null },
    ],
    supplierInvoices: [
      { id: 'si1', supplier: 'Reynolds Materials', description: 'Groundworks materials', amount: 8200,  date: '2025-05-15', status: 'Paid' },
      { id: 'si2', supplier: 'Reynolds Materials', description: 'Concrete & aggregate',  amount: 4100,  date: '2025-05-22', status: 'Paid' },
      { id: 'si3', supplier: 'Reynolds Materials', description: 'Structural steel',      amount: 12400, date: '2025-07-10', status: 'Unpaid' },
    ],
    labourCosts: [
      { id: 'lc1', description: 'Groundworks team — 3 weeks', amount: 9600,  date: '2025-05-28' },
      { id: 'lc2', description: 'Bricklayers — 4 weeks',      amount: 14400, date: '2025-07-31' },
    ],
  },
  {
    id: 'proj-2',
    name: 'Kitchen Extension',
    address: '8 Oak Avenue, Woking, Surrey',
    startDate: '2025-06-01',
    endDate: '2025-09-30',
    budget: '85000',
    clientId: null,
    builderId: 'u2',
    supplierIds: [],
    changeRequests: [],
    phases: [
      { id: 'ph7', name: 'Groundworks',  start: '2025-06-01', end: '2025-06-21', status: 'Not Started', milestones: [] },
      { id: 'ph8', name: 'Structure',    start: '2025-06-22', end: '2025-07-31', status: 'Not Started', milestones: [] },
      { id: 'ph9', name: 'Finishing',    start: '2025-08-01', end: '2025-09-30', status: 'Not Started', milestones: [] },
    ],
    unavailable: [],
    messages: { client: [], supplier: [] },
    documents: [],
    photos: [],
    invoices: [],
    supplierInvoices: [],
    labourCosts: [],
  }
]

export function AppProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [page, setPage]         = useState('marketing')
  const [projects, setProjects] = useState(DEMO_PROJECTS)
  const [activeProjectId, setActiveProjectId] = useState('proj-1')
  const [activeTab, setActiveTab] = useState('home')

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0]

  const login = (email) => {
    const u = USERS.find(u => u.email === email)
    if (!u) return false
    setUser(u)
    setPage('app')
    return true
  }
  const logout = () => { setUser(null); setPage('marketing') }

  const updateProject = (id, updates) =>
    setProjects(ps => ps.map(p => p.id === id ? { ...p, ...updates } : p))

  const updateActiveProject = (updates) => updateProject(activeProjectId, updates)

  // Phases
  const addPhase = (phase) => updateActiveProject({
    phases: [...activeProject.phases, { ...phase, id: 'ph_' + Date.now(), milestones: [] }]
  })
  const updatePhase = (phId, updates) => updateActiveProject({
    phases: activeProject.phases.map(ph => ph.id === phId ? { ...ph, ...updates } : ph)
  })
  const deletePhase = (phId) => updateActiveProject({
    phases: activeProject.phases.filter(ph => ph.id !== phId)
  })

  // Milestones
  const addMilestone = (phId, text) => updateActiveProject({
    phases: activeProject.phases.map(ph => ph.id === phId
      ? { ...ph, milestones: [...ph.milestones, { id: 'ms_' + Date.now(), text, resolved: false, replies: [] }] }
      : ph)
  })
  const replyMilestone = (phId, msId, text) => updateActiveProject({
    phases: activeProject.phases.map(ph => ph.id === phId
      ? { ...ph, milestones: ph.milestones.map(ms => ms.id === msId
          ? { ...ms, replies: [...ms.replies, { by: user.name, text, ts: new Date().toISOString() }] }
          : ms) }
      : ph)
  })
  const resolveMilestone = (phId, msId) => updateActiveProject({
    phases: activeProject.phases.map(ph => ph.id === phId
      ? { ...ph, milestones: ph.milestones.map(ms => ms.id === msId ? { ...ms, resolved: true } : ms) }
      : ph)
  })

  // Unavailable
  const addUnavailable = (entry) => updateActiveProject({
    unavailable: [...activeProject.unavailable, { ...entry, id: 'un_' + Date.now() }]
  })
  const deleteUnavailable = (id) => updateActiveProject({
    unavailable: activeProject.unavailable.filter(u => u.id !== id)
  })

  // Messages
  const sendMessage = (thread, text) => {
    const role = user.role
    const newMsg = { id: 'm_' + Date.now(), from: role, fromName: user.name, text, ts: new Date().toISOString(), read: false }
    updateActiveProject({
      messages: { ...activeProject.messages, [thread]: [...activeProject.messages[thread], newMsg] }
    })
  }

  // Documents
  const addDocument = (doc) => updateActiveProject({
    documents: [...activeProject.documents, { ...doc, id: 'd_' + Date.now(), date: new Date().toISOString().slice(0,10) }]
  })
  const deleteDocument = (id) => updateActiveProject({
    documents: activeProject.documents.filter(d => d.id !== id)
  })

  // Photos
  const addPhoto = (photo) => updateActiveProject({
    photos: [...activeProject.photos, { ...photo, id: 'ph_' + Date.now(), date: new Date().toISOString().slice(0,10), uploadedBy: user.id }]
  })
  const deletePhoto = (id) => updateActiveProject({
    photos: activeProject.photos.filter(p => p.id !== id)
  })

  // Invoices
  const addInvoice = (inv) => updateActiveProject({
    invoices: [...activeProject.invoices, { ...inv, id: 'inv_' + Date.now() }]
  })
  const updateInvoice = (id, updates) => updateActiveProject({
    invoices: activeProject.invoices.map(i => i.id === id ? { ...i, ...updates } : i)
  })
  const deleteInvoice = (id) => updateActiveProject({
    invoices: activeProject.invoices.filter(i => i.id !== id)
  })

  // Supplier invoices
  const addSupplierInvoice = (inv) => updateActiveProject({
    supplierInvoices: [...activeProject.supplierInvoices, { ...inv, id: 'si_' + Date.now() }]
  })
  const deleteSupplierInvoice = (id) => updateActiveProject({
    supplierInvoices: activeProject.supplierInvoices.filter(i => i.id !== id)
  })

  // Labour costs
  const addLabourCost = (cost) => updateActiveProject({
    labourCosts: [...activeProject.labourCosts, { ...cost, id: 'lc_' + Date.now() }]
  })
  const deleteLabourCost = (id) => updateActiveProject({
    labourCosts: activeProject.labourCosts.filter(c => c.id !== id)
  })

  // Change requests
  const addChangeRequest = (text) => updateActiveProject({
    changeRequests: [...activeProject.changeRequests, { id: 'cr_' + Date.now(), text, status: 'Pending', by: user.name, date: new Date().toISOString().slice(0,10) }]
  })
  const updateChangeRequest = (id, status) => updateActiveProject({
    changeRequests: activeProject.changeRequests.map(c => c.id === id ? { ...c, status } : c)
  })

  // Add new project
  const addProject = (proj) => {
    const id = 'proj_' + Date.now()
    const newProj = { ...proj, id, supplierIds: [], changeRequests: [], phases: [], unavailable: [], messages: { client: [], supplier: [] }, documents: [], photos: [], invoices: [], supplierInvoices: [], labourCosts: [] }
    setProjects(ps => [...ps, newProj])
    setActiveProjectId(id)
  }

  // Unread counts
  const unreadClient   = activeProject.messages.client.filter(m => user?.role === 'builder' ? m.from === 'client' && !m.read : m.from === 'builder' && !m.read).length
  const unreadSupplier = activeProject.messages.supplier.filter(m => user?.role === 'builder' ? m.from === 'supplier' && !m.read : m.from === 'builder' && !m.read).length
  const totalUnread    = unreadClient + unreadSupplier

  return (
    <Ctx.Provider value={{
      user, login, logout, page, setPage,
      projects, activeProject, activeProjectId, setActiveProjectId,
      activeTab, setActiveTab,
      updateActiveProject,
      addPhase, updatePhase, deletePhase,
      addMilestone, replyMilestone, resolveMilestone,
      addUnavailable, deleteUnavailable,
      sendMessage,
      addDocument, deleteDocument,
      addPhoto, deletePhoto,
      addInvoice, updateInvoice, deleteInvoice,
      addSupplierInvoice, deleteSupplierInvoice,
      addLabourCost, deleteLabourCost,
      addChangeRequest, updateChangeRequest,
      addProject,
      unreadClient, unreadSupplier, totalUnread,
    }}>
      {children}
    </Ctx.Provider>
  )
}