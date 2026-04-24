import { formatMoney } from '../payroll'
import AppModal from './AppModal'
import NumberField from './NumberField'
import DateField from './DateField'

export default function SettingsModal({ onClose, onUpdate, onExport, onImport, payroll, settings }) {
  return (
    <AppModal
      dateHint="เปอร์เซ็นต์หักจะคิดจากเงินเดือนฐาน"
      onClose={onClose}
      title="ตั้งค่าเงินเดือน"
    >
      <div className="settings-list">
        <div style={{ padding: '0 4px 12px 4px', fontSize: '14px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)' }}>รอบระยะเวลาคำนวณ (ไม่ใส่คือทั้งหมด)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <DateField
            label="ตั้งแต่วันที่"
            value={settings.periodStart || ''}
            onChange={(value) => onUpdate('periodStart', value)}
          />
          <DateField
            label="ถึงวันที่"
            value={settings.periodEnd || ''}
            onChange={(value) => onUpdate('periodEnd', value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '16px 4px 12px 4px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)' }}>รายได้และรายการหัก</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', gap: '8px', alignItems: 'baseline' }}>
            <span>ค่าแรงต่อชั่วโมง</span>
            <strong style={{ color: 'var(--accent)', fontSize: '16px' }}>{formatMoney(payroll.hourlyRate)}</strong>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <NumberField
            label="เงินเดือนฐาน"
            value={settings.salary}
            onChange={(value) => onUpdate('salary', value)}
          />
          <NumberField
            label="สวัสดิการ"
            value={settings.welfare}
            onChange={(value) => onUpdate('welfare', value)}
          />
          <NumberField
            label="เบี้ยขยัน"
            value={settings.diligence}
            onChange={(value) => onUpdate('diligence', value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px' }}>
          <NumberField
            label="ประกันสังคม (%)"
            value={settings.socialSecurityPercent}
            onChange={(value) => onUpdate('socialSecurityPercent', value)}
            helper={`หัก ${formatMoney(payroll.socialSecurityDeduction)}`}
            step="0.1"
          />
          <NumberField
            label="กองทุนฯ (%)"
            value={settings.providentFundPercent}
            onChange={(value) => onUpdate('providentFundPercent', value)}
            helper={`หัก ${formatMoney(payroll.providentFundDeduction)}`}
            step="0.1"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px' }}>
          <NumberField
            label="รายรับอื่น ๆ"
            value={settings.otherIncome}
            onChange={(value) => onUpdate('otherIncome', value)}
          />
          <NumberField
            label="รายการหักอื่น"
            value={settings.deductions}
            onChange={(value) => onUpdate('deductions', value)}
          />
        </div>
        
        <div style={{ padding: '24px 4px 12px 4px', fontSize: '14px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)' }}>สำรองข้อมูล (Backup)</div>
        <div style={{ display: 'grid', gap: '12px' }}>
          <button 
            type="button" 
            onClick={onExport}
            style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            📥 Backup
          </button>
          <label 
            style={{ padding: '12px', background: 'rgba(34, 211, 238, 0.1)', color: '#22d3ee', border: '1px solid rgba(34, 211, 238, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center' }}
          >
            📤 Import Backup
            <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
    </AppModal>
  )
}
