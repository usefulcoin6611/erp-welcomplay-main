import { redirect } from "next/navigation"

/** Redirect ke URL kanonik tanpa prefix /projects (reference-erp: /calendar) */
export default function CalendarRedirectPage() {
  redirect("/calendar")
}
