import { useState } from 'react'
import { useApp } from '../context'

const S = {
  bg: '#0a0f1e', surface: '#0d1525', card: '#111d35',
  border: '#1e2d47', accent: '#00c9a7', text: '#f0f4ff',
  muted: '#5a7a9a', green: '#22c55e', blue: '#3b82f6',
  red: '#ef4444', amber: '#f59e0b', purple: '#a78bfa'
}

const fmt = n => '£' + Number(n || 0).toLocaleString('en-GB')

const INVOICE_STATUSES = ['Unpaid', 'Paid', 'Overdue']
const STATUS_COLORS = { Paid: S.green, Unpaid: S.amber, Overdue: S.red }

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
  const nextNum = `INV-${String(activeProject.invoices.length + 1).padStart(3, '0')}`
  const [form, setForm] = useState({ number: nextNum, description: '', amount: '', vatRate: 20, dueDate: '', status: 'Unpaid' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const vat = Math.round((Number(form.amount) || 0) * form.vatRate / 100)
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <Inp label="VAT rate (%)" value={form.vatRate} onChange={v => set('vatRate', Number(v))} type="number" />
        <Inp label="Due date" value={form.dueDate} onChange={v => set('dueDate', v)} type="date" />
      </div>
      {form.amount && (
        <div style={{ background: S.surface, borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: S.muted, fontSize: 13 }}>Total inc. VAT</span>
          <span style={{ color: S.accent, fontWeight: 800, fontSize: 16, fontFamily: 'monospace' }}>{fmt(total)}</span>
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

  const color = STATUS_COLORS[invoice.status] || S.muted

  return (
    <Sheet title={invoice.number} onClose={onClose}>
      <div style={{ background: S.surface, borderRadius: 12, padding: '16px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: S.muted, marginBottom: 4 }}>{invoice.description}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: S.text, fontFamily: 'monospace', marginBottom: 8 }}>{fmt(invoice.amount + invoice.vat)}</div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: S.muted }}>
          <span>ex-VAT {fmt(invoice.amount)}</span>
          <span>VAT {fmt(invoice.vat)}</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: S.muted }}>Due {invoice.dueDate}</span>
        <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 20, color, background: color + '22' }}>{invoice.status}</span>
      </div>
      {invoice.paidDate && <div style={{ fontSize: 12, color: S.green, marginBottom: 16 }}>✓ Paid on {invoice.paidDate}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {invoice.status !== 'Paid' && (
          <button onClick={markPaid} style={{ width: '100%', padding: 14, background: S.green, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            ✓ Mark as paid
          </button>
        )}
        {invoice.status === 'Unpaid' && (
          <button onClick={markOverdue} style={{ width: '100%', padding: 14, background: S.surface, color: S.red, border: `1px solid ${S.red}44`, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Mark as overdue
          </button>
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

export default function FinanceView() {
  const { activeProject } = useApp()
  const [tab, setTab] = useState('invoices')
  const [showAddInvoice, setShowAddInvoice] = useState(false)
  const [showAddCost, setShowAddCost] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const p = activeProject

  const totalIncome    = p.invoices.reduce((s, i) => s + i.amount + i.vat, 0)
  const paidIncome     = p.invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount + i.vat, 0)
  const supplierTotal  = p.supplierInvoices.reduce((s, i) => s + i.amount, 0)
  const labourTotal    = p.labourCosts.reduce((s, i) => s + i.amount, 0)
  const totalCosts     = supplierTotal + labourTotal
  const margin         = paidIncome - totalCosts
  const overdueTotal   = p.invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount + i.vat, 0)

  const TABS = ['invoices', 'p&l', 'costs']

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: S.surface, borderBottom: `1px solid ${S.border}`, padding: '16px 20px 0' }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: S.text, marginBottom: 4 }}>Finance</div>
        <div style={{ fontSize: 12, color: S.muted, marginBottom: 12 }}>{p.name}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', background: tab === t ? S.card : 'transparent', color: tab === t ? S.accent : S.muted, borderBottom: tab === t ? `2px solid ${S.accent}` : '2px solid transparent' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>

        {/* P&L tab */}
        {tab === 'p&l' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '16px' }}>
                <div style={{ fontSize: 11, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Income</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: S.muted }}>Total invoiced</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: S.text, fontFamily: 'monospace' }}>{fmt(totalIncome)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: S.muted }}>Received</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: S.green, fontFamily: 'monospace' }}>{fmt(paidIncome)}</span>
                </div>
                {overdueTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 13, color: S.red }}>Overdue</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: S.red, fontFamily: 'monospace' }}>{fmt(overdueTotal)}</span>
                  </div>
                )}
              </div>

              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '16px' }}>
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

              <div style={{ background: margin >= 0 ? S.green + '15' : S.red + '15', border: `1px solid ${margin >= 0 ? S.green : S.red}44`, borderRadius: 12, padding: '16px' }}>
                <div style={{ fontSize: 11, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Margin (cash received – costs)</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: margin >= 0 ? S.green : S.red, fontFamily: 'monospace' }}>{fmt(margin)}</div>
                {totalCosts > 0 && paidIncome > 0 && (
                  <div style={{ fontSize: 12, color: S.muted, marginTop: 4 }}>
                    {Math.round(margin / paidIncome * 100)}% margin on received income
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Invoices tab */}
        {tab === 'invoices' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Invoiced</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: S.accent, fontFamily: 'monospace' }}>{fmt(totalIncome)}</div>
              </div>
              <div style={{ flex: 1, background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Received</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: S.green, fontFamily: 'monospace' }}>{fmt(paidIncome)}</div>
              </div>
            </div>

            <button onClick={() => setShowAddInvoice(true)} style={{ width: '100%', padding: 13, background: S.accent, color: S.bg, border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: 'pointer', marginBottom: 14 }}>
              + New invoice
            </button>

            {p.invoices.length === 0 && (
              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: 24, textAlign: 'center', color: S.muted, fontSize: 14 }}>No invoices yet</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {p.invoices.map(inv => {
                const color = STATUS_COLORS[inv.status] || S.muted
                return (
                  <button key={inv.id} onClick={() => setSelectedInvoice(inv)}
                    style={{ background: S.card, border: `1px solid ${color}44`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: S.muted, marginBottom: 2 }}>{inv.number}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 3 }}>{inv.description}</div>
                      <div style={{ fontSize: 12, color: S.muted }}>Due {inv.dueDate}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: S.text, fontFamily: 'monospace' }}>{fmt(inv.amount + inv.vat)}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, color, background: color + '22' }}>{inv.status}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Costs tab */}
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

            {p.supplierInvoices.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Supplier invoices</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {p.supplierInvoices.map(si => {
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
                <div style={{ marginTop: 8, textAlign: 'right', fontSize: 13, fontWeight: 700, color: S.blue, fontFamily: 'monospace' }}>
                  Total: {fmt(supplierTotal)}
                </div>
              </div>
            )}

            {p.labourCosts.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Labour costs</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {p.labourCosts.map(lc => (
                    <div key={lc.id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{lc.description}</div>
                        <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>{lc.date}</div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: S.text, fontFamily: 'monospace', flexShrink: 0 }}>{fmt(lc.amount)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, textAlign: 'right', fontSize: 13, fontWeight: 700, color: S.purple, fontFamily: 'monospace' }}>
                  Total: {fmt(labourTotal)}
                </div>
              </div>
            )}

            {p.supplierInvoices.length === 0 && p.labourCosts.length === 0 && (
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