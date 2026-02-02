import { redirect } from "next/navigation"

/**
 * Route Projects sekarang hanya /projects. Redirect ke /projects.
 */
export default function ProjectIndexPage() {
  redirect("/projects")
}
