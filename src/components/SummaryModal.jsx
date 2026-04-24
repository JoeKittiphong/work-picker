import { formatMoney, numberValue, otTypes } from '../payroll'
import AppModal from './AppModal'

export default function SummaryModal({ entries, onClose, payroll, settings }) {
  return (
    <AppModal onClose={onClose} title="สรุป">
      <div className="breakdown">
        <h2>รายละเอียดรอบเงินเดือน</h2>
        {Object.entries(otTypes).map(([key, type]) => (
          <div className="breakdown-row" key={key}>
            <span>{type.label}</span>
            <strong>{(payroll.totals.byType[key] ?? 0).toFixed(1)} ชม.</strong>
          </div>
        ))}
        <div className="breakdown-row sub-row">
          <span>วันหยุด OT1</span>
          <strong>
            {(payroll.totals.holidayBreakdown.OT1 ?? 0).toFixed(1)} ชม.
          </strong>
        </div>
        <div className="breakdown-row sub-row">
          <span>วันหยุด OT3</span>
          <strong>
            {(payroll.totals.holidayBreakdown.OT3 ?? 0).toFixed(1)} ชม.
          </strong>
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
          <span>
            กองทุนสำรองเลี้ยงชีพ {numberValue(settings.providentFundPercent)}%
          </span>
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
