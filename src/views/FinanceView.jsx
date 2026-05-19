import { useState } from 'react'
import { useApp } from '../context'

const S = {
  bg: '#0a0f1e', surface: '#0d1525', card: '#111d35',
  border: '#1e2d47', accent: '#00c9a7', text: '#f0f4ff',
  muted: '#5a7a9a', green: '#22c55e', blue: '#3b82f6',
  red: '#ef4444', amber: '#f59e0b', purple: '#a78bfa'
}

const fmt = n => '£' + Number(n || 0).toLocaleString('en-GB')

function Sheet({ title, onClose, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 200 }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201, background: S.card, borderRadius: '20px 20px 0 0', borderTop: `2px solid ${S.accent}`, maxHeight: '90vh', overflowY: 'auto', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, background: S.border, borderRadius: 2 }} />
        </div>
        <div style={{ padding: '8px 20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: S.text }}>{title}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: S.muted, fontSize: 24, cursor: 'pointer' }}>×</button>
          </div>
          {children}
        </div>
      </div>
    </>
  )
}

const Inp = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '12px 14px', color: S.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
  </div>
)

function AddInvoiceSheet({ onClose }) {
  const { addInvoice, activeProject } = useApp()
  const nextNum = `INV-${String((activeProject?.invoices?.length || 0) + 1).padStart(3, '0')}`
  const [form, setForm] = useState({ number: nextNum, description: '', amount: '', vatRate: 20, dueDate: '', status: 'Unpaid', vatEnabled: true })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const vat = form.vatEnabled ? Math.round((Number(form.amount) || 0) * form.vatRate / 100) : 0
  const total = (Number(form.amount) || 0) + vat

  const save = () => {
    if (!form.description || !form.amount || !form.dueDate) return
    addInvoice({ ...form, amount: Number(form.amount), vat, paidDate: null })
    onClose()
  }

  return (
    <Sheet title="New invoice" onClose={onClose}>
      <Inp label="Invoice number" value={form.number} onChange={v => set('number', v)} />
      <Inp label="Description" value={form.description} onChange={v => set('description', v)} placeholder="e.g. Groundworks — stage payment" />
      <Inp label="Amount ex-VAT (£)" value={form.amount} onChange={v => set('amount', v)} type="number" placeholder="14500" />

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>VAT</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: form.vatEnabled ? 10 : 0 }}>
          <button onClick={() => set('vatEnabled', true)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${form.vatEnabled ? S.accent : S.border}`, background: form.vatEnabled ? S.accent + '22' : S.surface, color: form.vatEnabled ? S.accent : S.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            VAT applies
          </button>
          <button onClick={() => set('vatEnabled', false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${!form.vatEnabled ? S.accent : S.border}`, background: !form.vatEnabled ? S.accent + '22' : S.surface, color: !form.vatEnabled ? S.accent : S.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            No VAT
          </button>
        </div>
        {form.vatEnabled && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: S.surface, borderRadius: 10, padding: '10px 14px', border: `1px solid ${S.border}` }}>
            <span style={{ fontSize: 13, color: S.muted, flex: 1 }}>VAT rate</span>
            {[5, 20].map(r => (
              <button key={r} onClick={() => set('vatRate', r)} style={{ padding: '6px 14px', borderRadius: 8, border: `1.5px solid ${form.vatRate === r ? S.accent : S.border}`, background: form.vatRate === r ? S.accent + '22' : 'transparent', color: form.vatRate === r ? S.accent : S.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                {r}%
              </button>
            ))}
            <input type="number" value={form.vatRate} onChange={e => set('vatRate', Number(e.target.value))}
              style={{ width: 56, background: 'transparent', border: `1px solid ${S.border}`, borderRadius: 8, padding: '6px 8px', color: S.text, fontSize: 13, outline: 'none', textAlign: 'center' }} />
          </div>
        )}
      </div>

      <Inp label="Due date" value={form.dueDate} onChange={v => set('dueDate', v)} type="date" />

      {form.amount && (
        <div style={{ background: S.surface, borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: form.vatEnabled ? 4 : 0 }}>
            <span style={{ color: S.muted, fontSize: 13 }}>Net amount</span>
            <span style={{ color: S.text, fontSize: 13, fontFamily: 'monospace' }}>£{Number(form.amount).toLocaleString('en-GB')}</span>
          </div>
          {form.vatEnabled && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: S.muted, fontSize: 13 }}>VAT ({form.vatRate}%)</span>
              <span style={{ color: S.text, fontSize: 13, fontFamily: 'monospace' }}>£{vat.toLocaleString('en-GB')}</span>
            </div>
          )}
          <div style={{ height: 1, background: S.border, margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: S.muted, fontSize: 13 }}>Total</span>
            <span style={{ color: S.accent, fontWeight: 800, fontSize: 16, fontFamily: 'monospace' }}>£{total.toLocaleString('en-GB')}</span>
          </div>
        </div>
      )}

      <button onClick={save} disabled={!form.description || !form.amount || !form.dueDate}
        style={{ width: '100%', padding: 14, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: (!form.description || !form.amount || !form.dueDate) ? 0.5 : 1 }}>
        Create invoice
      </button>
    </Sheet>
  )
}

