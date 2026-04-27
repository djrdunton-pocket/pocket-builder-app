import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bdmimbwkvdwahbkxkasf.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkbWltYndrdmR3YWhia3hrYXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTc1ODIsImV4cCI6MjA5MjI3MzU4Mn0.Y7K0JOmlgZrQubq24F8KnuOcc1uZBHr5eWjGtHJINNU'
const RESEND_KEY = 're_CgvXFk51_5RGsU55w6v2XVp67Y7iZfdXA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const INITIAL_PROJECT = {
  id: 'proj-1',
  name: '4 Bed Detached New Build',
  address: '12 Maple Drive, Guildford, Surrey',
  startDate: '2025-05-01',
  endDate: '2025-11-30',
  budget: '285000',
  status: 'active',
  clientId: null,
  builderId: null,
  supplierIds: [],
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
      { id: 'm1', from: 'builder', fromName: 'Sarah Mitchell', text: 'Site start confirmed for Monday 5th May, 7:30am.', ts: '2025-04-28T09:14:00', read: true },
      { id: 'm2', from: 'client',  fromName: 'Mr Johnson',     text: 'Great — will there be parking for the team?',    ts: '2025-04-28T10:02:00', read: true },
    ],
    supplier: [
      { id: 's1', from: 'builder', fromName: 'Sarah Mitchell', text: 'Can you quote for the groundworks materials?', ts: '2025-04-27T09:00:00', read: true },
    ]
  },
  documents: [
    { id: 'd1', name: 'Planning Permission.pdf', uploadedBy: 'u2', uploaderName: 'Sarah Mitchell', uploaderRole: 'builder', date: '2025-01-15', size: '2.4 MB', visibleTo: ['client','supplier'] },
    { id: 'd2', name: 'Architectural Drawings.pdf', uploadedBy: 'u2', uploaderName: 'Sarah Mitchell', uploaderRole: 'builder', date: '2025-02-20', size: '8.7 MB', visibleTo: ['client'] },
  ],
  photos: [
    { id: 'ph_1', caption: 'Foundation trenches dug', date: '2025-05-10', uploadedBy: 'u2', visibleTo: ['client','supplier'], url: null },
  ],
  invoices: [
    { id: 'inv1', number: 'INV-001', description: 'Groundworks — stage payment', amount: 14500, vat: 2900, dueDate: '2025-06-01', status: 'Paid', paidDate: '2025-05-30' },
    { id: 'inv2', number: 'INV-002', description: 'Structure — stage payment 1', amount: 28000, vat: 5600, dueDate: '2025-07-01', status: 'Unpaid', paidDate: null },
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
  suppliers: [],
}

