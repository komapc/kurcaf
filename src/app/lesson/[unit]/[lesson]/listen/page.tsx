import Client from './Client'
import { lessonParams } from '@/lib/staticParams'

export function generateStaticParams() { return lessonParams() }

export default function Page() {
  return <Client />
}
