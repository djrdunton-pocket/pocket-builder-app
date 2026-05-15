import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bdmimbwkvdwahbkxkasf.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkbWltYndrdmR3YWhia3hrYXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTc1ODIsImV4cCI6MjA5MjI3MzU4Mn0.Y7K0JOmlgZrQubq24F8KnuOcc1uZBHr5eWjGtHJINNU'
const RESEND_KEY = 're_CgvXFk51_5RGsU55w6v2XVp67Y7iZfdXA'

// Pocket Builder v2.2
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [profile, setProfile]     = useState(null)
  const [page, setPage]           = useState('marketing')
  const [loading, setLoading]     = useState(true)
  const [projects, setProjects]   = useState([])
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [activeTab, setActiveTab] = useState('home')

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null

  // Auth state
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
        setProjects([])
        setPage('marketing')
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) { setPage('app'); setLoading(false); return }

      if (data) {
        setProfile(data)
        if (data.status === 'approved') {
          setPage('app')
          await fetchProjects(userId, data.role)
        } else {
          setPage('pending')
        }
      }
    } catch (e) {
      setPage('app')
    }
    setLoading(false)
  }

  const fetchProjects = async (userId, role) => {
    try {
      let query = supabase.from('projects').select('*')
      if (role === 'builder') query = query.eq('builder_id', userId)

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) { console.error('fetchProjects error:', error); return }
      if (!data || data.length === 0) return

      const projectIds = data.map(p => p.id)

      const [
        { data: phases },
        { data: invoices },
        { data: supplierInvoices },
        { data: labourCosts },
        { data: messages },
        { data: documents },
        { data: photos },
      ] = await Promise.all([
        supabase.from('phases').select('*').in('project_id', projectIds).order('sort_order'),
        supabase.from('invoices').select('*').in('project_id', projectIds),
        supabase.from('supplier_invoices').select('*').in('project_id', projectIds),
        supabase.from('labour_costs').select('*').in('project_id', projectIds),
        supabase.from('messages').select('*').in('project_id', projectIds),
        supabase.from('documents').select('*').in('project_id', projectIds),
        supabase.from('photos').select('*').in('project_id', projectIds),
      ])

      const mapped = data.map(p => ({
        ...mapProjectFromDB(p),
        phases: (phases || []).filter(ph => ph.project_id === p.id).map(ph => ({
          id: ph.id,
          name: ph.name,
          start: ph.start_date,
          end: ph.end_date,
          status: ph.status,
          milestones: [],
        })),
        invoices: (invoices || []).filter(i => i.project_id === p.id).map(i => ({
          id: i.id,
          number: i.number,
          description: i.description,
          amount: Number(i.amount) || 0,
          vat: Number(i.vat) || 0,
          dueDate: i.due_date,
          status: i.status,
          paidDate: i.paid_date,
        })),
        supplierInvoices: (supplierInvoices || []).filter(i => i.project_id === p.id).map(i => ({
          id: i.id,
          supplier: i.supplier,
          description: i.description,
          amount: Number(i.amount) || 0,
          date: i.date,
          status: i.status,
        })),
        labourCosts: (labourCosts || []).filter(c => c.project_id === p.id).map(c => ({
          id: c.id,
          description: c.description,
          amount: Number(c.amount) || 0,
          date: c.date,
        })),
        messages: {
          client: (messages || []).filter(m => m.project_id === p.id && m.thread === 'client').map(m => ({
            id: m.id,
            from: m.from_role,
            fromName: m.from_name,
            text: m.text,
            ts: m.created_at,
            read: m.read,
          })),
          supplier: (messages || []).filter(m => m.project_id === p.id && m.thread === 'supplier').map(m => ({
            id: m.id,
            from: m.from_role,
            fromName: m.from_name,
            text: m.text,
            ts: m.created_at,
            read: m.read,
          })),
        },
        documents: (documents || []).filter(d => d.project_id === p.id).map(d => ({
          id: d.id,
          name: d.name,
          uploadedBy: d.uploaded_by,
          uploaderName: d.uploader_name,
          uploaderRole: d.uploader_role,
          size: d.size,
          date: d.created_at?.slice(0, 10),
          visibleTo: d.visible_to || [],
        })),
        photos: (photos || []).filter(ph => ph.project_id === p.id).map(ph => ({
          id: ph.id,
          caption: ph.caption,
          uploadedBy: ph.uploaded_by,
          visibleTo: ph.visible_to || [],
          url: ph.url,
          date: ph.created_at?.slice(0, 10),
        })),
      }))

      setProjects(mapped)
      setActiveProjectId(mapped[0].id)
    } catch (e) {
      console.error('fetchProjects catch:', e)
    }
  }


  const mapProjectFromDB = (p) => ({
    id: p.id,
    name: p.name,
    address: p.address || '',
    startDate: p.start_date || '',
    endDate: p.end_date || '',
    budget: p.budget || 0,
    status: p.status || 'active',
    builderId: p.builder_id,
    clientName: p.client_name || '',
    clientEmail: p.client_email || '',
    clientPhone: p.client_phone || '',
    clientAddress: p.client_address || '',
    builderName: p.builder_name || '',
    builderCompany: p.builder_company || '',
    builderPhone: p.builder_phone || '',
    builderEmail: p.builder_email || '',
    builderAddress: p.builder_address || '',
    phases: [],
    invoices: [],
    supplierInvoices: [],
    labourCosts: [],
    messages: { client: [], supplier: [] },
    documents: [],
    photos: [],
    changeRequests: [],
    unavailable: [],
    suppliers: [],
  })

  // Auth functions
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    if (data?.user) await fetchProfile(data.user.id)
    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null); setProfile(null); setProjects([]); setPage('marketing')
  }

  // Email notifications
  const sendAdminNotification = async ({ name, email, company }) => {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Pocket Builder <noreply@pocketbuilder.co.uk>',
          to: ['djrdunton@gmail.com'],
          subject: 'New builder sign-up — approval needed',
          html: `<h2>New builder sign-up</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Company:</strong> ${company || 'Not provided'}</p><a href="https://pocketbuilder.co" style="background:#00c9a7;color:#0a0f1e;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:12px">Open Pocket Builder</a>`
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
          from: 'Pocket Builder <noreply@pocketbuilder.co.uk>',
          to: ['djrdunton@gmail.com'],
          subject: `Support message from ${fromName}`,
          html: `<h2>Support message</h2><p><strong>From:</strong> ${fromName} (${fromEmail})</p><p><strong>Message:</strong></p><blockquote>${message}</blockquote><a href="https://pocketbuilder.co" style="background:#00c9a7;color:#0a0f1e;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin-top:12px">Open Pocket Builder</a>`
        })
      })
    } catch (e) { console.log('Support email failed:', e) }
  }

  // Project CRUD
  const addProject = async (proj) => {
    try {
      const { data, error } = await supabase.from('projects').insert({
        builder_id: user.id,
        name: proj.name,
        address: proj.address || '',
        start_date: proj.startDate || null,
        end_date: proj.endDate || null,
        budget: Number(proj.budget) || 0,
        status: 'active'
      }).select().single()

      if (error) {
        console.error('Project creation error:', error)
        return { success: false }
      }

      if (data) {
        const mapped = mapProjectFromDB(data)
        setProjects(ps => [mapped, ...ps])
        setActiveProjectId(mapped.id)
        return { success: true, project: mapped }
      }
    } catch (e) {
      console.error('addProject error:', e)
    }
    return { success: false }
  }

  const updateActiveProject = async (updates) => {
    if (!activeProjectId) return
    setProjects(ps => ps.map(p => p.id === activeProjectId ? { ...p, ...updates } : p))

    const dbUpdates = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.address !== undefined) dbUpdates.address = updates.address
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate
    if (updates.budget !== undefined) dbUpdates.budget = updates.budget
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName
    if (updates.clientEmail !== undefined) dbUpdates.client_email = updates.clientEmail
    if (updates.clientPhone !== undefined) dbUpdates.client_phone = updates.clientPhone
    if (updates.clientAddress !== undefined) dbUpdates.client_address = updates.clientAddress
    if (updates.builderName !== undefined) dbUpdates.builder_name = updates.builderName
    if (updates.builderCompany !== undefined) dbUpdates.builder_company = updates.builderCompany
    if (updates.builderPhone !== undefined) dbUpdates.builder_phone = updates.builderPhone
    if (updates.builderEmail !== undefined) dbUpdates.builder_email = updates.builderEmail
    if (updates.builderAddress !== undefined) dbUpdates.builder_address = updates.builderAddress

    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('projects').update(dbUpdates).eq('id', activeProjectId)
    }
  }

  const archiveProject = async (id) => {
    await supabase.from('projects').update({ status: 'archived' }).eq('id', id)
    setProjects(ps => ps.map(p => p.id === id ? { ...p, status: 'archived' } : p))
  }

  const reactivateProject = async (id) => {
    await supabase.from('projects').update({ status: 'active' }).eq('id', id)
    setProjects(ps => ps.map(p => p.id === id ? { ...p, status: 'active' } : p))
  }

  const addPhase = async (phase) => {
    const { data, error } = await supabase.from('phases').insert({
      project_id: activeProjectId,
      name: phase.name,
      start_date: phase.start,
      end_date: phase.end,
      status: phase.status || 'Not Started',
      sort_order: (activeProject?.phases?.length || 0) + 1
    }).select().single()

    if (data) {
      const mapped = { id: data.id, name: data.name, start: data.start_date, end: data.end_date, status: data.status, milestones: [] }
      setProjects(ps => ps.map(p => p.id === activeProjectId
        ? { ...p, phases: [...p.phases, mapped] }
        : p))
    }
  }
  const updatePhase = async (phId, updates) => {
    const dbUpdates = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.start !== undefined) dbUpdates.start_date = updates.start
    if (updates.end !== undefined) dbUpdates.end_date = updates.end
    if (updates.status !== undefined) dbUpdates.status = updates.status

    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('phases').update(dbUpdates).eq('id', phId)
    }

    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, phases: p.phases.map(ph => ph.id === phId ? { ...ph, ...updates } : ph) }
      : p))
  }
  const deletePhase = async (phId) => {
    await supabase.from('phases').delete().eq('id', phId)
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, phases: p.phases.filter(ph => ph.id !== phId) }
      : p))
  }
  const addMilestone = (phId, text) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, phases: p.phases.map(ph => ph.id === phId
          ? { ...ph, milestones: [...ph.milestones, { id: 'ms_' + Date.now(), text, resolved: false, replies: [] }] }
          : ph) }
      : p))
  }
  const replyMilestone = (phId, msId, text) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, phases: p.phases.map(ph => ph.id === phId
          ? { ...ph, milestones: ph.milestones.map(ms => ms.id === msId
              ? { ...ms, replies: [...ms.replies, { by: profile?.name, text, ts: new Date().toISOString() }] }
              : ms) }
          : ph) }
      : p))
  }
  const resolveMilestone = (phId, msId) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, phases: p.phases.map(ph => ph.id === phId
          ? { ...ph, milestones: ph.milestones.map(ms => ms.id === msId ? { ...ms, resolved: true } : ms) }
          : ph) }
      : p))
  }

  // Unavailable
  const addUnavailable = (entry) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, unavailable: [...(p.unavailable || []), { ...entry, id: 'un_' + Date.now() }] }
      : p))
  }
  const deleteUnavailable = (id) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, unavailable: (p.unavailable || []).filter(u => u.id !== id) }
      : p))
  }

  // Messages
  const sendMessage = (thread, text) => {
    const newMsg = { id: 'm_' + Date.now(), from: profile?.role, fromName: profile?.name, text, ts: new Date().toISOString(), read: false }
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, messages: { ...p.messages, [thread]: [...(p.messages?.[thread] || []), newMsg] } }
      : p))
  }

  // Documents
  const addDocument = (doc) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, documents: [...(p.documents || []), { ...doc, id: 'd_' + Date.now(), date: new Date().toISOString().slice(0,10) }] }
      : p))
  }
  const deleteDocument = (id) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, documents: (p.documents || []).filter(d => d.id !== id) }
      : p))
  }

  // Photos
  const addPhoto = (photo) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, photos: [...(p.photos || []), { ...photo, id: 'ph_' + Date.now(), date: new Date().toISOString().slice(0,10), uploadedBy: user?.id }] }
      : p))
  }
  const deletePhoto = (id) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, photos: (p.photos || []).filter(ph => ph.id !== id) }
      : p))
  }

  // Invoices
  const addInvoice = (inv) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, invoices: [...(p.invoices || []), { ...inv, id: 'inv_' + Date.now() }] }
      : p))
  }
  const updateInvoice = (id, updates) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, invoices: (p.invoices || []).map(i => i.id === id ? { ...i, ...updates } : i) }
      : p))
  }
  const deleteInvoice = (id) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, invoices: (p.invoices || []).filter(i => i.id !== id) }
      : p))
  }

  // Supplier invoices
  const addSupplierInvoice = (inv) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, supplierInvoices: [...(p.supplierInvoices || []), { ...inv, id: 'si_' + Date.now() }] }
      : p))
  }
  const deleteSupplierInvoice = (id) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, supplierInvoices: (p.supplierInvoices || []).filter(i => i.id !== id) }
      : p))
  }

  // Labour costs
  const addLabourCost = (cost) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, labourCosts: [...(p.labourCosts || []), { ...cost, id: 'lc_' + Date.now() }] }
      : p))
  }
  const deleteLabourCost = (id) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, labourCosts: (p.labourCosts || []).filter(c => c.id !== id) }
      : p))
  }

  // Change requests
  const addChangeRequest = (text) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, changeRequests: [...(p.changeRequests || []), { id: 'cr_' + Date.now(), text, status: 'Pending', by: profile?.name, date: new Date().toISOString().slice(0,10) }] }
      : p))
  }
  const updateChangeRequest = (id, status) => {
    setProjects(ps => ps.map(p => p.id === activeProjectId
      ? { ...p, changeRequests: (p.changeRequests || []).map(c => c.id === id ? { ...c, status } : c) }
      : p))
  }

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