import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.relationship.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const alice = await prisma.user.create({
    data: {
      id: '1',
      username: 'alice',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      bio: 'Software developer',
      createdAt: new Date('2024-01-01'),
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: '2',
      username: 'bob',
      email: 'bob@example.com',
      name: 'Bob Smith',
      bio: 'Designer',
      createdAt: new Date('2024-01-02'),
    },
  });

  const charlie = await prisma.user.create({
    data: {
      id: '3',
      username: 'charlie',
      email: 'charlie@example.com',
      name: 'Charlie Brown',
      bio: 'Product manager',
      createdAt: new Date('2024-01-03'),
    },
  });

  console.log('Created users:', { alice, bob, charlie });

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      id: '1',
      userId: alice.id,
      title: 'My First Post',
      content: 'This is my first post on the platform!',
      createdAt: new Date('2024-01-05'),
    },
  });

  const post2 = await prisma.post.create({
    data: {
      id: '2',
      userId: bob.id,
      title: 'Design Principles',
      content: 'Here are some design principles I follow...',
      createdAt: new Date('2024-01-06'),
    },
  });

  const post3 = await prisma.post.create({
    data: {
      id: '3',
      userId: alice.id,
      title: 'GraphQL Tutorial',
      content: 'Learning GraphQL is fun!',
      createdAt: new Date('2024-01-07'),
    },
  });

  console.log('Created posts:', { post1, post2, post3 });

  // Create relationships (follows)
  const rel1 = await prisma.relationship.create({
    data: {
      id: '1',
      followerId: bob.id,
      followingId: alice.id,
      createdAt: new Date('2024-01-08'),
    },
  });

  const rel2 = await prisma.relationship.create({
    data: {
      id: '2',
      followerId: charlie.id,
      followingId: alice.id,
      createdAt: new Date('2024-01-09'),
    },
  });

  const rel3 = await prisma.relationship.create({
    data: {
      id: '3',
      followerId: alice.id,
      followingId: bob.id,
      createdAt: new Date('2024-01-10'),
    },
  });

  console.log('Created relationships:', { rel1, rel2, rel3 });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
