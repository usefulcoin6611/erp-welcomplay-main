import { redirect } from "next/navigation"

/** Redirect ke URL kanonik tanpa prefix /projects (reference-erp: /timesheet-list) */
export default function TimesheetListRedirectPage() {
  redirect("/timesheet-list")
}
