import { redirect } from "next/navigation"

/** Redirect ke URL kanonik tanpa prefix /projects (reference-erp: /bugs-report) */
export default function BugsReportRedirectPage() {
  redirect("/bugs-report")
}
