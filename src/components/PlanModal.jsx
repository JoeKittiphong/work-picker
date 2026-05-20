import { memo, useMemo, useState } from 'react'
import {
  formatMoney,
  getEntryAmount,
  getEntryHours,
  getMealAllowanceForEntry,
  getHourlyRate,
  getBaseSalary,
  holidayOtRules,
  numberValue,
  selectableOtKeys,
  otTypes,
} from '../payroll'
import AppModal from './AppModal'
import '../styles/plan.css'

function createInitialDays() {
  return Object.fromEntries(selectableOtKeys.map((key) => [key, 0]))
}

function getRateSummaryLabel(rate) {
  return `OT ${rate}`
}

function PlanModal({ onClose, settings }) {
  const hourlyRate = getHourlyRate(settings)
  const [daysByType, setDaysByType] = useState(createInitialDays)

  const rows = useMemo(() => {
    return selectableOtKeys.map((key) => {
      const type = otTypes[key]
      const dayCount = numberValue(daysByType[key])
      const perDayHours = getEntryHours({ type: key, hours: type.hours })
      const perDayAmount = getEntryAmount({ type: key, hours: type.hours }, hourlyRate)
      const perDayMealAllowance = getMealAllowanceForEntry({ type: key })
      const totalHours = perDayHours * dayCount
      const totalAmount = perDayAmount * dayCount
      const totalMealAllowance = perDayMealAllowance * dayCount

      return {
        key,
        type,
        dayCount,
        perDayHours,
        perDayAmount,
        totalHours,
        totalAmount,
        totalMealAllowance,
      }
    })
  }, [daysByType, hourlyRate])

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          acc.days += row.dayCount
          acc.hours += row.totalHours
          acc.amount += row.totalAmount
          acc.meal += row.totalMealAllowance
          return acc
        },
        { days: 0, hours: 0, amount: 0, meal: 0 },
      ),
    [rows],
  )

  const otRateHours = useMemo(() => {
    const holidayOt3Hours = holidayOtRules.find((rule) => rule.rate === 3)?.hours ?? 0

    return rows.reduce(
      (acc, row) => {
        if (row.key === 'holiday') {
          acc['3'] += holidayOt3Hours * row.dayCount
          return acc
        }

        if (row.type.rate) {
          acc[String(row.type.rate)] = (acc[String(row.type.rate)] ?? 0) + row.totalHours
        }

        return acc
      },
      { '1.5': 0, '2': 0, '3': 0 },
    )
  }, [rows])

  const expectedPay =
    getBaseSalary(settings) +
    numberValue(settings.welfare) +
    numberValue(settings.diligence) +
    numberValue(settings.otherIncome) +
    totals.amount +
    totals.meal -
    (numberValue(settings.salary) * (numberValue(settings.socialSecurityPercent) / 100) +
      numberValue(settings.salary) * (numberValue(settings.providentFundPercent) / 100) +
      numberValue(settings.deductions))

  return (
    <AppModal onClose={onClose} title="แผน OT">
      <div className="plan-shell">
        <p className="plan-intro">ใส่จำนวนวันที่คิดว่าจะทำในแต่ละช่วง แล้วระบบจะคำนวณชั่วโมงรวมและเงินรวมให้ทันที</p>

        <div className="plan-summary">
          <div>
            <span>คาดว่าจะได้รับ</span>
            <strong>{formatMoney(expectedPay)}</strong>
          </div>
          <div>
            <span>รวม OT</span>
            <strong>{formatMoney(totals.amount)}</strong>
          </div>
          <div>
            <span>รวมวัน</span>
            <strong>{totals.days.toFixed(0)} วัน</strong>
          </div>
        </div>

        <div className="plan-rate-summary" aria-label="สรุปชั่วโมง OT">
          {[1.5, 2, 3].map((rate) => (
            <div key={rate}>
              <span>{getRateSummaryLabel(rate)}</span>
              <strong>{otRateHours[String(rate)].toFixed(1)} ชม.</strong>
            </div>
          ))}
        </div>

        <div className="plan-list">
          {rows.map((row) => (
            <section className="plan-card" key={row.key}>
              <div className="plan-card-top">
                <div className="plan-type-cell">
                  <span className={`type-pill ${row.type.tone}`}>{row.type.label}</span>
                  <p>
                    {row.key === 'holiday'
                      ? `OT1 8 ชม. + OT3 3 ชม.`
                      : `${row.type.rate}x${row.type.hours}`}
                  </p>
                </div>
                <div className="plan-hours-cell">
                  <span>จำนวนชั่วโมง</span>
                  <strong>{row.totalHours.toFixed(1)} ชม.</strong>
                </div>
                <label className="plan-days-field">
                  <span>จำนวนวัน</span>
                  <input
                    inputMode="numeric"
                    min="0"
                    step="1"
                    type="number"
                    value={daysByType[row.key]}
                    onChange={(event) =>
                      setDaysByType((prev) => ({
                        ...prev,
                        [row.key]: Math.max(0, Math.floor(numberValue(event.target.value))),
                      }))
                    }
                    />
                  </label>
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppModal>
  )
}

export default memo(PlanModal)
