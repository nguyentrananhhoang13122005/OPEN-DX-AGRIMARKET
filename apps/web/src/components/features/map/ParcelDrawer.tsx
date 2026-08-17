'use client'

// Copyright (c) 2026 Nguyen Tran Anh Hoang
// Licensed under the MIT License. See LICENSE file in the project root for full license information.

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2 } from 'lucide-react'
import { parcelCreateSchema, type ParcelCreateInput } from '@/lib/validations/parcel.schema'
import { toast } from 'sonner'

interface Household {
  id: string
  name: string
  phone: string
}

interface ParcelDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ParcelCreateInput) => Promise<void>
  polygon: any | null
  areaHa: number
  households?: Household[]
  isLoading?: boolean
}

export function ParcelDrawer({
  isOpen,
  onClose,
  onSubmit,
  polygon,
  areaHa,
  households = [],
  isLoading = false,
}: ParcelDrawerProps) {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ParcelCreateInput>({
    resolver: zodResolver(parcelCreateSchema),
    defaultValues: {
      household_id: '',
      name: '',
      current_crop: '',
      area_ha: areaHa,
      geojson: polygon,
      soil_type: null,
      irrigation_type: null,
      estimated_yield_per_ha: null,
    },
  })

  // Update area whenever it changes
  useEffect(() => {
    setValue('area_ha', areaHa)
  }, [areaHa, setValue])

  // Update geojson whenever polygon changes
  useEffect(() => {
    if (polygon) {
      setValue('geojson', polygon)
    }
  }, [polygon, setValue])

  const handleFormSubmit = async (data: ParcelCreateInput) => {
    try {
      setSubmitting(true)
      await onSubmit(data)
      reset()
      onClose()
      toast.success('Thửa đất được tạo thành công')
    } catch (error) {
      console.error('Error creating parcel:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer - Desktop (right) and Mobile (bottom) */}
      <div
        className={`fixed z-50 transition-all duration-300 ${
          isOpen ? 'translate-y-0 translate-x-0' : 'translate-y-full translate-x-full'
        }
        md:right-0 md:top-0 md:bottom-0 md:translate-y-0 md:translate-x-0
        md:w-96 md:border-l md:border-gray-200
        w-full h-auto md:h-full
        bottom-0 left-0 right-0
        bg-white rounded-t-lg md:rounded-none
        shadow-lg md:shadow-xl
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            Thêm thửa đất mới
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="overflow-y-auto h-[calc(100%-120px)] md:h-[calc(100%-160px)] p-4 md:p-6"
        >
          {/* Household Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn hộ nông dân <span className="text-red-500">*</span>
            </label>
            <select
              {...register('household_id')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Chọn hộ --</option>
              {households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.phone})
                </option>
              ))}
            </select>
            {errors.household_id && (
              <p className="text-red-500 text-sm mt-1">{errors.household_id.message}</p>
            )}
          </div>

          {/* Parcel Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên thửa đất <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="e.g., Thửa A, Thửa B"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Crop Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại cây trồng <span className="text-red-500">*</span>
            </label>
            <select
              {...register('current_crop')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Chọn cây trồng --</option>
              <option value="Lúa">Lúa</option>
              <option value="Lúa Hè Thu">Lúa Hè Thu</option>
              <option value="Lúa Đông Xuân">Lúa Đông Xuân</option>
              <option value="Xoài">Xoài</option>
              <option value="Cáy cát chu">Cây cát chu</option>
              <option value="Bắp">Bắp</option>
              <option value="Sắn">Sắn</option>
              <option value="Khoai tây">Khoai tây</option>
              <option value="Khác">Khác</option>
            </select>
            {errors.current_crop && (
              <p className="text-red-500 text-sm mt-1">{errors.current_crop.message}</p>
            )}
          </div>

          {/* Area (Read-only) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diện tích (ha)
            </label>
            <input
              type="number"
              value={areaHa.toFixed(2)}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-gray-500 text-xs mt-1">
              Tính toán tự động từ đa giác vẽ
            </p>
          </div>

          {/* Estimated Yield */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Năng suất dự kiến (kg/ha)
            </label>
            <input
              {...register('estimated_yield_per_ha', {
                setValueAs: (value) => (value === '' ? null : Number(value)),
              })}
              type="number"
              placeholder="e.g., 5000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.estimated_yield_per_ha && (
              <p className="text-red-500 text-sm mt-1">{errors.estimated_yield_per_ha.message}</p>
            )}
          </div>

          {/* Soil Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại đất
            </label>
            <input
              {...register('soil_type', { setValueAs: (value) => (value === '' ? null : value) })}
              type="text"
              placeholder="e.g., Đất phù sa"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Irrigation Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại tưới
            </label>
            <input
              {...register('irrigation_type', { setValueAs: (value) => (value === '' ? null : value) })}
              type="text"
              placeholder="e.g., Tưới tràn"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Footer with Actions */}
        <div className="flex items-center gap-3 p-4 md:p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit(handleFormSubmit)}
            disabled={submitting || isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            {submitting || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Lưu thửa đất'
            )}
          </button>
        </div>
      </div>
    </>
  )
}
