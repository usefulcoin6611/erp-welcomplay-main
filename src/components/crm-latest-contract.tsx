"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"

type ContractRow = {
  id: string
  number: string
  subject: string
  client: string
  project: string
  type: string
  value: number
  startDate: string
  endDate: string
}

const DEFAULT_PAGE_SIZE = 10

function formatValue(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)
}

export function CRMLatestContract() {
  const t = useTranslations("crmDashboard.latestContract")
  const [contracts, setContracts] = useState<ContractRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [loading, setLoading] = useState(true)

  const fetchContracts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/contracts?page=${page}&limit=${pageSize}`
      )
      const json = await res.json()
      if (json?.success && Array.isArray(json.data)) {
        setContracts(
          json.data.map((c: { contractNumber?: string } & ContractRow) => ({
            id: c.id,
            number: c.number ?? c.contractNumber ?? "",
            subject: c.subject,
            client: c.client,
            project: c.project,
            type: c.type,
            value: c.value,
            startDate: c.startDate,
            endDate: c.endDate,
          }))
        )
        setTotal(json.total ?? 0)
      } else {
        setContracts([])
        setTotal(0)
      }
    } catch {
      setContracts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }

  const isEmpty = !loading && contracts.length === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t("number")}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t("subject")}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t("client")}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t("project")}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t("contractType")}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t("contractValue")}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t("startDate")}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t("endDate")}
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-4">
                      <div className="flex flex-col gap-2">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : isEmpty ? (
                  <tr>
                    <td colSpan={8} className="h-24 text-center">
                      <div className="text-muted-foreground">
                        <h6 className="text-sm font-medium">{t("noContract")}</h6>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contracts.map((contract) => (
                    <tr key={contract.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/contract/${contract.id}`}>{contract.number}</Link>
                        </Button>
                      </td>
                      <td className="p-4 align-middle">{contract.subject}</td>
                      <td className="p-4 align-middle">{contract.client}</td>
                      <td className="p-4 align-middle">{contract.project}</td>
                      <td className="p-4 align-middle">{contract.type}</td>
                      <td className="p-4 align-middle">{formatValue(contract.value)}</td>
                      <td className="p-4 align-middle">{contract.startDate}</td>
                      <td className="p-4 align-middle">{contract.endDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {!loading && total > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <SimplePagination
              totalCount={total}
              currentPage={page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              sizes={[5, 10, 25, 50]}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
