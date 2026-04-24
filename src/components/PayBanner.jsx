import { formatMoney } from '../payroll'
import '../styles/banner.css'

export default function PayBanner({ payroll, isPrivacyMode, onTogglePrivacy }) {
  const displayMoney = (amount) => (isPrivacyMode ? '****' : formatMoney(amount))

  return (
    <section className="pay-banner animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="banner-label" style={{ display: 'inline-block', margin: 0 }}>คาดว่าจะได้รับ</span>
        <button 
          onClick={onTogglePrivacy} 
          style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer', padding: 0, display: 'flex' }}
          aria-label={isPrivacyMode ? 'แสดงจำนวนเงิน' : 'ซ่อนจำนวนเงิน'}
        >
          {isPrivacyMode ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          )}
        </button>
      </div>
      <strong className="banner-amount">{displayMoney(payroll.expectedPay)}</strong>
      <p className="banner-details">
        OT <span>{payroll.totals.hours.toFixed(1)} ชม.</span> ได้เพิ่ม{' '}
        <span>{displayMoney(payroll.totals.ot)}</span> ค่าข้าว{' '}
        <span>{displayMoney(payroll.mealAllowance)}</span> หักรวม{' '}
        <span>{displayMoney(payroll.totalDeductions)}</span>
      </p>
    </section>
  )
}
