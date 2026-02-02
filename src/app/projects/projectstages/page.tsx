import { redirect } from "next/navigation"

/** Redirect ke URL kanonik tanpa prefix /projects (reference-erp: /projectstages) */
export default function ProjectstagesRedirectPage() {
  redirect("/projectstages")
}
