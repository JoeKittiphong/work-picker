export const STORAGE_KEY = 'work-picker-payroll-v1'
export const STANDARD_PAY_DAYS = 30
export const STANDARD_WORK_HOURS = 8
export const MEAL_ALLOWANCE_PER_OT_DAY = 50
export const MORNING_MEAL_ALLOWANCE = 120

export const otTypes = {
  workday: { label: 'วันทำงาน', rate: 1.5, tone: 'green' },
  ot2015: { label: '20.15', rate: 1.5, hours: 3, tone: 'green' },
  ot2215: { label: '22.15', rate: 1.5, hours: 5, tone: 'green' },
  ot0015: { label: '00.15', rate: 1.5, hours: 7, tone: 'green' },
  morning: { label: 'morning', rate: 1.5, hours: 13, tone: 'yellow' },
  holiday: { label: 'วันหยุด', tone: 'red' },
}

export const selectableOtKeys = ['ot2015', 'ot2215', 'ot0015', 'morning', 'holiday']

export const holidayOtRules = [
  { label: 'OT1', rate: 1, hours: 8 },
  { label: 'OT3', rate: 3, hours: 3 },
]

export const defaultSettings = {
  salary: 12000,
  welfare: 4000,
  diligence: 1000,
  position: 0,
  otherIncome: 0,
  deductions: 0,
  socialSecurityPercent: 5,
  providentFundPercent: 0,
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
      hours: 3,
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

export function getLatestEntryDate(entries) {
  return entries.reduce((latest, entry) => {
    if (!latest || entry.date > latest) return entry.date
    return latest
  }, '')
}

export function isEntryWithinRange(entry, startDate, endDate) {
  if (startDate && entry.date < startDate) return false
  if (endDate && entry.date > endDate) return false
  return true
}

export function filterEntriesByDateRange(entries, startDate, endDate) {
  return entries.filter((entry) => isEntryWithinRange(entry, startDate, endDate))
}

export function getMealAllowanceForEntry(entry) {
  if (entry.type === 'morning') {
    return MORNING_MEAL_ALLOWANCE
  }

  return MEAL_ALLOWANCE_PER_OT_DAY
}

export function getHourlyRate(settings) {
  return getBaseSalary(settings) / (STANDARD_PAY_DAYS * STANDARD_WORK_HOURS)
}

export function getBaseSalary(settings) {
  return numberValue(settings.salary) + numberValue(settings.position)
}

export function getEntryHours(entry) {
  if (entry.type === 'holiday') {
    return holidayOtRules.reduce((sum, rule) => sum + rule.hours, 0)
  }

  const type = otTypes[entry.type] ?? otTypes.workday
  if (typeof type.hours === 'number') {
    return type.hours
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
  const hours = typeof type.hours === 'number' ? type.hours : numberValue(entry.hours)
  return hours * hourlyRate * (type.rate ?? 1.5)
}

export function getEntryTypeLabel(entry) {
  const type = otTypes[entry.type] ?? otTypes.workday

  if (entry.type === 'holiday') {
    return `${type.label} OT1 8 ชม. + OT3 3 ชม.`
  }

  if (typeof type.hours === 'number' && type.rate) {
    return `${type.label} - ${type.rate}x${type.hours}`
  }

  return `${type.label} x${type.rate}`
}

export function calculatePayroll(settings, entries) {
  const hourlyRate = getHourlyRate(settings)
  const baseSalary = getBaseSalary(settings)
  const totals = entries.reduce(
    (result, entry) => {
      const hours = getEntryHours(entry)
      const amount = getEntryAmount(entry, hourlyRate)

      result.hours += hours
      result.ot += amount
      result.byType[entry.type] = (result.byType[entry.type] ?? 0) + hours

      if (entry.type === 'morning') {
        return result
      }

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
  const mealAllowance = entries.reduce(
    (sum, entry) => sum + getMealAllowanceForEntry(entry),
    0,
  )
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
