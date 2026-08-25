import './crm-theme.css'

export const metadata = {
  title: 'CRM | RKG Properties and Constructions',
  robots: { index: false, follow: false },
}

export default function CrmLayout({ children }) {
  return (
    <div className="crm-scope min-h-screen py-6 sm:py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="crm-shell-card rounded-xl overflow-visible">
          <div className="p-4 sm:p-6 overflow-visible">{children}</div>
        </div>
      </div>
    </div>
  )
}

