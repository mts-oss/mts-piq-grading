const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.class.createMany({
    data: [
      { id: '7A', name: 'Kelas 7A' },
      { id: '7B', name: 'Kelas 7B' },
      { id: '8A', name: 'Kelas 8A' },
    ]
  });

  await prisma.subject.createMany({
    data: [
      { id: 'M001', name: 'Pendidikan Agama Islam' },
      { id: 'M002', name: 'Bahasa Arab' },
      { id: 'M003', name: 'Matematika' },
    ]
  });

  await prisma.teacher.createMany({
    data: [
      { id: 'G001', name: 'Drs. H. Abdul Somad' },
      { id: 'G002', name: 'Siti Aminah, S.Pd' },
    ]
  });

  await prisma.student.createMany({
    data: [
      { id: '1001', name: 'Ahmad Fauzi', classId: '7A' },
      { id: '1002', name: 'Budi Santoso', classId: '7A' },
      { id: '1003', name: 'Citra Lestari', classId: '7A' },
      { id: '1004', name: 'Dewi Sartika', classId: '7B' },
    ]
  });

  console.log('Seed completed.');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
