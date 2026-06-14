import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Robes",
    slug: "robes",
    description: "Robes elegantes pour occasions premium.",
    imageUrl: "https://placehold.co/1200x1600/0B0B0B/C8A24A?text=Robes",
  },
  {
    name: "Vestes",
    slug: "vestes",
    description: "Vestes structurees et pieces de saison.",
    imageUrl: "https://placehold.co/1200x1600/0B0B0B/C8A24A?text=Vestes",
  },
  {
    name: "Chemises",
    slug: "chemises",
    description: "Chemises raffinees aux coupes modernes.",
    imageUrl: "https://placehold.co/1200x1600/0B0B0B/C8A24A?text=Chemises",
  },
  {
    name: "Accessoires",
    slug: "accessoires",
    description: "Accessoires de finition pour silhouettes luxe.",
    imageUrl: "https://placehold.co/1200x1600/0B0B0B/C8A24A?text=Accessoires",
  },
];

const products = [
  {
    name: "Robe Saphir Noir",
    slug: "robe-saphir-noir",
    description:
      "Robe fluide noire avec finitions dorees, pensee pour les soirees elegantes.",
    price: "1290.00",
    oldPrice: "1490.00",
    isFeatured: true,
    categorySlug: "robes",
    images: [
      "https://placehold.co/1200x1600/0B0B0B/F8F5EF?text=Robe+Saphir",
      "https://placehold.co/1200x1600/C8A24A/0B0B0B?text=Detail+Robe",
    ],
    variants: [
      { size: "S", color: "Noir", stock: 8, sku: "YKL-ROBE-SAPHIR-NOIR-S" },
      { size: "M", color: "Noir", stock: 12, sku: "YKL-ROBE-SAPHIR-NOIR-M" },
      { size: "L", color: "Noir", stock: 6, sku: "YKL-ROBE-SAPHIR-NOIR-L" },
    ],
  },
  {
    name: "Veste Atlas Ivoire",
    slug: "veste-atlas-ivoire",
    description:
      "Veste ivoire taillee avec une ligne nette et une presence contemporaine.",
    price: "1890.00",
    oldPrice: null,
    isFeatured: true,
    categorySlug: "vestes",
    images: [
      "https://placehold.co/1200x1600/F8F5EF/0B0B0B?text=Veste+Atlas",
      "https://placehold.co/1200x1600/E8DED0/0B0B0B?text=Detail+Veste",
    ],
    variants: [
      { size: "S", color: "Ivoire", stock: 5, sku: "YKL-VESTE-ATLAS-IVOIRE-S" },
      { size: "M", color: "Ivoire", stock: 9, sku: "YKL-VESTE-ATLAS-IVOIRE-M" },
      { size: "L", color: "Ivoire", stock: 4, sku: "YKL-VESTE-ATLAS-IVOIRE-L" },
    ],
  },
  {
    name: "Chemise Perle",
    slug: "chemise-perle",
    description:
      "Chemise beige premium avec toucher doux et silhouette minimaliste.",
    price: "690.00",
    oldPrice: "790.00",
    isFeatured: false,
    categorySlug: "chemises",
    images: ["https://placehold.co/1200x1600/E8DED0/0B0B0B?text=Chemise+Perle"],
    variants: [
      {
        size: "S",
        color: "Beige",
        stock: 14,
        sku: "YKL-CHEMISE-PERLE-BEIGE-S",
      },
      {
        size: "M",
        color: "Beige",
        stock: 18,
        sku: "YKL-CHEMISE-PERLE-BEIGE-M",
      },
      {
        size: "L",
        color: "Beige",
        stock: 10,
        sku: "YKL-CHEMISE-PERLE-BEIGE-L",
      },
    ],
  },
  {
    name: "Ceinture Or Signature",
    slug: "ceinture-or-signature",
    description:
      "Ceinture noire avec boucle doree, concue comme accent signature.",
    price: "390.00",
    oldPrice: null,
    isFeatured: false,
    categorySlug: "accessoires",
    images: [
      "https://placehold.co/1200x1600/0B0B0B/C8A24A?text=Ceinture+Signature",
    ],
    variants: [
      {
        size: "85",
        color: "Noir",
        stock: 20,
        sku: "YKL-CEINTURE-SIGNATURE-NOIR-85",
      },
      {
        size: "95",
        color: "Noir",
        stock: 16,
        sku: "YKL-CEINTURE-SIGNATURE-NOIR-95",
      },
    ],
  },
];

async function seedAdmin() {
  const password = await bcrypt.hash("Admin123456", 12);

  await prisma.user.upsert({
    where: { email: "admin@yakoutluxury.com" },
    update: {
      firstName: "Yakout",
      lastName: "Admin",
      password,
      role: Role.ADMIN,
      isVerified: true,
      isActive: true,
    },
    create: {
      firstName: "Yakout",
      lastName: "Admin",
      email: "admin@yakoutluxury.com",
      password,
      role: Role.ADMIN,
      isVerified: true,
      isActive: true,
    },
  });
}

async function seedCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
}

async function seedProducts() {
  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: product.categorySlug },
      select: { id: true },
    });

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice,
        isFeatured: product.isFeatured,
        isActive: true,
        categoryId: category.id,
        images: {
          deleteMany: {},
          create: product.images.map((url, index) => ({
            url,
            alt: product.name,
            position: index,
          })),
        },
        variants: {
          deleteMany: {},
          create: product.variants,
        },
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice,
        isFeatured: product.isFeatured,
        isActive: true,
        categoryId: category.id,
        images: {
          create: product.images.map((url, index) => ({
            url,
            alt: product.name,
            position: index,
          })),
        },
        variants: {
          create: product.variants,
        },
      },
    });
  }
}

async function main() {
  await seedAdmin();
  await seedCategories();
  await seedProducts();

  console.log("Yakout Luxury seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
