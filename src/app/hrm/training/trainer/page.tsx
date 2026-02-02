import { redirect } from 'next/navigation'

export default function TrainerRedirect() {
  redirect('/hrm/training?tab=trainer')
}
