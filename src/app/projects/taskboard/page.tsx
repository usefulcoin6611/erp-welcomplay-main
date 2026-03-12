import { redirect } from "next/navigation"

/** Redirect ke URL kanonik tanpa prefix /projects (reference-erp: /taskboard) */
export default function TaskboardRedirectPage() {
  redirect("/taskboard")
}
