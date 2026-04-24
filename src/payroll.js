export const STORAGE_KEY = 'work-picker-payroll-v1'
export const STANDARD_PAY_DAYS = 30
export const STANDARD_WORK_HOURS = 8
export const MEAL_ALLOWANCE_PER_OT_DAY = 50

export const otTypes = {
  workday: { label: 'วันทำงาน', rate: 1.5, tone: 'teal' },
  holiday: { label: 'วันหยุด', tone: 'yellow' },
}

export const holidayOtRules = [
  { label: 'OT1', rate: 1, hours: 8 },
  { label: 'OT3', rate: 3, hours: 3 },
]

export const defaultSettings = {
  salary: 10000,
  welfare: 5000,
  diligence: 800,
  otherIncome: 0,
  deductions: 0,
  socialSecurityPercent: 5,
  providentFundPercent: 3,
  periodStart: '',
  periodEnd: '',
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function createDefaultEntries() {
  return [
    {
      id: 'sample-1',
      date: getTodayKey(),
      type: 'workday',
      hours: 2,
      note: 'เคลียร์งานท้ายกะ',
    },
  ]
}

export function formatMoney(value) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)
}

export function formatDateWithWeekday(value) {
  return new Intl.DateTimeFormat('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  }).format(new Date(value))
}

export function numberValue(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function getHourlyRate(settings) {
  return (
    numberValue(settings.salary) /
    (STANDARD_PAY_DAYS * STANDARD_WORK_HOURS)
  )
}

export function getEntryHours(entry) {
  if (entry.type === 'holiday') {
    return holidayOtRules.reduce((sum, rule) => sum + rule.hours, 0)
  }

  return numberValue(entry.hours)
}

export function getEntryAmount(entry, hourlyRate) {
  if (entry.type === 'holiday') {
    return holidayOtRules.reduce(
      (sum, rule) => sum + rule.hours * hourlyRate * rule.rate,
      0,
    )
  }

  const type = otTypes[entry.type] ?? otTypes.workday
  return numberValue(entry.hours) * hourlyRate * type.rate
}

export function getEntryTypeLabel(entry) {
  const type = otTypes[entry.type] ?? otTypes.workday

  if (entry.type === 'holiday') {
    return `${type.label} OT1 8 ชม. + OT3 3 ชม.`
  }

  return `${type.label} x${type.rate}`
}

export function calculatePayroll(settings, entries) {
  const hourlyRate = getHourlyRate(settings)
  const baseSalary = numberValue(settings.salary)
  const totals = entries.reduce(
    (result, entry) => {
      const hours = getEntryHours(entry)
      const amount = getEntryAmount(entry, hourlyRate)

      result.hours += hours
      result.ot += amount
      result.byType[entry.type] = (result.byType[entry.type] ?? 0) + hours

      if (entry.type === 'holiday') {
        holidayOtRules.forEach((rule) => {
          result.holidayBreakdown[rule.label] =
            (result.holidayBreakdown[rule.label] ?? 0) + rule.hours
        })
      }

      return result
    },
    { hours: 0, ot: 0, byType: {}, holidayBreakdown: {} },
  )

  const socialSecurityDeduction =
    baseSalary * (numberValue(settings.socialSecurityPercent) / 100)
  const providentFundDeduction =
    baseSalary * (numberValue(settings.providentFundPercent) / 100)
  const totalDeductions =
    socialSecurityDeduction +
    providentFundDeduction +
    numberValue(settings.deductions)
  const mealAllowance = entries.length * MEAL_ALLOWANCE_PER_OT_DAY
  const expectedPay =
    baseSalary +
    totals.ot +
    mealAllowance +
    numberValue(settings.welfare) +
    numberValue(settings.diligence) +
    numberValue(settings.otherIncome) -
    totalDeductions

  return {
    expectedPay,
    hourlyRate,
    mealAllowance,
    providentFundDeduction,
    socialSecurityDeduction,
    totalDeductions,
    totals,
  }
}
