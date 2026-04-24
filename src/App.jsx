import { useState, useEffect } from 'react'
import {
  calculatePayroll,
  createDefaultEntries,
  defaultSettings,
  numberValue,
} from './payroll'
import { loadAll, saveSettings, saveEntries, saveAll } from './db'

/* ── Styles ── */
import './styles/animations.css'
import './styles/forms.css'
import './styles/cards.css'
import './styles/summary.css'
import './App.css'

/* ── Components ── */
import PayBanner from './components/PayBanner'
import EntryList from './components/EntryList'
import EntryModal from './components/EntryModal'
import SummaryModal from './components/SummaryModal'
import SettingsModal from './components/SettingsModal'
import QrCodeModal from './components/QrCodeModal'

function App() {
  const [settings, setSettings] = useState(defaultSettings)
  const [entries, setEntries] = useState([])
  const [activeModal, setActiveModal] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPrivacyMode, setIsPrivacyMode] = useState(false)
  const [deletingEntryId, setDeletingEntryId] = useState(null)

  const filteredEntries = entries.filter((entry) => {
    if (settings.periodStart && entry.date < settings.periodStart) return false
    if (settings.periodEnd && entry.date > settings.periodEnd) return false
    return true
  })

  const payroll = calculatePayroll(settings, filteredEntries)

  /* ── Load from IndexedDB on mount ── */
  useEffect(() => {
    loadAll(defaultSettings, createDefaultEntries()).then((data) => {
      setSettings(data.settings)
      setEntries(data.entries)
      setIsLoading(false)
    })
  }, [])

  function updateSettings(key, value) {
    let finalValue = value;
    if (key !== 'periodStart' && key !== 'periodEnd') {
      finalValue = numberValue(value);
    }
    const nextSettings = { ...settings, [key]: finalValue }
    setSettings(nextSettings)
    saveSettings(nextSettings)
  }

  function addEntry(entry) {
    const nextEntries = [entry, ...entries]
    setEntries(nextEntries)
    saveEntries(nextEntries)
    setActiveModal(null)
  }

  function requestRemoveEntry(id) {
    setDeletingEntryId(id)
  }

  function confirmRemoveEntry() {
    if (deletingEntryId) {
      const nextEntries = entries.filter((entry) => entry.id !== deletingEntryId)
      setEntries(nextEntries)
      saveEntries(nextEntries)
      setDeletingEntryId(null)
    }
  }

  function handleExport() {
    const data = { settings, entries }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `work-picker-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(event) {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.settings && Array.isArray(data.entries)) {
          setSettings(data.settings)
          setEntries(data.entries)
          saveAll(data.settings, data.entries)
          alert('กู้คืนข้อมูลสำเร็จ!')
        } else {
          alert('ไฟล์ไม่รองรับ หรือข้อมูลไม่ครบถ้วน')
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  if (isLoading) {
    return (
      <main className="app-shell">
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>กำลังโหลด...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <PayBanner 
        payroll={payroll} 
        isPrivacyMode={isPrivacyMode}
        onTogglePrivacy={() => setIsPrivacyMode(!isPrivacyMode)}
      />

      <section className="panel">
        {filteredEntries.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <p>ยังไม่มีรายการ OT — กดปุ่ม + เพื่อเพิ่ม</p>
          </div>
        ) : (
          <EntryList
            entries={filteredEntries}
            hourlyRate={payroll.hourlyRate}
            onRemove={requestRemoveEntry}
          />
        )}
      </section>

      {/* Bottom Navigation */}
      <nav className="bottom-nav" aria-label="เมนูหลัก">
        <button onClick={() => setActiveModal(null)} type="button" className={!activeModal ? 'active' : ''}>
          <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span className="nav-label">บันทึก</span>
        </button>
        <button onClick={() => setActiveModal('summary')} type="button" className={activeModal === 'summary' ? 'active' : ''}>
          <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span className="nav-label">สรุป</span>
        </button>
        <button onClick={() => setActiveModal('entry')} type="button" className={`nav-center-action ${activeModal === 'entry' ? 'active' : ''}`}>
          <div style={{ background: 'var(--accent)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px', boxShadow: '0 4px 12px var(--accent-glow)' }}>
            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '24px', height: '24px', stroke: '#fff', strokeWidth: '2.5', strokeLinecap: 'round', fill: 'none' }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="nav-label" style={{ fontSize: '10px' }}>เพิ่ม OT</span>
        </button>
        <button onClick={() => setActiveModal('settings')} type="button" className={activeModal === 'settings' ? 'active' : ''}>
          <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className="nav-label">ตั้งค่า</span>
        </button>
        <button onClick={() => setActiveModal('qrcode')} type="button" className={activeModal === 'qrcode' ? 'active' : ''}>
          <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span className="nav-label">แชร์</span>
        </button>
      </nav>

      {activeModal === 'entry' && (
        <EntryModal onClose={() => setActiveModal(null)} onSubmit={addEntry} />
      )}

      {activeModal === 'summary' && (
        <SummaryModal
          entries={filteredEntries}
          onClose={() => setActiveModal(null)}
          payroll={payroll}
          settings={settings}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          onClose={() => setActiveModal(null)}
          onUpdate={updateSettings}
          onExport={handleExport}
          onImport={handleImport}
          payroll={payroll}
          settings={settings}
        />
      )}

      {activeModal === 'qrcode' && (
        <QrCodeModal onClose={() => setActiveModal(null)} />
      )}

      {deletingEntryId && (
        <div className="modal-backdrop" role="presentation" onClick={() => setDeletingEntryId(null)}>
          <section
            aria-modal="true"
            className="app-modal"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>ยืนยันการลบ</h2>
                <p>คุณต้องการลบรายการ OT นี้ใช่หรือไม่?</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setDeletingEntryId(null)}
                style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmRemoveEntry}
                style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ลบรายการ
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
