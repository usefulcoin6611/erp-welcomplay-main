import { redirect } from "next/navigation"

/** Redirect ke URL kanonik tanpa prefix /projects (reference-erp: /project_report) */
export default function ProjectReportRedirectPage() {
  redirect("/project_report")
}
