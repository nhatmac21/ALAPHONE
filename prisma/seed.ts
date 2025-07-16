import { PrismaClient } from '../src/generated/prisma';
const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: 'iPhone 15 Pro Max',
        image: 'https://cdn.tgdd.vn/Products/Images/42/303891/iphone-15-pro-max-blue-thumb-600x600.jpg',
        price: 34990000,
        brand: 'Apple',
        ram: '8GB',
        rom: '256GB',
        screen: '6.7 inch OLED',
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        image: 'https://cdn.tgdd.vn/Products/Images/42/303890/samsung-galaxy-s24-ultra-thumb-600x600.jpg',
        price: 28990000,
        brand: 'Samsung',
        ram: '12GB',
        rom: '256GB',
        screen: '6.8 inch Dynamic AMOLED',
      },
      {
        name: 'Xiaomi 14 Pro',
        image: 'https://cdn.tgdd.vn/Products/Images/42/303892/xiaomi-14-pro-thumb-600x600.jpg',
        price: 19990000,
        brand: 'Xiaomi',
        ram: '12GB',
        rom: '512GB',
        screen: '6.73 inch AMOLED',
      },
      {
        name: 'OPPO Find X7',
        image: 'https://cdn.tgdd.vn/Products/Images/42/303893/oppo-find-x7-thumb-600x600.jpg',
        price: 17990000,
        brand: 'OPPO',
        ram: '8GB',
        rom: '256GB',
        screen: '6.7 inch AMOLED',
      },
      {
        name: 'Vivo X100 Pro',
        image: 'https://cdn.tgdd.vn/Products/Images/42/303894/vivo-x100-pro-thumb-600x600.jpg',
        price: 15990000,
        brand: 'Vivo',
        ram: '12GB',
        rom: '256GB',
        screen: '6.78 inch AMOLED',
      },
    ],
  });
  console.log('Seed dữ liệu sản phẩm thành công!');
}

main().finally(() => prisma.$disconnect()); 