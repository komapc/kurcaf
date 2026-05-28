import Client from './Client'

export function generateStaticParams() {
  return Array.from({ length: 50 }, (_, i) => ({ unit: String(i + 1) }))
}

export default function Page() {
  return <Client />
}
