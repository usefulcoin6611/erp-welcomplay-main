"use client"

import { useSettings } from '@/hooks/use-settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'

export function StorageSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/storage', {
    storage_setting: 'local',
    local_storage_validation: [] as string[],
    local_storage_max_upload_size: '2048',
    s3_key: '',
    s3_secret: '',
    s3_region: '',
    s3_bucket: '',
    s3_url: '',
    s3_endpoint: '',
    s3_storage_validation: [] as string[],
    s3_max_upload_size: '2048',
    wasabi_key: '',
    wasabi_secret: '',
    wasabi_region: '',
    wasabi_bucket: '',
    wasabi_url: '',
    wasabi_root: '',
    wasabi_storage_validation: [] as string[],
    wasabi_max_upload_size: '2048',
  })

  const fileTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <Card className="rounded-lg shadow-none">
      <CardHeader className="px-6 py-4 rounded-t-lg">
        <CardTitle className="text-base font-medium leading-none">Storage Settings</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Storage Type Selection */}
          <div className="flex gap-2 flex-wrap">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="storage_setting"
                value="local"
                checked={formData.storage_setting === 'local'}
                onChange={(e) => setFormData({ ...formData, storage_setting: e.target.value })}
                className="sr-only peer"
              />
              <div className="px-4 py-2 border rounded-lg peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 hover:bg-gray-50 transition-colors text-sm">
                Local
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="storage_setting"
                value="s3"
                checked={formData.storage_setting === 's3'}
                onChange={(e) => setFormData({ ...formData, storage_setting: e.target.value })}
                className="sr-only peer"
              />
              <div className="px-4 py-2 border rounded-lg peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 hover:bg-gray-50 transition-colors text-sm">
                AWS S3
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="storage_setting"
                value="wasabi"
                checked={formData.storage_setting === 'wasabi'}
                onChange={(e) => setFormData({ ...formData, storage_setting: e.target.value })}
                className="sr-only peer"
              />
              <div className="px-4 py-2 border rounded-lg peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 hover:bg-gray-50 transition-colors text-sm">
                Wasabi
              </div>
            </label>
          </div>

          {/* Local Storage Settings */}
          {formData.storage_setting === 'local' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Only Upload Files</Label>
                <div className="flex flex-wrap gap-2">
                  {fileTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.local_storage_validation.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              local_storage_validation: [...formData.local_storage_validation, type],
                            })
                          } else {
                            setFormData({
                              ...formData,
                              local_storage_validation: formData.local_storage_validation.filter((t) => t !== type),
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="local_storage_max_upload_size" className="text-sm font-medium text-gray-700 dark:text-gray-300">Max upload size (In KB)</Label>
                <Input
                  id="local_storage_max_upload_size"
                  type="number"
                  value={formData.local_storage_max_upload_size}
                  placeholder="Max upload size"
                  variant="modern"
                  onChange={(e) =>
                    setFormData({ ...formData, local_storage_max_upload_size: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* S3 Storage Settings */}
          {formData.storage_setting === 's3' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="s3_key" className="text-sm font-medium">S3 Key</Label>
                <Input
                  id="s3_key"
                  value={formData.s3_key}
                  placeholder="S3 Key"
                  variant="modern"
                  onChange={(e) => setFormData({ ...formData, s3_key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3_secret" className="text-sm font-medium text-gray-700 dark:text-gray-300">S3 Secret</Label>
                <Input
                  id="s3_secret"
                  type="password"
                  value={formData.s3_secret}
                  placeholder="S3 Secret"
                  variant="modern"
                  onChange={(e) => setFormData({ ...formData, s3_secret: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3_region" className="text-sm font-medium text-gray-700 dark:text-gray-300">S3 Region</Label>
                <Input
                  id="s3_region"
                  value={formData.s3_region}
                  placeholder="S3 Region"
                  variant="modern"
                  onChange={(e) => setFormData({ ...formData, s3_region: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3_bucket" className="text-sm font-medium text-gray-700 dark:text-gray-300">S3 Bucket</Label>
                <Input
                  id="s3_bucket"
                  value={formData.s3_bucket}
                  placeholder="S3 Bucket"
                  variant="modern"
                  onChange={(e) => setFormData({ ...formData, s3_bucket: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3_url" className="text-sm font-medium text-gray-700 dark:text-gray-300">S3 URL</Label>
                <Input
                  id="s3_url"
                  value={formData.s3_url}
                  placeholder="S3 URL"
                  variant="modern"
                  onChange={(e) => setFormData({ ...formData, s3_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3_endpoint" className="text-sm font-medium text-gray-700 dark:text-gray-300">S3 Endpoint</Label>
                <Input
                  id="s3_endpoint"
                  value={formData.s3_endpoint}
                  placeholder="S3 Endpoint"
                  variant="modern"
                  onChange={(e) => setFormData({ ...formData, s3_endpoint: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Only Upload Files</Label>
                <div className="flex flex-wrap gap-2">
                  {fileTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.s3_storage_validation.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              s3_storage_validation: [...formData.s3_storage_validation, type],
                            })
                          } else {
                            setFormData({
                              ...formData,
                              s3_storage_validation: formData.s3_storage_validation.filter((t) => t !== type),
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3_max_upload_size" className="text-sm font-medium text-gray-700 dark:text-gray-300">Max upload size (In KB)</Label>
                <Input
                  id="s3_max_upload_size"
                  type="number"
                  value={formData.s3_max_upload_size}
                  placeholder="Max upload size"
                  variant="modern"
                  onChange={(e) =>
                    setFormData({ ...formData, s3_max_upload_size: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Wasabi Storage Settings */}
          {formData.storage_setting === 'wasabi' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="wasabi_key" className="text-sm font-medium text-gray-700 dark:text-gray-300">Wasabi Key</Label>
                <Input
                  id="wasabi_key"
                  value={formData.wasabi_key}
                  placeholder="Wasabi Key"
                  variant="modern"
                  onChange={(e) => setFormData({ ...formData, wasabi_key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wasabi_secret" className="text-sm font-medium text-gray-700 dark:text-gray-300">Wasabi Secret</Label>
                <Input
                  id="wasabi_secret"
                  type="password"
                  value={formData.wasabi_secret}
                  placeholder="Wasabi Secret"
                  variant="modern"
                  onChange={(e) => setFormData({ ...formData, wasabi_secret: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wasabi_region" className="text-sm font-medium text-gray-700 dark:text-gray-300">Wasabi Region</Label>
                <Input
                  id="wasabi_region"
                  value={formData.wasabi_region}
                  placeholder="Wasabi Region"
                  variant="modern"
                  onChange={(e) => setFormData({ ...formData, wasabi_region: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wasabi_bucket" className="text-sm font-medium text-gray-700 dark:text-gray-300">Wasabi Bucket</Label>
                <Input
                  id="wasabi_bucket"
                  value={formData.wasabi_bucket}
                  placeholder="Wasabi Bucket"
                  variant="modern"
                  onChange={(e) => setFormData({ ...formData, wasabi_bucket: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wasabi_url" className="text-sm font-medium text-gray-700 dark:text-gray-300">Wasabi URL</Label>
                <Input
                  id="wasabi_url"
                  value={formData.wasabi_url}
                  placeholder="Wasabi URL"
                  variant="modern"
                  onChange={(e) => setFormData({ ...formData, wasabi_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wasabi_root" className="text-sm font-medium text-gray-700 dark:text-gray-300">Wasabi Root</Label>
                <Input
                  id="wasabi_root"
                  value={formData.wasabi_root}
                  placeholder="Wasabi Root"
                  variant="modern"
                  onChange={(e) => setFormData({ ...formData, wasabi_root: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Only Upload Files</Label>
                <div className="flex flex-wrap gap-2">
                  {fileTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.wasabi_storage_validation.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              wasabi_storage_validation: [...formData.wasabi_storage_validation, type],
                            })
                          } else {
                            setFormData({
                              ...formData,
                              wasabi_storage_validation: formData.wasabi_storage_validation.filter((t) => t !== type),
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wasabi_max_upload_size" className="text-sm font-medium text-gray-700 dark:text-gray-300">Max upload size (In KB)</Label>
                <Input
                  id="wasabi_max_upload_size"
                  type="number"
                  value={formData.wasabi_max_upload_size}
                  placeholder="Max upload size"
                  variant="modern"
                  onChange={(e) =>
                    setFormData({ ...formData, wasabi_max_upload_size: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" variant="blue" className="shadow-none">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
