"use client"

import { useState } from "react"
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

interface CreateEmployeeFormProps {
  onClose: () => void
}

export function CreateEmployeeForm({ onClose }: CreateEmployeeFormProps) {
  const t = useTranslations("hrm.employee")
  const [dragActive, setDragActive] = useState<{[key: number]: boolean}>({})
  const [formData, setFormData] = useState({
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Personal Detail Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="text-sm">{t("personalDetail")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3 pt-0">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">{t("name")} *</Label>
                <Input
                  id="name"
                  size={32}
                  className="h-8 text-xs"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("enterEmployeeName")}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs">{t("phone")} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  size={32}
                  className="h-8 text-xs"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder={t("enterEmployeePhone")}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="dob" className="text-xs">{t("dateOfBirth")} *</Label>
                <Input
                  id="dob"
                  type="date"
                  className="h-8 text-xs"
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("gender")} *</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  className="flex flex-row space-x-2"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="Male" id="male" className="h-3 w-3" />
                    <Label htmlFor="male" className="text-xs">{t("male")}</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="Female" id="female" className="h-3 w-3" />
                    <Label htmlFor="female" className="text-xs">{t("female")}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">{t("email")} *</Label>
                <Input
                  id="email"
                  type="email"
                  className="h-8 text-xs"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t("enterEmployeeEmail")}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs">{t("password")} *</Label>
                <Input
                  id="password"
                  type="password"
                  className="h-8 text-xs"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder={t("enterEmployeePassword")}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address" className="text-xs">{t("address")} *</Label>
              <Textarea
                id="address"
                className="text-xs min-h-[60px]"
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
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="text-sm">{t("companyDetail")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3 pt-0">
            <div className="space-y-1">
              <Label htmlFor="employeeId" className="text-xs">{t("employeeId")}</Label>
              <Input
                id="employeeId"
                className="bg-muted h-8 text-xs"
                value={formData.employeeId}
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{t("selectBranch")} *</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) => handleInputChange("branchId", value)}
                >
                  <SelectTrigger className="h-8 text-xs">
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
                <p className="text-[10px] text-muted-foreground">
                  {t("createBranchHere")} <a href="#" className="font-medium text-primary">{t("createBranch")}</a>
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">{t("selectDepartment")} *</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => handleInputChange("departmentId", value)}
                >
                  <SelectTrigger className="h-8 text-xs">
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
                <p className="text-[10px] text-muted-foreground">
                  {t("createDepartmentHere")} <a href="#" className="font-medium text-primary">{t("createDepartment")}</a>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{t("selectDesignation")} *</Label>
                <Select
                  value={formData.designationId}
                  onValueChange={(value) => handleInputChange("designationId", value)}
                >
                  <SelectTrigger className="h-8 text-xs">
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
                <p className="text-[10px] text-muted-foreground">
                  {t("createDesignationHere")} <a href="#" className="font-medium text-primary">{t("createDesignation")}</a>
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="companyDoj" className="text-xs">{t("companyDateOfJoining")} *</Label>
                <Input
                  id="companyDoj"
                  type="date"
                  className="h-8 text-xs"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Document Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              {t("document")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <div className="space-y-2">
              {documents.map((document) => (
                <div key={document.id} className="space-y-1">
                  <Label className="text-xs font-medium">
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
                          <p className="text-[10px] text-muted-foreground">
                            <span className="font-semibold">Click to upload</span>
                          </p>
                          <p className="text-[9px] text-muted-foreground">
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
          </CardContent>
        </Card>

        {/* Bank Account Detail Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-1 px-3 pt-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="w-1 h-4 bg-green-500 rounded"></div>
              {t("bankAccountDetail")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-3 pb-3 pt-0">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="accountHolderName" className="text-xs">{t("accountHolderName")}</Label>
                <Input
                  id="accountHolderName"
                  className="h-8 text-xs"
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                  placeholder={t("enterAccountHolderName")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="accountNumber" className="text-xs">{t("accountNumber")}</Label>
                <Input
                  id="accountNumber"
                  className="h-8 text-xs"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                  placeholder={t("enterAccountNumber")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="bankName" className="text-xs">{t("bankName")}</Label>
                <Input
                  id="bankName"
                  className="h-8 text-xs"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                  placeholder={t("enterBankName")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bankIdentifierCode" className="text-xs">{t("bankIdentifierCode")}</Label>
                <Input
                  id="bankIdentifierCode"
                  className="h-8 text-xs"
                  value={formData.bankIdentifierCode}
                  onChange={(e) => handleInputChange("bankIdentifierCode", e.target.value)}
                  placeholder={t("enterBankIdentifierCode")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="branchLocation" className="text-xs">{t("branchLocation")}</Label>
                <Input
                  id="branchLocation"
                  className="h-8 text-xs"
                  value={formData.branchLocation}
                  onChange={(e) => handleInputChange("branchLocation", e.target.value)}
                  placeholder={t("enterBranchLocation")}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="taxPayerId" className="text-xs">{t("taxPayerId")}</Label>
                <Input
                  id="taxPayerId"
                  className="h-8 text-xs"
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
      <div className="flex justify-end space-x-2 pt-1">
        <Button type="button" variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button type="submit" size="sm" className="h-8 px-3 text-xs">
          {t("createEmployee")}
        </Button>
      </div>
    </form>
  )
}