function InvoiceDetailSheet({ invoice, onClose }) {
  const { updateInvoice, deleteInvoice } = useApp()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const markPaid = () => updateInvoice(invoice.id, { status: 'Paid', paidDate: new Date().toISOString().slice(0, 10) })
  const markOverdue = () => updateInvoice(invoice.id, { status: 'Overdue' })
  const handleDelete = () => { if (confirmDelete) { deleteInvoice(invoice.id); onClose() } else setConfirmDelete(true) }
  const STATUS_COLORS = { Paid: S.green, Unpaid: S.amber, Overdue: S.red }
  const color = STATUS_COLORS[invoice.status] || S.muted
  const hasVat = (invoice.vat || 0) > 0

  return (
    <Sheet title={invoice.number} onClose={onClose}>
      <div style={{ background: S.surface, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: S.muted, marginBottom: 4 }}>{invoice.description}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: S.text, fontFamily: 'monospace', marginBottom: 8 }}>
          £{((invoice.amount || 0) + (invoice.vat || 0)).toLocaleString('en-GB')}
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: S.muted }}>
          <span>Net £{(invoice.amount || 0).toLocaleString('en-GB')}</span>
          {hasVat && <span>VAT £{(invoice.vat || 0).toLocaleString('en-GB')}</span>}
          {!hasVat && <span style={{ color: S.accent }}>No VAT</span>}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: S.muted }}>Due {invoice.dueDate}</span>
        <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 20, color, background: color + '22' }}>{invoice.status}</span>
      </div>
      {invoice.paidDate && <div style={{ fontSize: 12, color: S.green, marginBottom: 16 }}>✓ Paid on {invoice.paidDate}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {invoice.status !== 'Paid' && (
          <button onClick={markPaid} style={{ width: '100%', padding: 14, background: S.green, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>✓ Mark as paid</button>
        )}
        {invoice.status === 'Unpaid' && (
          <button onClick={markOverdue} style={{ width: '100%', padding: 14, background: S.surface, color: S.red, border: `1px solid ${S.red}44`, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Mark as overdue</button>
        )}
        <button onClick={handleDelete} style={{ width: '100%', padding: 14, background: confirmDelete ? S.red : S.surface, color: confirmDelete ? '#fff' : S.red, border: `1px solid ${S.red}44`, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          {confirmDelete ? 'Confirm delete' : 'Delete invoice'}
        </button>
      </div>
    </Sheet>
  )
}

function AddCostSheet({ type, onClose }) {
  const { addSupplierInvoice, addLabourCost } = useApp()
  const [form, setForm] = useState({ supplier: '', description: '', amount: '', date: '', status: 'Unpaid' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const STATUS_COLORS = { Paid: S.green, Unpaid: S.amber }

  const save = () => {
    if (!form.description || !form.amount) return
    if (type === 'supplier') addSupplierInvoice({ ...form, amount: Number(form.amount) })
    else addLabourCost({ description: form.description, amount: Number(form.amount), date: form.date })
    onClose()
  }

  return (
    <Sheet title={type === 'supplier' ? 'Supplier invoice' : 'Labour cost'} onClose={onClose}>
      {type === 'supplier' && <Inp label="Supplier name" value={form.supplier} onChange={v => set('supplier', v)} placeholder="e.g. Reynolds Materials" />}
      <Inp label="Description" value={form.description} onChange={v => set('description', v)} placeholder="e.g. Groundworks materials" />
      <Inp label="Amount (£)" value={form.amount} onChange={v => set('amount', v)} type="number" placeholder="8200" />
      <Inp label="Date" value={form.date} onChange={v => set('date', v)} type="date" />
      {type === 'supplier' && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 10, color: S.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Status</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Unpaid', 'Paid'].map(s => (
              <button key={s} onClick={() => set('status', s)} style={{ flex: 1, padding: 10, borderRadius: 10, border: `2px solid ${form.status === s ? STATUS_COLORS[s] : S.border}`, background: form.status === s ? STATUS_COLORS[s] + '22' : S.surface, color: form.status === s ? STATUS_COLORS[s] : S.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{s}</button>
            ))}
          </div>
        </div>
      )}
      <button onClick={save} disabled={!form.description || !form.amount}
        style={{ width: '100%', padding: 14, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: (!form.description || !form.amount) ? 0.5 : 1 }}>
        Add {type === 'supplier' ? 'invoice' : 'cost'}
      </button>
    </Sheet>
  )
}

function AllProjectsPL() {
  const { projects } = useApp()
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)

  const years = [...new Set([
    currentYear - 1, currentYear, currentYear + 1,
    ...projects.map(p => p.startDate ? new Date(p.startDate).getFullYear() : currentYear)
  ])].sort()

  const projectsInYear = projects.filter(p => {
    if (!p.startDate && !p.endDate) return true
    const start = p.startDate ? new Date(p.startDate).getFullYear() : null
    const end   = p.endDate   ? new Date(p.endDate).getFullYear()   : null
    return start <= year && (!end || end >= year)
  })

  const totals = projectsInYear.reduce((acc, p) => {
    const net      = (p.invoices || []).reduce((s, i) => s + (i.amount || 0), 0)
    const vat      = (p.invoices || []).reduce((s, i) => s + (i.vat || 0), 0)
    const received = (p.invoices || []).filter(i => i.status === 'Paid').reduce((s, i) => s + (i.amount || 0), 0)
    const costs    = (p.supplierInvoices || []).reduce((s, i) => s + (i.amount || 0), 0) + (p.labourCosts || []).reduce((s, i) => s + (i.amount || 0), 0)
    return {
      net:      acc.net      + net,
      vat:      acc.vat      + vat,
      received: acc.received + received,
      costs:    acc.costs    + costs,
      margin:   acc.margin   + (received - costs),
    }
  }, { net: 0, vat: 0, received: 0, costs: 0, margin: 0 })

  const hasVat = totals.vat > 0

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
        {years.map(y => (
          <button key={y} onClick={() => setYear(y)} style={{ flexShrink: 0, padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, border: `1.5px solid ${year === y ? S.accent : S.border}`, background: year === y ? S.accent + '22' : S.surface, color: year === y ? S.accent : S.muted, cursor: 'pointer' }}>
            {y}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Income</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: S.muted }}>Net invoiced (ex-VAT)</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: S.text, fontFamily: 'monospace' }}>{fmt(totals.net)}</span>
          </div>
          {hasVat && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: S.muted }}>VAT collected</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: S.muted, fontFamily: 'monospace' }}>{fmt(totals.vat)}</span>
            </div>
          )}
          <div style={{ height: 1, background: S.border, margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: S.muted }}>Net received</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: S.green, fontFamily: 'monospace' }}>{fmt(totals.received)}</span>
          </div>
        </div>

        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Costs</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: S.muted }}>Total costs</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: S.blue, fontFamily: 'monospace' }}>{fmt(totals.costs)}</span>
          </div>
        </div>

        <div style={{ background: totals.margin >= 0 ? S.green + '15' : S.red + '15', border: `1px solid ${totals.margin >= 0 ? S.green : S.red}44`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Net margin {year}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: totals.margin >= 0 ? S.green : S.red, fontFamily: 'monospace' }}>{fmt(totals.margin)}</div>
          {totals.received > 0 && (
            <div style={{ fontSize: 12, color: S.muted, marginTop: 4 }}>{Math.round(totals.margin / totals.received * 100)}% margin on net received</div>
          )}
          {hasVat && (
            <div style={{ fontSize: 11, color: S.muted, marginTop: 6, padding: '4px 8px', background: S.surface, borderRadius: 6, display: 'inline-block' }}>VAT excluded from margin</div>
          )}
        </div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Per project — {year}</div>
      {projectsInYear.length === 0 && (
        <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: 24, textAlign: 'center', color: S.muted, fontSize: 14 }}>No projects in {year}</div>
      )}
      {projectsInYear.map(p => {
        const net      = (p.invoices || []).reduce((s, i) => s + (i.amount || 0), 0)
        const received = (p.invoices || []).filter(i => i.status === 'Paid').reduce((s, i) => s + (i.amount || 0), 0)
        const costs    = (p.supplierInvoices || []).reduce((s, i) => s + (i.amount || 0), 0) + (p.labourCosts || []).reduce((s, i) => s + (i.amount || 0), 0)
        const margin   = received - costs
        return (
          <div key={p.id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{p.name}</div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: p.status === 'archived' ? S.muted + '22' : S.green + '22', color: p.status === 'archived' ? S.muted : S.green }}>{p.status}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: margin >= 0 ? S.green : S.red, fontFamily: 'monospace' }}>{fmt(margin)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div style={{ background: S.surface, borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: S.muted, textTransform: 'uppercase', marginBottom: 2 }}>Net invoiced</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: S.text, fontFamily: 'monospace' }}>{fmt(net)}</div>
              </div>
              <div style={{ background: S.surface, borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: S.muted, textTransform: 'uppercase', marginBottom: 2 }}>Net received</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: S.green, fontFamily: 'monospace' }}>{fmt(received)}</div>
              </div>
              <div style={{ background: S.surface, borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: S.muted, textTransform: 'uppercase', marginBottom: 2 }}>Costs</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: S.blue, fontFamily: 'monospace' }}>{fmt(costs)}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function FinanceView() {
  const { activeProject } = useApp()
  const [tab, setTab] = useState('invoices')
  const [showAddInvoice, setShowAddInvoice] = useState(false)
  const [showAddCost, setShowAddCost] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const p = activeProject
  const STATUS_COLORS = { Paid: S.green, Unpaid: S.amber, Overdue: S.red }

  const netInvoiced    = (p?.invoices || []).reduce((s, i) => s + (i.amount || 0), 0)
  const vatInvoiced    = (p?.invoices || []).reduce((s, i) => s + (i.vat || 0), 0)
  const totalIncome    = netInvoiced + vatInvoiced
  const paidNet        = (p?.invoices || []).filter(i => i.status === 'Paid').reduce((s, i) => s + (i.amount || 0), 0)
  const paidVat        = (p?.invoices || []).filter(i => i.status === 'Paid').reduce((s, i) => s + (i.vat || 0), 0)
  const paidIncome     = paidNet + paidVat
  const supplierTotal  = (p?.supplierInvoices || []).reduce((s, i) => s + (i.amount || 0), 0)
  const labourTotal    = (p?.labourCosts || []).reduce((s, i) => s + (i.amount || 0), 0)
  const totalCosts     = supplierTotal + labourTotal
  const margin         = paidNet - totalCosts
  const overdueTotal   = (p?.invoices || []).filter(i => i.status === 'Overdue').reduce((s, i) => s + (i.amount || 0) + (i.vat || 0), 0)
  const hasVat         = vatInvoiced > 0

  const TABS = ['invoices', 'p&l', 'costs', 'all projects']

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: S.surface, borderBottom: `1px solid ${S.border}`, padding: '16px 20px 0' }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: S.text, marginBottom: 4 }}>Finance</div>
        <div style={{ fontSize: 12, color: S.muted, marginBottom: 12 }}>{p?.name || 'No project selected'}</div>
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: '8px 8px 0 0', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em', background: tab === t ? S.card : 'transparent', color: tab === t ? S.accent : S.muted, borderBottom: tab === t ? `2px solid ${S.accent}` : '2px solid transparent' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>

        {tab === 'all projects' && <AllProjectsPL />}

        {tab === 'p&l' && p && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Income</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: S.muted }}>Net invoiced (ex-VAT)</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: S.text, fontFamily: 'monospace' }}>{fmt(netInvoiced)}</span>
                </div>
                {hasVat && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: S.muted }}>VAT collected</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: S.muted, fontFamily: 'monospace' }}>{fmt(vatInvoiced)}</span>
                  </div>
                )}
                <div style={{ height: 1, background: S.border, margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: S.muted }}>Total invoiced (inc-VAT)</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: S.text, fontFamily: 'monospace' }}>{fmt(totalIncome)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: S.muted }}>Net received</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: S.green, fontFamily: 'monospace' }}>{fmt(paidNet)}</span>
                </div>
                {overdueTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 13, color: S.red }}>Overdue</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: S.red, fontFamily: 'monospace' }}>{fmt(overdueTotal)}</span>
                  </div>
                )}
              </div>

              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Costs</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: S.muted }}>Supplier invoices</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: S.text, fontFamily: 'monospace' }}>{fmt(supplierTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: S.muted }}>Labour costs</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: S.text, fontFamily: 'monospace' }}>{fmt(labourTotal)}</span>
                </div>
                <div style={{ height: 1, background: S.border, margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: S.muted }}>Total costs</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: S.blue, fontFamily: 'monospace' }}>{fmt(totalCosts)}</span>
                </div>
              </div>

              <div style={{ background: margin >= 0 ? S.green + '15' : S.red + '15', border: `1px solid ${margin >= 0 ? S.green : S.red}44`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Net margin (ex-VAT received – costs)</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: margin >= 0 ? S.green : S.red, fontFamily: 'monospace' }}>{fmt(margin)}</div>
                {totalCosts > 0 && paidNet > 0 && (
                  <div style={{ fontSize: 12, color: S.muted, marginTop: 4 }}>{Math.round(margin / paidNet * 100)}% margin on net received</div>
                )}
                {hasVat && (
                  <div style={{ fontSize: 11, color: S.muted, marginTop: 6, padding: '4px 8px', background: S.surface, borderRadius: 6, display: 'inline-block' }}>VAT excluded from margin</div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'invoices' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Net invoiced</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: S.accent, fontFamily: 'monospace' }}>{fmt(netInvoiced)}</div>
                {hasVat && <div style={{ fontSize: 10, color: S.muted, marginTop: 2 }}>+{fmt(vatInvoiced)} VAT</div>}
              </div>
              <div style={{ flex: 1, background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Net received</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: S.green, fontFamily: 'monospace' }}>{fmt(paidNet)}</div>
                {hasVat && <div style={{ fontSize: 10, color: S.muted, marginTop: 2 }}>+{fmt(paidVat)} VAT</div>}
              </div>
            </div>

            <button onClick={() => setShowAddInvoice(true)} style={{ width: '100%', padding: 13, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', marginBottom: 14 }}>
              + New invoice
            </button>

            {(p?.invoices || []).length === 0 && (
              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: 24, textAlign: 'center', color: S.muted, fontSize: 14 }}>No invoices yet</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(p?.invoices || []).map(inv => {
                const color = STATUS_COLORS[inv.status] || S.muted
                const invHasVat = (inv.vat || 0) > 0
                return (
                  <button key={inv.id} onClick={() => setSelectedInvoice(inv)}
                    style={{ background: S.card, border: `1px solid ${color}44`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: S.muted, marginBottom: 2 }}>{inv.number}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 3 }}>{inv.description}</div>
                      <div style={{ fontSize: 12, color: S.muted }}>Due {inv.dueDate}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: S.text, fontFamily: 'monospace' }}>
                        £{((inv.amount || 0) + (inv.vat || 0)).toLocaleString('en-GB')}
                      </div>
                      {!invHasVat && <div style={{ fontSize: 10, color: S.muted }}>No VAT</div>}
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, color, background: color + '22' }}>{inv.status}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'costs' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button onClick={() => setShowAddCost('supplier')} style={{ flex: 1, padding: 13, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                + Supplier invoice
              </button>
              <button onClick={() => setShowAddCost('labour')} style={{ flex: 1, padding: 13, background: S.surface, color: S.text, border: `1px solid ${S.border}`, borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                + Labour cost
              </button>
            </div>

            {(p?.supplierInvoices || []).length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Supplier invoices</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(p?.supplierInvoices || []).map(si => {
                    const color = STATUS_COLORS[si.status] || S.muted
                    return (
                      <div key={si.id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: S.muted, marginBottom: 2 }}>{si.supplier}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{si.description}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: S.text, fontFamily: 'monospace' }}>{fmt(si.amount)}</div>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, color, background: color + '22' }}>{si.status}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: 8, textAlign: 'right', fontSize: 13, fontWeight: 700, color: S.blue, fontFamily: 'monospace' }}>Total: {fmt(supplierTotal)}</div>
              </div>
            )}

            {(p?.labourCosts || []).length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Labour costs</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(p?.labourCosts || []).map(lc => (
                    <div key={lc.id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{lc.description}</div>
                        <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>{lc.date}</div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: S.text, fontFamily: 'monospace', flexShrink: 0 }}>{fmt(lc.amount)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, textAlign: 'right', fontSize: 13, fontWeight: 700, color: S.purple, fontFamily: 'monospace' }}>Total: {fmt(labourTotal)}</div>
              </div>
            )}

            {(p?.supplierInvoices || []).length === 0 && (p?.labourCosts || []).length === 0 && (
              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: 24, textAlign: 'center', color: S.muted, fontSize: 14 }}>No costs logged yet</div>
            )}
          </div>
        )}
      </div>

      {showAddInvoice && <AddInvoiceSheet onClose={() => setShowAddInvoice(false)} />}
      {showAddCost && <AddCostSheet type={showAddCost} onClose={() => setShowAddCost(null)} />}
      {selectedInvoice && <InvoiceDetailSheet invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
    </div>
  )
}