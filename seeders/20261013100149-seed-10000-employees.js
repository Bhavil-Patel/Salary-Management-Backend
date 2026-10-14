"use strict";

const firstNames = [
  "Aarav", "Vivaan", "Aditya", "Arjun", "Rahul",
  "Rohan", "Karan", "Ishaan", "Kabir", "Reyansh",
  "Aanya", "Aadhya", "Saanvi", "Ananya", "Diya",
  "Priya", "Neha", "Isha", "Kavya", "Anika",
  "John", "James", "Robert", "Michael", "William",
  "David", "Joseph", "Daniel", "Matthew", "Andrew",
  "Emma", "Olivia", "Sophia", "Isabella", "Mia",
  "Charlotte", "Amelia", "Harper", "Evelyn", "Ella",
  "Liam", "Noah", "Lucas", "Ethan", "Benjamin",
  "Alexander", "Henry", "Mason", "Logan", "Jack",
  "Aisha", "Fatima", "Zara", "Sara", "Layla",
  "Omar", "Ali", "Yusuf", "Hassan", "Adam",
  "Mei", "Wei", "Yuki", "Hana", "Kenji",
  "Sofia", "Elena", "Maria", "Carlos", "Diego",
  "Chloe", "Grace", "Lily", "Emily", "Hannah",
  "Samuel", "Ryan", "Nathan", "Isaac", "Leo",
  "Daniela", "Gabriel", "Mateo", "Lucas", "Nora",
];

const lastNames = [
  "Shah", "Patel", "Sharma", "Verma", "Mehta",
  "Desai", "Joshi", "Trivedi", "Reddy", "Nair",
  "Gupta", "Malhotra", "Kapoor", "Singh", "Kumar",
  "Smith", "Brown", "Wilson", "Taylor", "Martin",
  "Thomas", "Clark", "Lewis", "Walker", "Hall",
  "Young", "Allen", "King", "Wright", "Scott",
  "Anderson", "Thompson", "White", "Harris", "Moore",
  "Jackson", "Lee", "Perez", "Robinson", "Miller",
  "Davis", "Garcia", "Rodriguez", "Martinez", "Lopez",
  "Gonzalez", "Hernandez", "Ramirez", "Torres", "Chen",
  "Wang", "Li", "Zhang", "Liu", "Tanaka",
  "Sato", "Suzuki", "Takahashi", "Watanabe", "Khan",
  "Ahmed", "Hussain", "Sheikh", "Malik", "Johnson",
  "Campbell", "Mitchell", "Roberts", "Williams", "Evans",
  "Davies", "MacDonald", "Fraser", "Stewart", "Morrison",
  "Wilson", "Brown", "Morris", "Cooper", "Bailey",
];

const jobs = [
  "Senior Software Engineer",
  "Software Engineer",
  "Product Manager",
  "Sales Executive",
  "Marketing Specialist",
  "Accountant",
  "HR Generalist",
  "Operations Analyst",
];

const departments = [
  "Engineering",
  "Sales",
  "Marketing",
  "Finance",
  "HR",
  "Operations",
];

const locations = [
  { country_code: "IN", minSalary: 15000, maxSalary: 80000 },
  { country_code: "US", minSalary: 10000, maxSalary: 50000 },
  { country_code: "GB", minSalary: 5000, maxSalary: 50000 },
  { country_code: "CA", minSalary: 4000, maxSalary: 20000 },
  { country_code: "AU", minSalary: 5000, maxSalary: 60000 },
];

const TOTAL_EMPLOYEES = 10000;
const BATCH_SIZE = 1000;

function generateSalary(location) {
  return Math.trunc(
    location.minSalary +
    Math.random() * (location.maxSalary - location.minSalary)
  );
}

function generateHireDate() {
  const startDate = Date.UTC(2015, 0, 1);
  const endDate = Date.UTC(2026, 9, 13);
  const timestamp =
    startDate + Math.random() * (endDate - startDate);

  return new Date(timestamp).toISOString().slice(0, 10);
}

module.exports = {
  async up(queryInterface) {
    if (
      !firstNames.length ||
      !lastNames.length ||
      !jobs.length ||
      !departments.length
    ) {
      throw new Error(
        "Seeder arrays cannot be empty: firstNames, lastNames, jobs, departments."
      );
    }

    const [countries] = await queryInterface.sequelize.query(
      "SELECT id, country_code FROM countries"
    );

    const countryIdMap = new Map(
      countries.map((country) => [
        country.country_code.trim().toUpperCase(),
        country.id,
      ])
    );

    for (const location of locations) {
      if (!countryIdMap.has(location.country_code)) {
        throw new Error(
          `Country ${location.country_code} is missing from countries table. Run the countries migration first.`
        );
      }
    }

    for (
      let start = 1;
      start <= TOTAL_EMPLOYEES;
      start += BATCH_SIZE
    ) {
      const employees = [];
      const end = Math.min(
        start + BATCH_SIZE,
        TOTAL_EMPLOYEES + 1
      );

      for (let i = start; i < end; i++) {
        const firstName =
          firstNames[(i - 1) % firstNames.length];

        const lastName =
          lastNames[
          Math.floor((i - 1) / firstNames.length) %
          lastNames.length
          ];

        const location = locations[(i - 1) % locations.length];

        const emailName = `${firstName}.${lastName}.${i}`
          .toLowerCase()
          .replace(/[^a-z0-9.]/g, "");

        const now = new Date();

        employees.push({
          full_name: `${firstName} ${lastName}`,
          email: `${emailName}@example.com`,
          job_title: jobs[(i - 1) % jobs.length],
          department: departments[(i - 1) % departments.length],
          country_id: countryIdMap.get(location.country_code),
          salary: generateSalary(location),
          hire_date: generateHireDate(),
          created_at: now,
          updated_at: now,
          deleted_at: null,
        });
      }

      await queryInterface.bulkInsert("employees", employees);
      console.log(`Inserted employees ${start}-${end - 1}`);
    }
    console.log(`Successfully seeded ${TOTAL_EMPLOYEES} employees.`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("employees", {
      email: {
        [Sequelize.Op.like]: "%@example.com",
      },
    });

    console.log("Removed seeded example.com employees.");
  },
};