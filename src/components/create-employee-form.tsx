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
import { Upload, FileText, CheckCircle } from "lucide-react"

const defaultFormData = {
  name: "",
  phone: "",
  dob: "",
  gender: "Male",
  email: "",
  password: "",
  address: "",
  employeeId: "EMP006",
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

export type CreateEmployeeFormInitialData = Partial<typeof defaultFormData>

interface CreateEmployeeFormProps {
  onClose: () => void
  initialData?: CreateEmployeeFormInitialData
  isEditMode?: boolean
}

export function CreateEmployeeForm({ onClose, initialData, isEditMode }: CreateEmployeeFormProps) {
  const t = useTranslations("hrm.employee")
  const [dragActive, setDragActive] = useState<{[key: number]: boolean}>({})
  const [documentPreviews, setDocumentPreviews] = useState<Record<number, string>>({})
  const documentPreviewsRef = useRef(documentPreviews)
  documentPreviewsRef.current = documentPreviews
  const [formData, setFormData] = useState({
    ...defaultFormData,
    ...(initialData ?? {}),
  })

  const branches = [
    { value: "1", label: "Main Branch" },
    { value: "2", label: "Branch Office" },
    { value: "3", label: "Remote Office" },
  ]

  const departments = [
    { value: "1", label: "IT Department" },
    { value: "2", label: "HR Department" },
    { value: "3", label: "Sales Department" },
    { value: "4", label: "Finance Department" },
    { value: "5", label: "Marketing Department" },
  ]

  const designations = [
    { value: "1", label: "Software Engineer" },
    { value: "2", label: "HR Manager" },
    { value: "3", label: "Sales Executive" },
    { value: "4", label: "Accountant" },
    { value: "5", label: "Marketing Specialist" },
    { value: "6", label: "Team Lead" },
    { value: "7", label: "Manager" },
  ]

  const documents = [
    { id: 1, name: "Resume/CV", isRequired: true },
    { id: 2, name: "ID Card Copy", isRequired: true },
    { id: 3, name: "Educational Certificate", isRequired: false },
    { id: 4, name: "Experience Letter", isRequired: false },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDragEnter = (e: React.DragEvent, documentId: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(prev => ({ ...prev, [documentId]: true }))
  }

  const handleDragLeave = (e: React.DragEvent, documentId: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(prev => ({ ...prev, [documentId]: false }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent, documentId: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(prev => ({ ...prev, [documentId]: false }))
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      // Handle the uploaded file here
      console.log(`File uploaded for document ${documentId}:`, files[0])
    }
  }

  const handleDocumentFileChange = (documentId: number, file: File | null) => {
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
    return () => {
      Object.values(documentPreviewsRef.current).forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  const cardClass = isEditMode ? "bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]" : "border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]"
  const headerClass = isEditMode ? "px-5 pt-5 pb-3" : "pb-1 px-3 pt-3"
  const titleClass = isEditMode ? "text-base font-semibold text-foreground" : "text-sm"
  const contentClass = isEditMode ? "space-y-5 px-5 pb-5 pt-0" : "space-y-2 px-3 pb-3 pt-0"
  const gridGap = isEditMode ? "gap-x-6 gap-y-4" : "gap-2"
  const labelClass = isEditMode ? "text-sm font-medium text-muted-foreground" : "text-xs"
  const inputClass = isEditMode ? "h-9 text-sm" : "h-8 text-xs"

  return (
    <form onSubmit={handleSubmit} className={isEditMode ? "space-y-5" : "space-y-3"}>
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isEditMode ? "gap-5" : "gap-3"}`}>
        {/* Personal Detail Card */}
        <Card className={cardClass}>
          <CardHeader className={headerClass}>
            <CardTitle className={titleClass}>{t("personalDetail")}</CardTitle>
          </CardHeader>
          <CardContent className={contentClass}>
            <div className={`grid grid-cols-2 ${gridGap}`}>
              <div className="space-y-1">
                <Label htmlFor="name" className={labelClass}>{t("name")} *</Label>
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
                <Label htmlFor="phone" className={labelClass}>{t("phone")} *</Label>
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
                <Label htmlFor="dob" className={labelClass}>{t("dateOfBirth")} *</Label>
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
                <Label className={labelClass}>{t("gender")} *</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  className="flex flex-row space-x-2"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="Male" id="male" className="h-3 w-3" />
                    <Label htmlFor="male" className={labelClass}>{t("male")}</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="Female" id="female" className="h-3 w-3" />
                    <Label htmlFor="female" className={labelClass}>{t("female")}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className={`grid grid-cols-2 ${gridGap}`}>
              <div className="space-y-1">
                <Label htmlFor="email" className={labelClass}>{t("email")} *</Label>
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
                <Label htmlFor="password" className={labelClass}>{t("password")}{!isEditMode && " *"}</Label>
                <Input
                  id="password"
                  type="password"
                  className={inputClass}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder={t("enterEmployeePassword")}
                  required={!isEditMode}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address" className={labelClass}>{t("address")} *</Label>
              <Textarea
                id="address"
                className={`min-h-[60px] ${isEditMode ? "text-sm" : "text-xs"}`}
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder={t("enterEmployeeAddress")}
                rows={2}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Detail Card */}
        <Card className={cardClass}>
          <CardHeader className={headerClass}>
            <CardTitle className={titleClass}>{t("companyDetail")}</CardTitle>
          </CardHeader>
          <CardContent className={contentClass}>
            <div className="space-y-1">
              <Label htmlFor="employeeId" className={labelClass}>{t("employeeId")}</Label>
              <Input
                id="employeeId"
                className={`bg-muted ${inputClass}`}
                value={formData.employeeId}
                disabled
              />
            </div>

            <div className={`grid grid-cols-2 ${gridGap}`}>
              <div className="space-y-1">
                <Label className={labelClass}>{t("selectBranch")} *</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) => handleInputChange("branchId", value)}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t("selectBranch")} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.value} value={branch.value}>
                        {branch.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("createBranchHere")} <a href="#" className="font-medium text-primary">{t("createBranch")}</a>
                </p>
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>{t("selectDepartment")} *</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => handleInputChange("departmentId", value)}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t("selectDepartment")} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.value} value={department.value}>
                        {department.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("createDepartmentHere")} <a href="#" className="font-medium text-primary">{t("createDepartment")}</a>
                </p>
              </div>
            </div>

            <div className={`grid grid-cols-2 ${gridGap}`}>
              <div className="space-y-1">
                <Label className={labelClass}>{t("selectDesignation")} *</Label>
                <Select
                  value={formData.designationId}
                  onValueChange={(value) => handleInputChange("designationId", value)}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder={t("selectDesignation")} />
                  </SelectTrigger>
                  <SelectContent>
                    {designations.map((designation) => (
                      <SelectItem key={designation.value} value={designation.value}>
                        {designation.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("createDesignationHere")} <a href="#" className="font-medium text-primary">{t("createDesignation")}</a>
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="companyDoj" className={labelClass}>{t("companyDateOfJoining")} *</Label>
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

      {/* Document and Bank Account Section */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isEditMode ? "gap-5" : "gap-3"}`}>
        {/* Document Card */}
        <Card className={cardClass}>
          <CardHeader className={headerClass}>
            <CardTitle className={`flex items-center gap-2 ${titleClass}`}>
              <FileText className="h-4 w-4" />
              {t("document")}
            </CardTitle>
          </CardHeader>
          <CardContent className={contentClass}>
            {isEditMode ? (
              <div className="space-y-4">
                {documents.map((document) => (
                  <div key={document.id} className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="shrink-0 sm:w-1/3 sm:pt-1.5">
                      <Label className={`font-medium ${labelClass}`}>
                        {document.name}
                        {document.isRequired && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <label
                        htmlFor={`document-${document.id}`}
                        className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 cursor-pointer transition-colors w-fit"
                      >
                        <Upload className="h-4 w-4" />
                        {t("chooseFileHere")}
                      </label>
                      <Input
                        id={`document-${document.id}`}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        required={document.isRequired}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          handleDocumentFileChange(document.id, file ?? null)
                        }}
                      />
                      <div className="choose-file-img">
                        {documentPreviews[document.id] && (
                          <img
                            src={documentPreviews[document.id]}
                            alt={`Preview ${document.name}`}
                            className="rounded border border-gray-200 object-contain max-h-32 w-auto"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((document) => (
                  <div key={document.id} className="space-y-1">
                    <Label className={`font-medium ${labelClass}`}>
                      {document.name}
                      {document.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <div className="relative">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor={`document-${document.id}`}
                          className={`flex flex-col items-center justify-center w-full h-16 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            dragActive[document.id]
                              ? 'border-primary bg-primary/10'
                              : 'border-muted-foreground/25 bg-muted/5 hover:bg-muted/10'
                          }`}
                          onDragEnter={(e) => handleDragEnter(e, document.id)}
                          onDragLeave={(e) => handleDragLeave(e, document.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, document.id)}
                        >
                          <div className="flex flex-col items-center justify-center py-2">
                            <Upload className="w-4 h-4 mb-1 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              <span className="font-semibold">Click to upload</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PDF, DOC (MAX. 10MB)
                            </p>
                          </div>
                          <Input
                            id={`document-${document.id}`}
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            required={document.isRequired}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Account Detail Card */}
        <Card className={cardClass}>
          <CardHeader className={headerClass}>
            <CardTitle className={titleClass}>
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

      {/* Submit Buttons */}
      <div className={`flex justify-end gap-2 ${isEditMode ? "pt-4" : "pt-1"}`}>
        <Button type="button" variant="outline" size="sm" className={`shadow-none ${isEditMode ? "h-9 px-4 text-sm" : "h-8 px-3 text-xs"}`} onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button type="submit" variant="blue" size="sm" className={`shadow-none ${isEditMode ? "h-9 px-4 text-sm" : "h-8 px-3 text-xs"}`}>
          {isEditMode ? t("updateEmployee") : t("createEmployee")}
        </Button>
      </div>
    </form>
  )
}