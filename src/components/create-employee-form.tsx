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
  documents?: {
    documentTypeId: string
    filePath: string | null
    fileName: string | null
  }[]
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
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string; branchName: string | null }[]>([])
  const [designations, setDesignations] = useState<{ id: string; name: string; departmentName: string; branchName: string | null }[]>([])
  const [documentTypes, setDocumentTypes] = useState<{ id: string; name: string; requiredField: boolean }[]>([])
  const [existingDocuments, setExistingDocuments] = useState<Record<string, { filePath: string; fileName: string | null } | null>>({})
  const [removedDocuments, setRemovedDocuments] = useState<Record<string, boolean>>({})

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

  useEffect(() => {
    if (!isEditMode || !initialData?.documents) return

    const map: Record<string, { filePath: string; fileName: string | null } | null> = {}
    initialData.documents.forEach(doc => {
      if (doc.filePath) {
        map[doc.documentTypeId] = {
          filePath: doc.filePath,
          fileName: doc.fileName,
        }
      }
    })
    setExistingDocuments(map)
  }, [isEditMode, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (documentTypes.length > 0) {
      const missingRequired = documentTypes.filter((dt) => {
        // Jika required, kita harus cek apakah ada file yang valid
        if (!dt.requiredField) return false

        // 1. Cek apakah ada file baru yang diupload
        const hasNewFile = !!documentFiles[dt.id]

        // 2. Cek apakah ada file existing (untuk mode edit)
        // Dan pastikan file existing itu TIDAK ditandai untuk dihapus
        const hasExistingFile = !!existingDocuments[dt.id] && !removedDocuments[dt.id]

        // Valid jika ada file baru ATAU ada file lama yang masih aktif
        const isValid = hasNewFile || hasExistingFile

        return !isValid
      })

      if (missingRequired.length > 0) {
        const missingNames = missingRequired.map((dt) => dt.name).join(", ")
        toast.error(`Harap upload dokumen wajib: ${missingNames}`)
        return
      }
    }

    const submitFormData = new FormData()

    if (isEditMode && formData.employeeId) {
      submitFormData.append("employeeId", formData.employeeId)
    }

    submitFormData.append("name", formData.name)
    submitFormData.append("email", formData.email)
    submitFormData.append("phone", formData.phone)
    submitFormData.append("dateOfBirth", formData.dob)
    submitFormData.append("gender", formData.gender)
    submitFormData.append("address", formData.address)
    submitFormData.append(
      "branch",
      branches.find((b) => b.id === formData.branchId)?.name ?? "",
    )
    submitFormData.append(
      "department",
      departments.find((d) => d.id === formData.departmentId)?.name ?? "",
    )
    submitFormData.append(
      "designation",
      designations.find((d) => d.id === formData.designationId)?.name ?? "",
    )
    submitFormData.append("dateOfJoining", formData.companyDoj)
    if (formData.accountHolderName) {
      submitFormData.append("accountHolderName", formData.accountHolderName)
    }
    if (formData.accountNumber) {
      submitFormData.append("accountNumber", formData.accountNumber)
    }
    if (formData.bankName) {
      submitFormData.append("bankName", formData.bankName)
    }
    if (formData.bankIdentifierCode) {
      submitFormData.append("bankIdentifierCode", formData.bankIdentifierCode)
    }
    if (formData.branchLocation) {
      submitFormData.append("branchLocation", formData.branchLocation)
    }
    if (formData.taxPayerId) {
      submitFormData.append("taxPayerId", formData.taxPayerId)
    }
    if (formData.password) {
      submitFormData.append("password", formData.password)
    }

    for (const dt of documentTypes) {
      const file = documentFiles[dt.id]
      if (file) {
        submitFormData.append(`document_${dt.id}`, file)
      } else if (isEditMode && removedDocuments[dt.id]) {
        submitFormData.append(`document_${dt.id}_removed`, "true")
      }
    }

    const url =
      isEditMode && employeeIdForEdit
        ? `/api/employees/${employeeIdForEdit}`
        : "/api/employees"
    const method = isEditMode ? "PUT" : "POST"

    try {
      const res = await fetch(url, {
        method,
        body: submitFormData,
      })

      const json = await res.json().catch(() => null)

      if (!json || !json.success) {
        const message =
          json?.message ||
          (isEditMode ? "Gagal memperbarui data karyawan" : "Gagal menyimpan data karyawan")

        toast.error(message)
        console.error("Failed to submit employee:", json?.message)
        return
      }

      toast.success(
        isEditMode ? "Data karyawan berhasil diperbarui" : "Data karyawan berhasil disimpan",
      )

      onClose()
    } catch (error) {
      console.error("Error submitting employee:", error)
      toast.error(
        isEditMode
          ? "Terjadi kesalahan saat memperbarui data karyawan"
          : "Terjadi kesalahan saat menyimpan data karyawan",
      )
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
        const [branchRes, departmentRes, designationRes, documentTypeRes] = await Promise.all([
          fetch("/api/branches"),
          fetch("/api/departments"),
          fetch("/api/designations"),
          fetch("/api/document-types"),
        ])

        const [branchJson, departmentJson, designationJson, documentTypeJson] = await Promise.all([
          branchRes.json().catch(() => null),
          departmentRes.json().catch(() => null),
          designationRes.json().catch(() => null),
          documentTypeRes.json().catch(() => null),
        ])

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
              id: String(d.name ? d.id : d.id),
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

        if (documentTypeJson?.success && Array.isArray(documentTypeJson.data)) {
          setDocumentTypes(
            documentTypeJson.data.map((dt: any) => ({
              id: String(dt.id),
              name: String(dt.name ?? ""),
              requiredField: Boolean(dt.requiredField),
            })),
          )
        } else {
          console.error("Failed to load document types:", documentTypeJson?.message)
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
                Tidak ada document type yang terdaftar. Tambahkan terlebih dahulu di menu Setup &gt; Document Type.
              </p>
            ) : (
              <div className="space-y-4">
                {documentTypes.map(dt => {
                  const existing = existingDocuments[dt.id] ?? null
                  const existingPath = existing?.filePath ?? null
                  const existingName = existing?.fileName ?? existingPath?.split("/").pop() ?? null
                  const previewUrl = documentPreviews[dt.id]
                  const isRemoved = removedDocuments[dt.id] ?? false
                  const inputId = `document-${dt.id}`

                  return (
                    <div
                      key={dt.id}
                      className="flex flex-col sm:flex-row sm:items-start gap-3"
                    >
                      <div className="shrink-0 sm:w-1/3 sm:pt-1.5">
                        <Label className={`font-medium ${labelClass}`}>
                          {dt.name}
                          {dt.requiredField && (
                            <span className="ml-0.5 text-red-500">*</span>
                          )}
                        </Label>
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        {!previewUrl && existingPath && !isRemoved && (
                          <>
                            {/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(existingPath) ? (
                              <div className="flex items-center gap-3">
                                <div className="relative inline-block">
                                  <img
                                    src={existingPath}
                                    alt={dt.name}
                                    className="rounded border border-gray-200 object-contain max-h-32 w-auto bg-muted"
                                  />
                                  <div className="absolute right-1 top-1 flex items-center gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground bg-background/70"
                                      onClick={() => {
                                        window.open(existingPath, "_blank", "noopener,noreferrer")
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-red-500 hover:text-red-600 bg-background/70"
                                      onClick={() => {
                                        setRemovedDocuments(prev => ({ ...prev, [dt.id]: true }))
                                        // setExistingDocuments(prev => ({ ...prev, [dt.id]: null })) // Keep existing data for restore if needed, just mark removed
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs truncate max-w-[200px] font-medium">
                                    {existingName}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    Existing File
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between rounded-md border border-dashed px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <div className="flex flex-col">
                                    <span className="text-xs truncate max-w-[200px] font-medium">
                                      {existingName}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      Existing File
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground"
                                    onClick={() => {
                                      window.open(existingPath, "_blank", "noopener,noreferrer")
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-600"
                                    onClick={() => {
                                      setRemovedDocuments(prev => ({ ...prev, [dt.id]: true }))
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        {/* Restore button if removed but not replaced yet */}
                        {isRemoved && !documentFiles[dt.id] && (
                          <div className="flex items-center gap-2 mb-2 p-2 bg-red-50 rounded border border-red-100">
                             <span className="text-xs text-red-600">Dokumen lama akan dihapus.</span>
                             <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => setRemovedDocuments(prev => ({ ...prev, [dt.id]: false }))}
                             >
                               Batal Hapus
                             </Button>
                          </div>
                        )}
                        {!previewUrl && (!existingPath || isRemoved) && (
                          <div className="relative">
                            <div className="flex items-center justify-center w-full">
                              <label
                                htmlFor={inputId}
                                className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                  dragActive[dt.id]
                                    ? "border-primary bg-primary/10"
                                    : "border-muted-foreground/25 bg-muted/5 hover:bg-muted/10"
                                }`}
                                onDragEnter={(e) => handleDragEnter(e, dt.id)}
                                onDragLeave={(e) => handleDragLeave(e, dt.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, dt.id)}
                              >
                                {documentFiles[dt.id] ? (
                                  <div className="flex items-center gap-2 px-3 w-full">
                                    <FileText className="w-8 h-8 text-blue-500 shrink-0" />
                                    <div className="flex flex-col items-start min-w-0 flex-1">
                                      <p className="text-sm font-medium text-foreground truncate w-full max-w-[200px]">
                                        {documentFiles[dt.id]?.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {(documentFiles[dt.id]?.size ?? 0) / 1024 < 1024
                                          ? `${((documentFiles[dt.id]?.size ?? 0) / 1024).toFixed(1)} KB`
                                          : `${((documentFiles[dt.id]?.size ?? 0) / (1024 * 1024)).toFixed(2)} MB`}
                                      </p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 ml-2 text-muted-foreground hover:text-red-500 shrink-0 z-10"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        // Clear file input value to allow re-selecting same file
                                        const input = document.getElementById(inputId) as HTMLInputElement
                                        if (input) input.value = ''
                                        handleDocumentFileChange(dt.id, null)
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-2">
                                    <Upload className="w-4 h-4 mb-1 text-blue-500" />
                                    <p className="text-xs text-muted-foreground">
                                      PDF, DOC, JPG, PNG (MAX. 10MB)
                                    </p>
                                  </div>
                                )}
                                <Input
                                  id={inputId}
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null
                                    setRemovedDocuments(prev => ({ ...prev, [dt.id]: false }))
                                    handleDocumentFileChange(dt.id, file)
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        )}
                        {previewUrl && (
                          <div className="relative inline-block">
                            <img
                              src={previewUrl}
                              alt={dt.name}
                              className="rounded border border-gray-200 object-contain max-h-32 w-auto"
                            />
                            <div className="absolute right-1 top-1 flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground bg-background/70"
                                onClick={() => {
                                  window.open(previewUrl, "_blank", "noopener,noreferrer")
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-600 bg-background/70"
                                onClick={() => {
                                  handleDocumentFileChange(dt.id, null)
                                  setDocumentPreviews(prev => {
                                    const next = { ...prev }
                                    if (next[dt.id]) URL.revokeObjectURL(next[dt.id])
                                    delete next[dt.id]
                                    return next
                                  })
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
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
