import { memo } from 'react'
import { formatDisplayMoney, getEntryRateBreakdown, numberValue } from '../payroll'
import AppModal from './AppModal'

function SummaryModal({ entries, isPrivacyMode, onClose, payroll, settings }) {
  const displayDeduction = (value) =>
    isPrivacyMode ? '***' : `-${formatDisplayMoney(value, false)}`

  const rateTotals = entries.reduce(
    (acc, entry) => {
      const breakdown = getEntryRateBreakdown(entry)
      Object.entries(breakdown).forEach(([rate, hours]) => {
        acc[rate] = (acc[rate] ?? 0) + hours
      })
      return acc
    },
    { '1.5': 0, '2': 0, '3': 0 },
  )

  return (
    <AppModal onClose={onClose} title="สรุป">
      <div className="breakdown">
        <h2>รายละเอียดรอบเงินเดือน</h2>
        <div className="breakdown-row">
          <span>OT 1.5</span>
          <strong>{rateTotals['1.5'].toFixed(1)} ชม.</strong>
        </div>
        <div className="breakdown-row">
          <span>OT 2</span>
          <strong>{rateTotals['2'].toFixed(1)} ชม.</strong>
        </div>
        <div className="breakdown-row">
          <span>OT 3</span>
          <strong>{rateTotals['3'].toFixed(1)} ชม.</strong>
        </div>
        <div className="breakdown-row">
          <span>ค่าข้าว OT {entries.length} วัน</span>
          <strong>{formatDisplayMoney(payroll.mealAllowance, isPrivacyMode)}</strong>
        </div>
        <div className="breakdown-row">
          <span>ประกันสังคม {numberValue(settings.socialSecurityPercent)}%</span>
          <strong>{displayDeduction(payroll.socialSecurityDeduction)}</strong>
        </div>
        <div className="breakdown-row">
          <span>กองทุนสำรองเลี้ยงชีพ {numberValue(settings.providentFundPercent)}%</span>
          <strong>{displayDeduction(payroll.providentFundDeduction)}</strong>
        </div>
        <div className="breakdown-row">
          <span>รายการหักอื่น ๆ</span>
          <strong>{displayDeduction(settings.deductions)}</strong>
        </div>
        <div className="breakdown-row total">
          <span>ยอดสุทธิประมาณการ</span>
          <strong>{formatDisplayMoney(payroll.expectedPay, isPrivacyMode)}</strong>
        </div>
      </div>
    </AppModal>
  )
}

export default memo(SummaryModal)
