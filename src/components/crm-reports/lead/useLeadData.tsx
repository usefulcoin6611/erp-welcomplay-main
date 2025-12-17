'use client'

import { useState, useCallback, useMemo } from 'react'
import type { LeadFiltersType, LeadReportItem, LeadSummaryType } from './constants'

// Mock data generator
function generateMockLeadData(filters: LeadFiltersType): LeadReportItem[] {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  
  const baseData: LeadReportItem[] = [
    {
      leadId: 'LD-2024-001',
      name: 'Ahmad Fauzi',
      company: 'PT Digital Nusantara',
      email: 'ahmad.fauzi@digitalnusantara.com',
      phone: '+62 812-3456-7890',
      source: 'website',
      status: 'new',
      statusLabel: 'Baru',
      estimatedValue: 'Rp 50.000.000',
      createdDate: '01 Jan 2024',
      assignedTo: 'Budi Santoso',
    },
    {
      leadId: 'LD-2024-002',
      name: 'Siti Nurhaliza',
      company: 'CV Maju Bersama',
      email: 'siti@majubersama.co.id',
      phone: '+62 813-9876-5432',
      source: 'referral',
      status: 'contacted',
      statusLabel: 'Dihubungi',
      estimatedValue: 'Rp 75.000.000',
      createdDate: '05 Jan 2024',
      assignedTo: 'Dewi Lestari',
    },
    {
      leadId: 'LD-2024-003',
      name: 'Bambang Wijaya',
      company: 'PT Teknologi Masa Depan',
      email: 'bambang@tekmasadepan.com',
      phone: '+62 821-1111-2222',
      source: 'social-media',
      status: 'qualified',
      statusLabel: 'Qualified',
      estimatedValue: 'Rp 100.000.000',
      createdDate: '10 Jan 2024',
      assignedTo: 'Rina Mulyani',
    },
    {
      leadId: 'LD-2024-004',
      name: 'Dewi Kartika',
      company: 'UD Sejahtera Abadi',
      email: 'dewi.kartika@sejahtera.com',
      phone: '+62 822-3333-4444',
      source: 'email',
      status: 'converted',
      statusLabel: 'Converted',
      estimatedValue: 'Rp 120.000.000',
      createdDate: '15 Jan 2024',
      assignedTo: 'Agus Setiawan',
    },
    {
      leadId: 'LD-2024-005',
      name: 'Rudi Hartono',
      company: 'PT Global Solusi',
      email: 'rudi@globalsolusi.id',
      phone: '+62 823-5555-6666',
      source: 'event',
      status: 'qualified',
      statusLabel: 'Qualified',
      estimatedValue: 'Rp 85.000.000',
      createdDate: '20 Jan 2024',
      assignedTo: 'Sari Wulandari',
    },
    {
      leadId: 'LD-2024-006',
      name: 'Linda Kusuma',
      company: 'CV Kreasi Digital',
      email: 'linda@kreasidigital.com',
      phone: '+62 815-7777-8888',
      source: 'website',
      status: 'contacted',
      statusLabel: 'Dihubungi',
      estimatedValue: 'Rp 60.000.000',
      createdDate: '25 Jan 2024',
      assignedTo: 'Budi Santoso',
    },
    {
      leadId: 'LD-2024-007',
      name: 'Hendra Gunawan',
      company: 'PT Inovasi Teknologi',
      email: 'hendra@inovasitek.co.id',
      phone: '+62 816-9999-0000',
      source: 'direct',
      status: 'lost',
      statusLabel: 'Lost',
      estimatedValue: 'Rp 40.000.000',
      createdDate: '28 Jan 2024',
      assignedTo: 'Dewi Lestari',
    },
    {
      leadId: 'LD-2024-008',
      name: 'Maya Sari',
      company: 'UD Karya Mandiri',
      email: 'maya@karyamandiri.com',
      phone: '+62 817-1234-5678',
      source: 'referral',
      status: 'converted',
      statusLabel: 'Converted',
      estimatedValue: 'Rp 95.000.000',
      createdDate: '02 Feb 2024',
      assignedTo: 'Rina Mulyani',
    },
  ]

  // Filter by status
  let filteredData = baseData
  if (filters.status !== 'all') {
    filteredData = filteredData.filter(item => item.status === filters.status)
  }

  // Filter by source
  if (filters.source !== 'all') {
    filteredData = filteredData.filter(item => item.source === filters.source)
  }

  return filteredData
}

function calculateSummary(data: LeadReportItem[]): LeadSummaryType {
  return {
    totalLeads: data.length,
    qualifiedLeads: data.filter(item => item.status === 'qualified').length,
    convertedLeads: data.filter(item => item.status === 'converted').length,
    lostLeads: data.filter(item => item.status === 'lost').length,
  }
}

export function useLeadData() {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')

  const [filters, setFilters] = useState<LeadFiltersType>({
    period: {
      month: currentMonth,
      year: currentYear.toString(),
    },
    status: 'all',
    source: 'all',
  })

  const [isLoading, setIsLoading] = useState(false)

  // Generate data based on filters
  const data = useMemo(() => generateMockLeadData(filters), [filters])
  const summary = useMemo(() => calculateSummary(data), [data])

  const handleFilterChange = useCallback((key: keyof LeadFiltersType, value: any) => {
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
      status: 'all',
      source: 'all',
    })
  }, [currentMonth, currentYear])

  const handleDownload = useCallback(() => {
    console.log('Downloading lead report as PDF...')
    // Implement PDF download logic
  }, [])

  const handleExport = useCallback(() => {
    console.log('Exporting lead report to Excel...')
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
