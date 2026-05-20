import { memo } from 'react'
import { formatMoney, getBaseSalary } from '../payroll'
import AppModal from './AppModal'
import NumberField from './NumberField'
import DateField from './DateField'

function SettingsModal({ onClose, onUpdate, onExport, onImport, payroll, settings }) {
  return (
    <AppModal
      dateHint="เปอร์เซ็นต์จะคิดจากเงินเดือนฐาน"
      onClose={onClose}
      title="ตั้งค่าเงินเดือน"
    >
      <div className="settings-list">
        <div className="settings-section-title">รอบระยะเวลาคำนวณ (ไม่ใช่ทั้งหมด)</div>
        <div className="settings-date-grid">
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

        <div className="settings-pay-row">
          <div className="settings-section-title">รายได้และรายการหัก</div>
          <div className="settings-rate-note">
            <span>ค่าแรงต่อชั่วโมง</span>
            <strong>{formatMoney(payroll.hourlyRate)}</strong>
          </div>
        </div>

        <div className="settings-income-grid settings-grid-3">
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

        <div className="settings-position-row">
          <NumberField
            label="ค่าตำแหน่ง"
            value={settings.position}
            onChange={(value) => onUpdate('position', value)}
            helper={`รวมเป็นฐาน OT ${formatMoney(getBaseSalary(settings))}`}
          />
        </div>

        <div className="settings-two-col settings-grid-2">
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

        <div className="settings-two-col settings-grid-2">
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

        <div className="settings-section-title settings-backup-title">สำรองข้อมูล (Backup)</div>
        <div className="settings-backup-actions">
          <button
            type="button"
            onClick={onExport}
            className="settings-backup-button"
          >
            📥 Backup
          </button>
          <label className="settings-backup-import">
            📤 Import Backup
            <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
    </AppModal>
  )
}

export default memo(SettingsModal)
