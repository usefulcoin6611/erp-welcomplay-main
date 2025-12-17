'use client'

import { useState, useCallback, useMemo } from 'react'
import type { DealFiltersType, DealReportItem, DealSummaryType } from './constants'

// Mock data generator
function generateMockDealData(filters: DealFiltersType): DealReportItem[] {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  
  const baseData: DealReportItem[] = [
    {
      dealId: 'DL-2024-001',
      dealName: 'ERP Implementation Project',
      company: 'PT Digital Nusantara',
      contact: 'Ahmad Fauzi',
      stage: 'proposal',
      stageLabel: 'Proposal',
      priority: 'high',
      priorityLabel: 'High',
      dealValue: 'Rp 500.000.000',
      probability: '70%',
      expectedCloseDate: '15 Feb 2024',
      assignedTo: 'Budi Santoso',
    },
    {
      dealId: 'DL-2024-002',
      dealName: 'Cloud Migration Services',
      company: 'CV Maju Bersama',
      contact: 'Siti Nurhaliza',
      stage: 'negotiation',
      stageLabel: 'Negotiation',
      priority: 'urgent',
      priorityLabel: 'Urgent',
      dealValue: 'Rp 750.000.000',
      probability: '85%',
      expectedCloseDate: '20 Feb 2024',
      assignedTo: 'Dewi Lestari',
    },
    {
      dealId: 'DL-2024-003',
      dealName: 'Mobile App Development',
      company: 'PT Teknologi Masa Depan',
      contact: 'Bambang Wijaya',
      stage: 'won',
      stageLabel: 'Won',
      priority: 'high',
      priorityLabel: 'High',
      dealValue: 'Rp 300.000.000',
      probability: '100%',
      expectedCloseDate: '10 Jan 2024',
      assignedTo: 'Rina Mulyani',
    },
    {
      dealId: 'DL-2024-004',
      dealName: 'IT Consulting Services',
      company: 'UD Sejahtera Abadi',
      contact: 'Dewi Kartika',
      stage: 'prospecting',
      stageLabel: 'Prospecting',
      priority: 'medium',
      priorityLabel: 'Medium',
      dealValue: 'Rp 150.000.000',
      probability: '30%',
      expectedCloseDate: '28 Feb 2024',
      assignedTo: 'Agus Setiawan',
    },
    {
      dealId: 'DL-2024-005',
      dealName: 'Data Analytics Platform',
      company: 'PT Global Solusi',
      contact: 'Rudi Hartono',
      stage: 'qualification',
      stageLabel: 'Qualification',
      priority: 'high',
      priorityLabel: 'High',
      dealValue: 'Rp 600.000.000',
      probability: '60%',
      expectedCloseDate: '25 Feb 2024',
      assignedTo: 'Sari Wulandari',
    },
    {
      dealId: 'DL-2024-006',
      dealName: 'Website Redesign',
      company: 'CV Kreasi Digital',
      contact: 'Linda Kusuma',
      stage: 'proposal',
      stageLabel: 'Proposal',
      priority: 'medium',
      priorityLabel: 'Medium',
      dealValue: 'Rp 200.000.000',
      probability: '65%',
      expectedCloseDate: '18 Feb 2024',
      assignedTo: 'Budi Santoso',
    },
    {
      dealId: 'DL-2024-007',
      dealName: 'Cybersecurity Assessment',
      company: 'PT Inovasi Teknologi',
      contact: 'Hendra Gunawan',
      stage: 'lost',
      stageLabel: 'Lost',
      priority: 'low',
      priorityLabel: 'Low',
      dealValue: 'Rp 100.000.000',
      probability: '0%',
      expectedCloseDate: '05 Feb 2024',
      assignedTo: 'Dewi Lestari',
    },
    {
      dealId: 'DL-2024-008',
      dealName: 'CRM System Integration',
      company: 'UD Karya Mandiri',
      contact: 'Maya Sari',
      stage: 'won',
      stageLabel: 'Won',
      priority: 'urgent',
      priorityLabel: 'Urgent',
      dealValue: 'Rp 450.000.000',
      probability: '100%',
      expectedCloseDate: '12 Jan 2024',
      assignedTo: 'Rina Mulyani',
    },
    {
      dealId: 'DL-2024-009',
      dealName: 'Network Infrastructure Upgrade',
      company: 'PT Mitra Teknologi',
      contact: 'Irfan Hakim',
      stage: 'negotiation',
      stageLabel: 'Negotiation',
      priority: 'high',
      priorityLabel: 'High',
      dealValue: 'Rp 850.000.000',
      probability: '80%',
      expectedCloseDate: '22 Feb 2024',
      assignedTo: 'Agus Setiawan',
    },
    {
      dealId: 'DL-2024-010',
      dealName: 'AI Chatbot Development',
      company: 'CV Inovasi Cerdas',
      contact: 'Nurul Aini',
      stage: 'qualification',
      stageLabel: 'Qualification',
      priority: 'medium',
      priorityLabel: 'Medium',
      dealValue: 'Rp 250.000.000',
      probability: '50%',
      expectedCloseDate: '29 Feb 2024',
      assignedTo: 'Sari Wulandari',
    },
  ]

  // Filter by stage
  let filteredData = baseData
  if (filters.stage !== 'all') {
    filteredData = filteredData.filter(item => item.stage === filters.stage)
  }

  // Filter by priority
  if (filters.priority !== 'all') {
    filteredData = filteredData.filter(item => item.priority === filters.priority)
  }

  return filteredData
}

function calculateSummary(data: DealReportItem[]): DealSummaryType {
  // Calculate total value
  const totalValue = data.reduce((sum, item) => {
    const value = parseInt(item.dealValue.replace(/[^0-9]/g, ''))
    return sum + value
  }, 0)

  return {
    totalDeals: data.length,
    totalValue: new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(totalValue),
    wonDeals: data.filter(item => item.stage === 'won').length,
    lostDeals: data.filter(item => item.stage === 'lost').length,
  }
}

export function useDealData() {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')

  const [filters, setFilters] = useState<DealFiltersType>({
    period: {
      month: currentMonth,
      year: currentYear.toString(),
    },
    stage: 'all',
    priority: 'all',
  })

  const [isLoading, setIsLoading] = useState(false)

  // Generate data based on filters
  const data = useMemo(() => generateMockDealData(filters), [filters])
  const summary = useMemo(() => calculateSummary(data), [data])

  const handleFilterChange = useCallback((key: keyof DealFiltersType, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const handleApplyFilters = useCallback(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters({
      period: {
        month: currentMonth,
        year: currentYear.toString(),
      },
      stage: 'all',
      priority: 'all',
    })
  }, [currentMonth, currentYear])

  const handleDownload = useCallback(() => {
    console.log('Downloading deal report as PDF...')
    // Implement PDF download logic
  }, [])

  const handleExport = useCallback(() => {
    console.log('Exporting deal report to Excel...')
    // Implement Excel export logic
  }, [])

  return {
    filters,
    data,
    summary,
    isLoading,
    handleFilterChange,
    handleApplyFilters,
    handleResetFilters,
    handleDownload,
    handleExport,
  }
}
