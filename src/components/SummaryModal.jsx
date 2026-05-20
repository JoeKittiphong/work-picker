import { memo } from 'react'
import {
  formatMoney,
  getEntryRateBreakdown,
  numberValue,
} from '../payroll'
import AppModal from './AppModal'

function SummaryModal({ entries, onClose, payroll, settings }) {
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
          <strong>{formatMoney(payroll.mealAllowance)}</strong>
        </div>
        <div className="breakdown-row">
          <span>ประกันสังคม {numberValue(settings.socialSecurityPercent)}%</span>
          <strong>-{formatMoney(payroll.socialSecurityDeduction)}</strong>
        </div>
        <div className="breakdown-row">
          <span>กองทุนสำรองเลี้ยงชีพ {numberValue(settings.providentFundPercent)}%</span>
          <strong>-{formatMoney(payroll.providentFundDeduction)}</strong>
        </div>
        <div className="breakdown-row">
          <span>รายการหักอื่น ๆ</span>
          <strong>-{formatMoney(settings.deductions)}</strong>
        </div>
        <div className="breakdown-row total">
          <span>ยอดสุทธิประมาณการ</span>
          <strong>{formatMoney(payroll.expectedPay)}</strong>
        </div>
      </div>
    </AppModal>
  )
}

export default memo(SummaryModal)
