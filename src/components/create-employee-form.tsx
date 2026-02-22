"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTranslations } from "next-intl"
import { Upload, FileText, CheckCircle, Eye, Trash2, User, Building2, CreditCard } from "lucide-react"
import { toast } from "sonner"

const defaultFormData = {
  name: "",
  phone: "",
  dob: "",
  gender: "Male",
  email: "",
  password: "",
  address: "",
  employeeId: "",
  branchId: "",
  departmentId: "",
  designationId: "",
  companyDoj: "",
  accountHolderName: "",
  accountNumber: "",
  bankName: "",
  bankIdentifierCode: "",
  branchLocation: "",
  taxPayerId: "",
}

export type CreateEmployeeFormInitialData = Partial<typeof defaultFormData> & {
  branch?: string
  department?: string
  designation?: string
}

interface CreateEmployeeFormProps {
  onClose: () => void
  initialData?: CreateEmployeeFormInitialData
  isEditMode?: boolean
  employeeIdForEdit?: string
}

export function CreateEmployeeForm({ onClose, initialData, isEditMode, employeeIdForEdit }: CreateEmployeeFormProps) {
  const t = useTranslations("hrm.employee")
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({})
  const [documentPreviews, setDocumentPreviews] = useState<Record<string, string>>({})
  const documentPreviewsRef = useRef(documentPreviews)
  documentPreviewsRef.current = documentPreviews
  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({})
  const [formData, setFormData] = useState({
    ...defaultFormData,
    ...(initialData ?? {}),
  })
  const [documentTypes, setDocumentTypes] = useState<{ id: string; name: string; requiredField: boolean }[]>([])
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string; branchName: string | null }[]>([])
  const [designations, setDesignations] = useState<{ id: string; name: string; departmentName: string; branchName: string | null }[]>([])

  useEffect(() => {
    if (!isEditMode || !initialData) return

    setFormData(prev => {
      const next = { ...prev }

      if (!next.branchId && initialData.branch && branches.length > 0) {
        const branchMatch = branches.find(b => b.name === initialData.branch)
        if (branchMatch) {
          next.branchId = branchMatch.id
        }
      }

      if (!next.departmentId && initialData.department && departments.length > 0) {
        const departmentMatch = departments.find(d => d.name === initialData.department)
        if (departmentMatch) {
          next.departmentId = departmentMatch.id
        }
      }

      if (!next.designationId && initialData.designation && designations.length > 0) {
        const designationMatch = designations.find(d => d.name === initialData.designation)
        if (designationMatch) {
          next.designationId = designationMatch.id
        }
      }

      return next
    })
  }, [isEditMode, initialData, branches, departments, designations])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const missingRequiredDocuments = documentTypes.filter(
      (dt) => dt.requiredField && !documentFiles[dt.id],
    )

    if (missingRequiredDocuments.length > 0) {
      toast.error("Harap upload semua dokumen yang bertanda *")
      return
    }

    const payload = {
      employeeId: isEditMode ? formData.employeeId : undefined,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dob,
      gender: formData.gender,
      address: formData.address,
      branch: branches.find((b) => b.id === formData.branchId)?.name ?? "",
      department: departments.find((d) => d.id === formData.departmentId)?.name ?? "",
      designation: designations.find((d) => d.id === formData.designationId)?.name ?? "",
      dateOfJoining: formData.companyDoj,
      accountHolderName: formData.accountHolderName,
      accountNumber: formData.accountNumber,
      bankName: formData.bankName,
      bankIdentifierCode: formData.bankIdentifierCode,
      branchLocation: formData.branchLocation,
      taxPayerId: formData.taxPayerId,
      password: formData.password || undefined,
    }

    const url = isEditMode && employeeIdForEdit
      ? `/api/employees/${employeeIdForEdit}`
      : "/api/employees"
    const method = isEditMode ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => null)
      if (!json || !json.success) {
        console.error("Failed to submit employee:", json?.message)
      }
    } catch (error) {
      console.error("Error submitting employee:", error)
    } finally {
      onClose()
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDragEnter = (e: React.DragEvent, documentId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(prev => ({ ...prev, [documentId]: true }))
  }

  const handleDragLeave = (e: React.DragEvent, documentId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(prev => ({ ...prev, [documentId]: false }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent, documentId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(prev => ({ ...prev, [documentId]: false }))

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]

      const input = document.getElementById(`document-${documentId}`) as HTMLInputElement | null
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
      }

      handleDocumentFileChange(documentId, file)
    }
  }

  const handleDocumentFileChange = (documentId: string, file: File | null) => {
    if (file) {
      setDocumentFiles(prev => ({ ...prev, [documentId]: file }))
    } else {
      setDocumentFiles(prev => {
        const next = { ...prev }
        delete next[documentId]
        return next
      })
    }

    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setDocumentPreviews(prev => {
        if (prev[documentId]) URL.revokeObjectURL(prev[documentId])
        return { ...prev, [documentId]: url }
      })
    } else {
      setDocumentPreviews(prev => {
        const next = { ...prev }
        if (next[documentId]) URL.revokeObjectURL(next[documentId])
        delete next[documentId]
        return next
      })
    }
  }

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [documentRes, branchRes, departmentRes, designationRes] = await Promise.all([
          fetch("/api/document-types"),
          fetch("/api/branches"),
          fetch("/api/departments"),
          fetch("/api/designations"),
        ])

        const [documentJson, branchJson, departmentJson, designationJson] = await Promise.all([
          documentRes.json().catch(() => null),
          branchRes.json().catch(() => null),
          departmentRes.json().catch(() => null),
          designationRes.json().catch(() => null),
        ])

        if (documentJson?.success && Array.isArray(documentJson.data)) {
          setDocumentTypes(
            documentJson.data.map((dt: any) => ({
              id: String(dt.id),
              name: String(dt.name ?? ""),
              requiredField: Boolean(dt.requiredField),
            })),
          )
        } else {
          console.error("Failed to load document types:", documentJson?.message)
        }

        if (branchJson?.success && Array.isArray(branchJson.data)) {
          setBranches(
            branchJson.data.map((b: any) => ({
              id: String(b.id),
              name: String(b.name ?? ""),
            })),
          )
        } else {
          console.error("Failed to load branches:", branchJson?.message)
        }

        if (departmentJson?.success && Array.isArray(departmentJson.data)) {
          setDepartments(
            departmentJson.data.map((d: any) => ({
              id: String(d.id),
              name: String(d.name ?? ""),
              branchName: d.branch ? String(d.branch.name ?? "") : null,
            })),
          )
        } else {
          console.error("Failed to load departments:", departmentJson?.message)
        }

        if (designationJson?.success && Array.isArray(designationJson.data)) {
          setDesignations(
            designationJson.data.map((dg: any) => ({
              id: String(dg.id),
              name: String(dg.name ?? ""),
              departmentName: dg.department ? String(dg.department.name ?? "") : "",
              branchName: dg.department?.branch ? String(dg.department.branch.name ?? "") : null,
            })),
          )
        } else {
          console.error("Failed to load designations:", designationJson?.message)
        }
      } catch (error) {
        console.error("Error loading master data for employee form:", error)
      }
    }

    loadMasterData()
  }, [])

  useEffect(() => {
    return () => {
      Object.values(documentPreviewsRef.current).forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  const cardClass = "bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]"
  const headerClass = "px-5 pt-5 pb-3"
  const titleClass = "text-base font-semibold text-foreground"
  const contentClass = "space-y-5 px-5 pb-5 pt-0"
  const gridGap = "gap-x-6 gap-y-4"
  const labelClass = "text-sm font-medium text-muted-foreground"
  const inputClass = "h-9 text-sm"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className={cardClass}>
          <CardHeader className={headerClass}>
            <CardTitle className={`flex items-center gap-2 ${titleClass}`}>
              <User className="h-4 w-4" />
              {t("personalDetail")}
            </CardTitle>
          </CardHeader>
          <CardContent className={contentClass}>
            <div className={`grid grid-cols-2 ${gridGap}`}>
              <div className="space-y-1">
                <Label htmlFor="name" className={labelClass}>
                  {t("name")}
                  <span className="ml-0.5 text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  size={32}
                  className={inputClass}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("enterEmployeeName")}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className={labelClass}>
                  {t("phone")}
                  <span className="ml-0.5 text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  size={32}
                  className={inputClass}
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder={t("enterEmployeePhone")}
                  required
                />
              </div>
            </div>

            <div className={`grid grid-cols-2 ${gridGap}`}>
              <div className="space-y-1">
                <Label htmlFor="dob" className={labelClass}>
                  {t("dateOfBirth")}
                  <span className="ml-0.5 text-red-500">*</span>
                </Label>
                <Input
                  id="dob"
                  type="date"
                  className={inputClass}
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className={labelClass}>
                  {t("gender")}
                  <span className="ml-0.5 text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  className="flex flex-row space-x-3 mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Male" id="male" />
                    <Label htmlFor="male" className={labelClass}>{t("male")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Female" id="female" />
                    <Label htmlFor="female" className={labelClass}>{t("female")}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className={`grid grid-cols-2 ${gridGap}`}>
              <div className="space-y-1">
                <Label htmlFor="email" className={labelClass}>
                  {t("email")}
                  <span className="ml-0.5 text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  className={inputClass}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t("enterEmployeeEmail")}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className={labelClass}>
                  {t("password")}
                  {!isEditMode && <span className="ml-0.5 text-red-500">*</span>}
                </Label>
                <Input
                  id="password"
                  type="password"
                  className={inputClass}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder={
                    isEditMode
                      ? "Isi hanya jika ingin mengganti password"
                      : t("enterEmployeePassword")
                  }
                  required={!isEditMode}
                />
                {isEditMode && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Biarkan kosong jika tidak ingin mengganti password.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address" className={labelClass}>
                {t("address")}
                <span className="ml-0.5 text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                className="min-h-[60px] text-sm"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder={t("enterEmployeeAddress")}
                rows={2}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className={headerClass}>
            <CardTitle className={`flex items-center gap-2 ${titleClass}`}>
              <Building2 className="h-4 w-4" />
              {t("companyDetail")}
            </CardTitle>
          </CardHeader>
          <CardContent className={contentClass}>
            <div className="space-y-1">
              <Label htmlFor="employeeId" className={labelClass}>{t("employeeId")}</Label>
              <Input
                id="employeeId"
                className={`bg-muted ${inputClass}`}
                value={formData.employeeId || (isEditMode ? "" : "AUTO")}
                disabled
              />
            </div>

            <div className={`grid grid-cols-2 ${gridGap}`}>
              <div className="space-y-1">
                <Label className={labelClass}>
                  {t("selectBranch")}
                  <span className="ml-0.5 text-red-500">*</span>
                </Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) => handleInputChange("branchId", value)}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t("selectBranch")} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("createBranchHere")}{" "}
                  <a href="/hrm/setup/branch" className="font-medium text-primary">
                    {t("createBranch")}
                  </a>
                </p>
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>
                  {t("selectDepartment")}
                  <span className="ml-0.5 text-red-500">*</span>
                </Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => handleInputChange("departmentId", value)}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t("selectDepartment")} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("createDepartmentHere")}{" "}
                  <a href="/hrm/setup/department" className="font-medium text-primary">
                    {t("createDepartment")}
                  </a>
                </p>
              </div>
            </div>

            <div className={`grid grid-cols-2 ${gridGap}`}>
              <div className="space-y-1">
                <Label className={labelClass}>
                  {t("selectDesignation")}
                  <span className="ml-0.5 text-red-500">*</span>
                </Label>
                <Select
                  value={formData.designationId}
                  onValueChange={(value) => handleInputChange("designationId", value)}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t("selectDesignation")} />
                  </SelectTrigger>
                  <SelectContent>
                    {designations.map((designation) => (
                      <SelectItem key={designation.id} value={designation.id}>
                        {designation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("createDesignationHere")}{" "}
                  <a href="/hrm/setup/designation" className="font-medium text-primary">
                    {t("createDesignation")}
                  </a>
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="companyDoj" className={labelClass}>
                  {t("companyDateOfJoining")}
                  <span className="ml-0.5 text-red-500">*</span>
                </Label>
                <Input
                  id="companyDoj"
                  type="date"
                  className={inputClass}
                  value={formData.companyDoj}
                  onChange={(e) => handleInputChange("companyDoj", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className={cardClass}>
          <CardHeader className={headerClass}>
            <CardTitle className={`flex items-center gap-2 ${titleClass}`}>
              <FileText className="h-4 w-4" />
              {t("document")}
            </CardTitle>
          </CardHeader>
          <CardContent className={contentClass}>
            {documentTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No document types found. Configure them in HRM Setup &gt; Document Type.
              </p>
            ) : (
              <div className="space-y-4">
                {documentTypes.map((document) => (
                  <div key={document.id} className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="shrink-0 sm:w-1/3 sm:pt-1.5">
                      <Label className={`font-medium ${labelClass}`}>
                        {document.name}
                        {document.requiredField && (
                          <span className="ml-1 text-xs text-red-500">*</span>
                        )}
                      </Label>
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      {!documentPreviews[document.id] && (
                        <div className="relative">
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor={`document-${document.id}`}
                              className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                dragActive[document.id]
                                  ? "border-primary bg-primary/10"
                                  : "border-muted-foreground/25 bg-muted/5 hover:bg-muted/10"
                              }`}
                              onDragEnter={(e) => handleDragEnter(e, document.id)}
                              onDragLeave={(e) => handleDragLeave(e, document.id)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, document.id)}
                            >
                              <div className="flex flex-col items-center justify-center py-2">
                                <Upload className="w-4 h-4 mb-1 text-blue-500" />
                                <p className="text-xs text-muted-foreground">
                                  PDF, DOC, JPG, PNG (MAX. 10MB)
                                </p>
                              </div>
                              <Input
                                id={`document-${document.id}`}
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  handleDocumentFileChange(document.id, file ?? null)
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      )}
                      {documentPreviews[document.id] && (
                        <div className="relative inline-block">
                          <img
                            src={documentPreviews[document.id]}
                            alt={`Preview ${document.name}`}
                            className="rounded border border-gray-200 object-contain max-h-32 w-auto"
                          />
                          <div className="absolute right-1 top-1 flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground bg-background/70"
                              onClick={() => {
                                const url = documentPreviews[document.id]
                                if (url) {
                                  window.open(url, "_blank", "noopener,noreferrer")
                                }
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-600 bg-background/70"
                              onClick={() => handleDocumentFileChange(document.id, null)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className={headerClass}>
            <CardTitle className={`flex items-center gap-2 ${titleClass}`}>
              <CreditCard className="h-4 w-4" />
              {t("bankAccountDetail")}
            </CardTitle>
          </CardHeader>
          <CardContent className={contentClass}>
            <div className={`grid grid-cols-2 ${gridGap}`}>
              <div className="space-y-1">
                <Label htmlFor="accountHolderName" className={labelClass}>{t("accountHolderName")}</Label>
                <Input
                  id="accountHolderName"
                  className={inputClass}
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                  placeholder={t("enterAccountHolderName")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="accountNumber" className={labelClass}>{t("accountNumber")}</Label>
                <Input
                  id="accountNumber"
                  className={inputClass}
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                  placeholder={t("enterAccountNumber")}
                />
              </div>
            </div>

            <div className={`grid grid-cols-2 ${gridGap}`}>
              <div className="space-y-1">
                <Label htmlFor="bankName" className={labelClass}>{t("bankName")}</Label>
                <Input
                  id="bankName"
                  className={inputClass}
                  value={formData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                  placeholder={t("enterBankName")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bankIdentifierCode" className={labelClass}>{t("bankIdentifierCode")}</Label>
                <Input
                  id="bankIdentifierCode"
                  className={inputClass}
                  value={formData.bankIdentifierCode}
                  onChange={(e) => handleInputChange("bankIdentifierCode", e.target.value)}
                  placeholder={t("enterBankIdentifierCode")}
                />
              </div>
            </div>

            <div className={`grid grid-cols-2 ${gridGap}`}>
              <div className="space-y-1">
                <Label htmlFor="branchLocation" className={labelClass}>{t("branchLocation")}</Label>
                <Input
                  id="branchLocation"
                  className={inputClass}
                  value={formData.branchLocation}
                  onChange={(e) => handleInputChange("branchLocation", e.target.value)}
                  placeholder={t("enterBranchLocation")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="taxPayerId" className={labelClass}>{t("taxPayerId")}</Label>
                <Input
                  id="taxPayerId"
                  className={inputClass}
                  value={formData.taxPayerId}
                  onChange={(e) => handleInputChange("taxPayerId", e.target.value)}
                  placeholder={t("enterTaxPayerId")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shadow-none h-9 px-4 text-sm"
          onClick={onClose}
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          variant="blue"
          size="sm"
          className="shadow-none h-9 px-4 text-sm"
        >
          {isEditMode ? t("updateEmployee") : t("createEmployee")}
        </Button>
      </div>
    </form>
  )
}
