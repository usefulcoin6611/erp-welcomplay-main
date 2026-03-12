import { redirect } from 'next/navigation'

export default function GoalTrackingRedirect() {
  redirect('/hrm/performance?tab=goal-tracking')
}
