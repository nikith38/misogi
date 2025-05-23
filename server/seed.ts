import { db } from './db';

async function seed() {
  console.log('Seeding disabled - no mock data will be created');
}

// Check if this file is being run directly (node seed.js)
if (import.meta.url.endsWith(process.argv[1])) {
  seed()
    .then(() => {
      console.log('Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error in seed script:', error);
      process.exit(1);
    });
} else {
  // Being imported by another file
  console.log('Seed module loaded - seeding disabled');
}

export { seed }; 