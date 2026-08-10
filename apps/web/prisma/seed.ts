import 'dotenv/config'
import { PrismaClient, ParcelStatus, PartnerType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.htxProfile.upsert({
    where: { id: 'htx-md2' },
    update: {},
    create: {
      id: 'htx-md2',
      name: 'HTX MD2 Mekong Delta',
      htx_code: 'MD2',
      address: 'Xã Long Hòa, Huyện Châu Thành, Tỉnh Tiền Giang',
      crop_types: ['Lúa ST25', 'Lúa OM5451'],
      season_label: 'Vụ Hè Thu 2026',
      contact_phone: '02733 123 456',
      total_area_ha: 4.82,
    },
  })

  const h1 = await prisma.household.upsert({
    where: { phone: '0903001001' },
    update: {},
    create: {
      name: 'Nguyễn Văn Nam',
      phone: '0903001001',
      address: 'Ấp Long Định, Xã Long Hòa, huyện Châu Thành, Tiền Giang',
    },
  })

  const h2 = await prisma.household.upsert({
    where: { phone: '0903001002' },
    update: {},
    create: {
      name: 'Trần Thị Hoa',
      phone: '0903001002',
      address: 'Ấp Long Thuận, Xã Long Hòa, huyện Châu Thành, Tiền Giang',
    },
  })

  const h3 = await prisma.household.upsert({
    where: { phone: '0903001003' },
    update: {},
    create: {
      name: 'Lê Văn Tài',
      phone: '0903001003',
      address: 'Ấp Long Định, Xã Long Hòa, huyện Châu Thành, Tiền Giang',
    },
  })

  await Promise.all([
    prisma.parcel.upsert({
      where: { parcel_code: 'P-HTX-MD2-001' },
      update: {},
      create: {
        parcel_code: 'P-HTX-MD2-001',
        household_id: h1.id,
        crop_type: 'Lúa ST25',
        area_ha: 0.85,
        status: ParcelStatus.SOWING,
        centroid_lat: 10.3542,
        centroid_lng: 106.3685,
      },
    }),
    prisma.parcel.upsert({
      where: { parcel_code: 'P-HTX-MD2-002' },
      update: {},
      create: {
        parcel_code: 'P-HTX-MD2-002',
        household_id: h1.id,
        crop_type: 'Lúa ST25',
        area_ha: 1.20,
        status: ParcelStatus.TENDING,
        centroid_lat: 10.3550,
        centroid_lng: 106.3690,
      },
    }),
    prisma.parcel.upsert({
      where: { parcel_code: 'P-HTX-MD2-003' },
      update: {},
      create: {
        parcel_code: 'P-HTX-MD2-003',
        household_id: h2.id,
        crop_type: 'Lúa OM5451',
        area_ha: 0.95,
        status: ParcelStatus.HARVEST_APPROVED,
        centroid_lat: 10.3560,
        centroid_lng: 106.3700,
      },
    }),
    prisma.parcel.upsert({
      where: { parcel_code: 'P-HTX-MD2-004' },
      update: {},
      create: {
        parcel_code: 'P-HTX-MD2-004',
        household_id: h2.id,
        crop_type: 'Lúa OM5451',
        area_ha: 1.10,
        status: ParcelStatus.HARVESTED,
        centroid_lat: 10.3570,
        centroid_lng: 106.3710,
      },
    }),
    prisma.parcel.upsert({
      where: { parcel_code: 'P-HTX-MD2-005' },
      update: {},
      create: {
        parcel_code: 'P-HTX-MD2-005',
        household_id: h3.id,
        crop_type: 'Lúa ST25',
        area_ha: 0.72,
        status: ParcelStatus.DRAFT,
        centroid_lat: 10.3580,
        centroid_lng: 106.3720,
      },
    }),
  ])

  const partnerSeedData = [
    { slug: 'buyer-luong-thuc-mien-tay', name: 'Công ty TNHH Lương Thực Miền Tây', partner_type: PartnerType.BUYER, contact_phone: '02838291001', primary_commodities: ['Lúa ST25', 'Lúa OM5451'], lat: 10.3500, lng: 106.3650, address: 'TP. Mỹ Tho, Tiền Giang' },
    { slug: 'buyer-xuat-khau-gao-song-hau', name: 'Doanh Nghiệp Xuất Khẩu Gạo Sông Hậu', partner_type: PartnerType.BUYER, contact_phone: '02923822002', primary_commodities: ['Lúa ST25'], lat: 10.0400, lng: 105.7800, address: 'TP. Cần Thơ' },
    { slug: 'middleman-nguyen-van-bay', name: 'Thương Lái Nguyễn Văn Bảy', partner_type: PartnerType.MIDDLEMAN, contact_phone: '0918002003', primary_commodities: ['Lúa OM5451'], lat: 10.3600, lng: 106.3750, address: 'Châu Thành, Tiền Giang' },
    { slug: 'middleman-tran-thi-sau', name: 'Thương Lái Trần Thị Sáu', partner_type: PartnerType.MIDDLEMAN, contact_phone: '0918002004', primary_commodities: ['Lúa ST25'], lat: 10.3700, lng: 106.3800, address: 'Châu Thành, Tiền Giang' },
    { slug: 'warehouse-kho-lanh-mekong', name: 'Kho Lạnh Bảo Quản Mekong', partner_type: PartnerType.WAREHOUSE, contact_phone: '02733885005', primary_commodities: ['Lúa ST25', 'Lúa OM5451'], lat: 10.3450, lng: 106.3600, address: 'TP. Mỹ Tho, Tiền Giang' },
  ]

  await Promise.all(partnerSeedData.map((p) => {
    const { slug, ...partnerFields } = p
    const id = `partner-${slug}`
    return prisma.partner.upsert({
      where: { id },
      update: {},
      create: { id, ...partnerFields },
    })
  }))

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

