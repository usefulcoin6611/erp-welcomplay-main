/**
 * Seed access profiles per branch with permissions aligned to:
 * Staff, CRM, Project, HRM, Account, POS
 * Uses same module/action logic as /access-profiles page and REFERENCE_PERMISSIONS.
 */

import { REFERENCE_PERMISSIONS } from "../../src/lib/reference-permissions";

const ACTIONS = [
  "view", "add", "move", "manage", "create", "edit", "delete", "show", "send",
  "create payment", "delete payment", "income", "expense", "income vs expense",
  "loss & profit", "tax", "invoice", "bill", "duplicate", "balance sheet",
  "ledger", "trial balance", "convert", "copy",
];

const STAFF_MODULES = [
  "user", "role", "client", "product & service", "constant unit", "constant tax",
  "constant category", "zoom meeting", "company settings", "permission", "language",
];

const CRM_MODULES = [
  "crm dashboard", "lead", "convert", "pipeline", "lead stage", "source", "label",
  "lead email", "lead call", "deal", "stage", "task", "form builder", "form response",
  "form field", "contract", "contract type",
];

const PROJECT_MODULES = [
  "project dashboard", "project", "milestone", "grant chart", "project stage",
  "timesheet", "project expense", "project task", "activity", "CRM activity",
  "project task stage", "bug report", "bug status",
];

const HRM_MODULES = [
  "hrm dashboard", "employee", "employee profile", "department", "designation", "branch",
  "document type", "document", "payslip type", "allowance", "commission", "allowance option",
  "loan option", "deduction option", "loan", "saturation deduction", "other payment", "overtime",
  "set salary", "pay slip", "company policy", "appraisal", "goal tracking", "goal type",
  "indicator", "event", "meeting", "training", "trainer", "training type", "award", "award type",
  "resignation", "travel", "promotion", "complaint", "warning", "termination", "termination type",
  "job application", "job application note", "job onBoard", "job category", "job", "job stage",
  "custom question", "interview schedule", "career", "estimation", "holiday", "transfer",
  "announcement", "leave", "leave type", "attendance",
];

const ACCOUNT_MODULES = [
  "account dashboard", "proposal", "invoice", "bill", "revenue", "payment",
  "proposal product", "invoice product", "bill product", "goal", "credit note", "debit note",
  "bank account", "bank transfer", "transaction", "customer", "vender", "constant custom field",
  "assets", "chart of account", "journal entry", "report",
];

const POS_MODULES = [
  "pos dashboard", "warehouse", "quotation", "purchase", "pos", "barcode",
];

const lookup = new Map<string, string>(
  (REFERENCE_PERMISSIONS as readonly string[]).map((p) => [p.toLowerCase(), p])
);

function buildPermissionsForModules(modules: string[]): string[] {
  const out: string[] = [];
  for (const moduleLabel of modules) {
    for (const action of ACTIONS) {
      const key = `${action} ${moduleLabel}`.toLowerCase();
      const exact = lookup.get(key);
      if (exact) out.push(exact);
    }
  }
  return [...new Set(out)];
}

const STAFF_PERMISSIONS = buildPermissionsForModules(STAFF_MODULES);
const CRM_PERMISSIONS = buildPermissionsForModules(CRM_MODULES);
const PROJECT_PERMISSIONS = buildPermissionsForModules(PROJECT_MODULES);
const HRM_PERMISSIONS = buildPermissionsForModules(HRM_MODULES);
const ACCOUNT_PERMISSIONS = buildPermissionsForModules(ACCOUNT_MODULES);
const POS_PERMISSIONS = buildPermissionsForModules(POS_MODULES);

const PROFILES: { name: string; permissions: string[] }[] = [
  { name: "Staff", permissions: STAFF_PERMISSIONS },
  { name: "CRM", permissions: CRM_PERMISSIONS },
  { name: "Project", permissions: PROJECT_PERMISSIONS },
  { name: "HRM", permissions: HRM_PERMISSIONS },
  { name: "Account", permissions: ACCOUNT_PERMISSIONS },
  { name: "POS", permissions: POS_PERMISSIONS },
];

export async function seedAccessProfiles(prisma: any) {
  console.log("Seeding Access Profiles...");

  const branches = await prisma.branch.findMany({ select: { id: true, name: true } });
  if (!branches.length) {
    console.warn("No branches found; skipping access profiles seeding.");
    return;
  }

  let created = 0;
  for (const branch of branches) {
    for (const profile of PROFILES) {
      const existing = await prisma.accessProfile.findFirst({
        where: { name: profile.name, branchId: branch.id },
      });
      if (!existing) {
        await prisma.accessProfile.create({
          data: {
            name: profile.name,
            branchId: branch.id,
            permissions: profile.permissions,
            description: `Access profile: ${profile.name} (${branch.name})`,
          },
        });
        created++;
        console.log(`  Access profile created: ${profile.name} @ ${branch.name}`);
      }
    }
  }

  console.log(`Access Profiles seeding completed. New records: ${created}`);
}
