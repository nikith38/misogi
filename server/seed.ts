import { db } from './db';
import { users, availability, sessions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from './auth';

async function seed() {
  console.log('Seeding database...');
  
  // Check if we already have users
  const existingUsers = await db.select().from(users);
  
  let mentorId: number | null = null;
  
  // Create test users if none exist
  if (existingUsers.length === 0) {
    console.log('Creating test users...');
    
    // Create a test mentee
    const [mentee] = await db.insert(users).values({
      username: 'mentee',
      password: await hashPassword('password'),
      email: 'mentee@example.com',
      firstName: 'Mentee',
      lastName: 'User',
      role: 'mentee',
      title: 'Student',
      organization: 'University',
      bio: 'Looking to learn new skills',
    }).returning();
    
    console.log('Created mentee user with ID:', mentee.id);
    
    // Create a test mentor
    const [mentor] = await db.insert(users).values({
      username: 'mentor',
      password: await hashPassword('password'),
      email: 'mentor@example.com',
      firstName: 'Mentor',
      lastName: 'Expert',
      role: 'mentor',
      title: 'Senior Developer',
      organization: 'Tech Company',
      bio: 'Experienced developer ready to help',
      specialties: ['JavaScript', 'React', 'Node.js'],
    }).returning();
    
    console.log('Created mentor user with ID:', mentor.id);
    mentorId = mentor.id;
    
    // Create another test mentor
    const [deepika] = await db.insert(users).values({
      username: 'deepika',
      password: await hashPassword('password'),
      email: 'deepika@example.com',
      firstName: 'Deepika',
      lastName: 'K',
      role: 'mentor',
      title: 'Senior Engineer',
      organization: 'Google',
      bio: 'Deepika is an experienced professional offering mentorship in various areas.',
      specialties: ['Career Growth', 'Leadership', 'Technical Skills'],
    }).returning();
    
    console.log('Created mentor Deepika with ID:', deepika.id);
  } else {
    console.log(`Found ${existingUsers.length} existing users, checking for mentors...`);
    
    // Find a mentor to add availability to
    const mentor = existingUsers.find(user => user.role === 'mentor');
    if (mentor) {
      mentorId = mentor.id;
      console.log(`Found mentor with ID: ${mentorId}`);
    }
  }
  
  // Add availability data for the first mentor
  if (mentorId) {
    // First, check if we already have availability data for this mentor
    const existingAvailability = await db.select().from(availability).where(eq(availability.mentorId, mentorId));
    
    if (existingAvailability.length === 0) {
      console.log(`Adding availability for mentor ID: ${mentorId}`);
      
      // Add availability for weekdays - use consistent capitalization
      const availabilityData = [
        // Monday
        { mentorId, day: 'Monday', startTime: '09:00', endTime: '12:00' },
        { mentorId, day: 'Monday', startTime: '13:00', endTime: '17:00' },
        
        // Tuesday
        { mentorId, day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
        
        // Wednesday
        { mentorId, day: 'Wednesday', startTime: '09:00', endTime: '11:00' },
        { mentorId, day: 'Wednesday', startTime: '14:00', endTime: '16:00' },
        
        // Thursday
        { mentorId, day: 'Thursday', startTime: '13:00', endTime: '18:00' },
        
        // Friday
        { mentorId, day: 'Friday', startTime: '09:00', endTime: '15:00' },
        
        // Weekend availability
        { mentorId, day: 'Saturday', startTime: '13:00', endTime: '15:00' },
        { mentorId, day: 'Sunday', startTime: '08:00', endTime: '09:00' },
      ];
      
      // Also add availability for Deepika
      const deepika = existingUsers.find(user => user.username === 'deepika');
      if (deepika) {
        console.log(`Adding availability for Deepika (ID: ${deepika.id})`);
        
        const deepikaAvailability = [
          // Tuesday
          { mentorId: deepika.id, day: 'Tuesday', startTime: '10:00', endTime: '13:00' },
          { mentorId: deepika.id, day: 'Tuesday', startTime: '14:00', endTime: '16:00' },
          
          // Wednesday
          { mentorId: deepika.id, day: 'Wednesday', startTime: '13:00', endTime: '17:00' },
          
          // Thursday
          { mentorId: deepika.id, day: 'Thursday', startTime: '09:00', endTime: '12:00' },
          
          // Friday
          { mentorId: deepika.id, day: 'Friday', startTime: '14:00', endTime: '18:00' },
          
          // Weekend availability
          { mentorId: deepika.id, day: 'Saturday', startTime: '10:00', endTime: '14:00' },
          { mentorId: deepika.id, day: 'Sunday', startTime: '14:00', endTime: '17:00' },
        ];
        
        // Add Deepika's availability to the main array
        availabilityData.push(...deepikaAvailability);
      }
      
      // Insert all availability
      await db.insert(availability).values(availabilityData);
      console.log(`Added ${availabilityData.length} availability slots for mentors`);
    } else {
      console.log(`Mentor already has ${existingAvailability.length} availability slots`);
    }
  }
  
  console.log('Seed completed successfully!');
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
  console.log('Seed module loaded');
}

export { seed }; 