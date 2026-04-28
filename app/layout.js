import './globals.css'

export const metadata = {
  title: 'TaskFlow',
  description: 'Smart task management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