export function AppProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [profile, setProfile]     = useState(null)
  const [page, setPage]           = useState('marketing')
  const [loading, setLoading]     = useState(true)
  const [projects, setProjects]   = useState([INITIAL_PROJECT])
  const [activeProjectId, setActiveProjectId] = useState('proj-1')
  const [activeTab, setActiveTab] = useState('home')

  const activeProject = projects.find(p => p.id === activeProjectId) ?? projects[0] ?? INITIAL_PROJECT

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setPage('marketing')
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data)
      if (data.status === 'approved') setPage('app')
      else setPage('pending')
    }
    setLoading(false)
  }

  const signUp = async ({ email, password, name, role, company }) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, role, company } }
    })
    if (error) return { success: false, error: error.message }
    if (role === 'builder') await sendAdminNotification({ name, email, company })
    return { success: true }
  }

  const signIn = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setPage('marketing')
  }

  const sendAdminNotification = async ({ name, email, company }) => {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Pocket Builder <noreply@pocketbuilder.co>',
          to: ['djrdunton@gmail.com'],
          subject: 'New builder sign-up — approval needed',
          html: `<h2>New builder sign-up</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Company:</strong> ${company || 'Not provided'}</p><p>Log in to approve this account.</p><a href="https://pocketbuilder.co" style="background:#00c9a7;color:#0a0f1e;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:12px">Open Pocket Builder</a>`
        })
      })
    } catch (e) { console.log('Admin notification failed:', e) }
  }

  const sendSupportNotification = async ({ fromName, fromEmail, message }) => {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Pocket Builder <noreply@pocketbuilder.co>',
          to: ['djrdunton@gmail.com'],
          subject: `Support message from ${fromName}`,
          html: `<h2>Support message</h2><p><strong>From:</strong> ${fromName} (${fromEmail})</p><p><strong>Message:</strong></p><blockquote>${message}</blockquote><a href="https://pocketbuilder.co" style="background:#00c9a7;color:#0a0f1e;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:12px">Open Pocket Builder</a>`
        })
      })
    } catch (e) { console.log('Support email failed:', e) }
  }

  const updateProject = (id, updates) =>
    setProjects(ps => ps.map(p => p.id === id ? { ...p, ...updates } : p))

  const updateActiveProject = (updates) => updateProject(activeProjectId, updates)

  const addPhase = (phase) => updateActiveProject({
    phases: [...activeProject.phases, { ...phase, id: 'ph_' + Date.now(), milestones: [] }]
  })
  const updatePhase = (phId, updates) => updateActiveProject({
    phases: activeProject.phases.map(ph => ph.id === phId ? { ...ph, ...updates } : ph)
  })
  const deletePhase = (phId) => updateActiveProject({
    phases: activeProject.phases.filter(ph => ph.id !== phId)
  })
  const addMilestone = (phId, text) => updateActiveProject({
    phases: activeProject.phases.map(ph => ph.id === phId
      ? { ...ph, milestones: [...ph.milestones, { id: 'ms_' + Date.now(), text, resolved: false, replies: [] }] }
      : ph)
  })
  const replyMilestone = (phId, msId, text) => updateActiveProject({
    phases: activeProject.phases.map(ph => ph.id === phId
      ? { ...ph, milestones: ph.milestones.map(ms => ms.id === msId
          ? { ...ms, replies: [...ms.replies, { by: profile?.name || user?.email, text, ts: new Date().toISOString() }] }
          : ms) }
      : ph)
  })
  const resolveMilestone = (phId, msId) => updateActiveProject({
    phases: activeProject.phases.map(ph => ph.id === phId
      ? { ...ph, milestones: ph.milestones.map(ms => ms.id === msId ? { ...ms, resolved: true } : ms) }
      : ph)
  })
  const addUnavailable = (entry) => updateActiveProject({
    unavailable: [...activeProject.unavailable, { ...entry, id: 'un_' + Date.now() }]
  })
  const deleteUnavailable = (id) => updateActiveProject({
    unavailable: activeProject.unavailable.filter(u => u.id !== id)
  })
  const sendMessage = (thread, text) => {
    const role = profile?.role || 'builder'
    const newMsg = { id: 'm_' + Date.now(), from: role, fromName: profile?.name || user?.email, text, ts: new Date().toISOString(), read: false }
    updateActiveProject({
      messages: { ...activeProject.messages, [thread]: [...(activeProject.messages[thread] || []), newMsg] }
    })
  }
  const addDocument = (doc) => updateActiveProject({
    documents: [...activeProject.documents, { ...doc, id: 'd_' + Date.now(), date: new Date().toISOString().slice(0,10) }]
  })
  const deleteDocument = (id) => updateActiveProject({
    documents: activeProject.documents.filter(d => d.id !== id)
  })
  const addPhoto = (photo) => updateActiveProject({
    photos: [...activeProject.photos, { ...photo, id: 'ph_' + Date.now(), date: new Date().toISOString().slice(0,10), uploadedBy: user?.id }]
  })
  const deletePhoto = (id) => updateActiveProject({
    photos: activeProject.photos.filter(p => p.id !== id)
  })
  const addInvoice = (inv) => updateActiveProject({
    invoices: [...activeProject.invoices, { ...inv, id: 'inv_' + Date.now() }]
  })
  const updateInvoice = (id, updates) => updateActiveProject({
    invoices: activeProject.invoices.map(i => i.id === id ? { ...i, ...updates } : i)
  })
  const deleteInvoice = (id) => updateActiveProject({
    invoices: activeProject.invoices.filter(i => i.id !== id)
  })
  const addSupplierInvoice = (inv) => updateActiveProject({
    supplierInvoices: [...activeProject.supplierInvoices, { ...inv, id: 'si_' + Date.now() }]
  })
  const deleteSupplierInvoice = (id) => updateActiveProject({
    supplierInvoices: activeProject.supplierInvoices.filter(i => i.id !== id)
  })
  const addLabourCost = (cost) => updateActiveProject({
    labourCosts: [...activeProject.labourCosts, { ...cost, id: 'lc_' + Date.now() }]
  })
  const deleteLabourCost = (id) => updateActiveProject({
    labourCosts: activeProject.labourCosts.filter(c => c.id !== id)
  })
  const addChangeRequest = (text) => updateActiveProject({
    changeRequests: [...activeProject.changeRequests, { id: 'cr_' + Date.now(), text, status: 'Pending', by: profile?.name || user?.email, date: new Date().toISOString().slice(0,10) }]
  })
  const updateChangeRequest = (id, status) => updateActiveProject({
    changeRequests: activeProject.changeRequests.map(c => c.id === id ? { ...c, status } : c)
  })
  const addProject = (proj) => {
    const id = 'proj_' + Date.now()
    const newProj = {
      ...proj, id, status: 'active', supplierIds: [], changeRequests: [],
      phases: [], unavailable: [], messages: { client: [], supplier: [] },
      documents: [], photos: [], invoices: [], supplierInvoices: [], labourCosts: [], suppliers: []
    }
    setProjects(ps => [...ps, newProj])
    setActiveProjectId(id)
  }
  const archiveProject = (id) => updateProject(id, { status: 'archived' })
  const reactivateProject = (id) => updateProject(id, { status: 'active' })

  const unreadClient   = (activeProject?.messages?.client || []).filter(m => profile?.role === 'builder' ? m.from === 'client' && !m.read : m.from === 'builder' && !m.read).length
  const unreadSupplier = (activeProject?.messages?.supplier || []).filter(m => profile?.role === 'builder' ? m.from === 'supplier' && !m.read : m.from === 'builder' && !m.read).length
  const totalUnread    = unreadClient + unreadSupplier

  return (
    <Ctx.Provider value={{
      user, profile, page, setPage, loading,
      signUp, signIn, logout,
      sendAdminNotification, sendSupportNotification,
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
      addProject, archiveProject, reactivateProject,
      unreadClient, unreadSupplier, totalUnread,
    }}>
      {children}
    </Ctx.Provider>
  )
}
