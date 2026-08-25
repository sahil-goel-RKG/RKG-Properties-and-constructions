import './admin-theme.css'

export const metadata = {
  title: 'Admin | RKG Properties and Constructions',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }) {
  return <div className="admin-scope min-h-screen">{children}</div>
}
