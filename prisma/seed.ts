import { getPrisma } from '../src/lib/prisma.ts';

const prisma = getPrisma();

async function main() {
  const products = [
    {
      name: "Celestial Midnight Sapphire",
      description: "A deep blue sapphire from Ceylon, radiating light like the midnight sky.",
      price: 2450.00,
      images: [],
      category: "Loose Gemstones",
      stoneType: "Sapphire",
      stoneColor: "Blue",
      caratWeight: 4.2,
      origin: "Sri Lanka",
      certification: "GIA",
      stockQty: 5,
      isFeatured: true,
    },
    {
      name: "Regal Crimson Ruby",
      description: "An exceptional Burmese ruby with a pigeon blood red hue.",
      price: 8450.00,
      images: [],
      category: "Loose Gemstones",
      stoneType: "Ruby",
      stoneColor: "Red",
      caratWeight: 2.4,
      origin: "Burma",
      certification: "GIA",
      stockQty: 2,
      isFeatured: true,
    },
    {
      name: "Verdant Emerald Solitaire",
      description: "A lush green Zambian emerald, perfectly cut for brilliance.",
      price: 6720.00,
      images: [],
      category: "Loose Gemstones",
      stoneType: "Emerald",
      stoneColor: "Green",
      caratWeight: 3.1,
      origin: "Zambia",
      certification: "GIA",
      stockQty: 3,
      isFeatured: true,
    },
    {
      name: "Ethereal Diamond",
      description: "A flawless round brilliant cut diamond of exceptional clarity.",
      price: 12450.00,
      images: [],
      category: "Loose Gemstones",
      stoneType: "Diamond",
      stoneColor: "White",
      caratWeight: 1.2,
      origin: "Africa",
      certification: "GIA",
      stockQty: 1,
      isFeatured: true,
    },
    {
      name: "Lunar Pearl",
      description: "A perfectly spherical natural white South Sea pearl.",
      price: 3250.00,
      images: [],
      category: "Loose Gemstones",
      stoneType: "Pearl",
      stoneColor: "White",
      caratWeight: 0, // Pearls often use mm, but caratWeight is Float in schema
      origin: "Australia",
      certification: "None",
      stockQty: 8,
      isFeatured: true,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
