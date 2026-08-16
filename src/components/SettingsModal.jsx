import { memo } from 'react'
import { formatDisplayMoney, getBaseSalary } from '../payroll'
import AppModal from './AppModal'
import NumberField from './NumberField'
import DateField from './DateField'

function formatPeriodLabel(start, end) {
  const fmt = (d) => {
    const [y, m, dd] = d.split('-')
    return `${dd}/${m}/${y.slice(2)}`
  }
  return `${fmt(start)} — ${fmt(end)}`
}

function SettingsModal({ isPrivacyMode, onClose, onUpdate, onSavePeriod, onLoadPeriod, onDeletePeriod, payroll, settings }) {
  const hasPeriod = Boolean(settings.periodStart && settings.periodEnd)
  const savedPeriods = settings.savedPeriods ?? []

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

        {savedPeriods.length > 0 && (
          <div className="settings-saved-periods-row">
            <select
              className="settings-saved-periods-select"
              value={
                savedPeriods.find(
                  (p) => p.start === settings.periodStart && p.end === settings.periodEnd,
                )?.id ?? ''
              }
              onChange={(e) => {
                const period = savedPeriods.find((p) => p.id === e.target.value)
                if (period) onLoadPeriod(period)
              }}
            >
              <option value="" disabled>เลือกช่วงเวลาที่บันทึกไว้</option>
              {savedPeriods.map((period) => (
                <option key={period.id} value={period.id}>
                  {formatPeriodLabel(period.start, period.end)}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="settings-saved-period-delete-btn"
              onClick={() => {
                const active = savedPeriods.find(
                  (p) => p.start === settings.periodStart && p.end === settings.periodEnd,
                )
                if (active) onDeletePeriod(active.id)
              }}
              aria-label="ลบช่วงที่เลือก"
            >
              ✕
            </button>
          </div>
        )}

        {hasPeriod && (
          <button
            type="button"
            className="settings-save-period-btn"
            onClick={onSavePeriod}
          >
            {savedPeriods.some((p) => p.start === settings.periodStart && p.end === settings.periodEnd)
              ? '💾 บันทึกการแก้ไขช่วงนี้'
              : '💾 บันทึกเป็นช่วงใหม่'}
          </button>
        )}

        <div className="settings-pay-row">
          <div className="settings-section-title">รายได้และรายการหัก</div>
          <div className="settings-rate-note">
            <span>ค่าแรงต่อชั่วโมง</span>
            <strong>{formatDisplayMoney(payroll.hourlyRate, isPrivacyMode)}</strong>
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
            helper={`รวมเป็นฐาน OT ${formatDisplayMoney(getBaseSalary(settings), isPrivacyMode)}`}
          />
        </div>

        <div className="settings-two-col settings-grid-2">
          <NumberField
            label="ประกันสังคม (%)"
            value={settings.socialSecurityPercent}
            onChange={(value) => onUpdate('socialSecurityPercent', value)}
            helper={`หัก ${formatDisplayMoney(payroll.socialSecurityDeduction, isPrivacyMode)}`}
            step="0.1"
          />
          <NumberField
            label="กองทุนฯ (%)"
            value={settings.providentFundPercent}
            onChange={(value) => onUpdate('providentFundPercent', value)}
            helper={`หัก ${formatDisplayMoney(payroll.providentFundDeduction, isPrivacyMode)}`}
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
      </div>
    </AppModal>
  )
}

export default memo(SettingsModal)


