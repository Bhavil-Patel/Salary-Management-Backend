
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
  "Software Engineer",
  "Senior Software Engineer",
  "Junior Software Developer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Mobile App Developer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Data Engineer",
  "Data Analyst",
  "Senior Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Engineer",
  "Database Administrator",
  "Cybersecurity Analyst",
  "Network Engineer",
  "System Administrator",
  "QA Engineer",
  "Automation Test Engineer",
  "QA Manager",
  "Product Manager",
  "Project Manager",
  "Program Manager",
  "Business Analyst",
  "Business Intelligence Analyst",
  "Technical Lead",
  "Engineering Manager",
  "HR Executive",
  "HR Manager",
  "Talent Acquisition Specialist",
  "Recruiter",
  "Training Coordinator",
  "Accountant",
  "Finance Analyst",
  "Finance Manager",
  "Auditor",
  "Payroll Specialist",
  "Marketing Executive",
  "Digital Marketing Specialist",
  "SEO Specialist",
  "Content Writer",
  "Social Media Manager",
  "Brand Manager",
  "Sales Executive",
  "Sales Manager",
  "Account Manager",
  "Customer Success Manager",
  "Customer Support Executive",
  "Support Engineer",
  "Operations Manager",
  "Operations Analyst",
  "Supply Chain Analyst",
  "Logistics Coordinator",
  "Procurement Specialist",
  "Legal Counsel",
  "Compliance Officer",
  "Graphic Designer",
  "UI Designer",
  "UX Designer",
  "Product Designer",
  "Technical Writer",
  "Research Analyst",
  "Consultant",
  "Administrative Assistant",
  "Office Manager",
  "Executive Assistant",
  "Facilities Manager",
  "Regional Manager",
  "Director of Engineering",
  "Director of Marketing",
  "Business Development Manager",
  "Account Executive",
  "Customer Experience Manager",
];

const departments = [
  "Engineering",
  "Software Development",
  "Frontend Development",
  "Backend Development",
  "Mobile Development",
  "DevOps",
  "Cloud Infrastructure",
  "Data Engineering",
  "Data Analytics",
  "Artificial Intelligence",
  "Machine Learning",
  "Information Technology",
  "Cybersecurity",
  "Quality Assurance",
  "Product Management",
  "Project Management",
  "Business Analysis",
  "Research and Development",
  "Human Resources",
  "Talent Acquisition",
  "Learning and Development",
  "Finance",
  "Accounting",
  "Payroll",
  "Internal Audit",
  "Marketing",
  "Digital Marketing",
  "Content and Communications",
  "Sales",
  "Business Development",
  "Customer Support",
  "Customer Success",
  "Operations",
  "Supply Chain",
  "Logistics",
  "Procurement",
  "Legal",
  "Compliance",
  "Administration",
  "Facilities Management",
  "Design",
  "UI/UX Design",
  "Graphic Design",
  "Strategy",
  "Corporate Communications",
  "Public Relations",
  "Risk Management",
  "Quality Management",
  "Product Research",
  "Executive Management",
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
    const [countries] = await queryInterface.sequelize.query(
      "SELECT country_code FROM countries"
    );

    const existingCodes = new Set(
      countries.map((country) => country.country_code.trim())
    );

    for (const location of locations) {
      if (!existingCodes.has(location.country_code)) {
        throw new Error(
          `Country ${location.country_code} is missing from countries table. Run migrations first.`
        );
      }
    }

    for (let start = 1; start <= TOTAL_EMPLOYEES; start += BATCH_SIZE) {
      const employees = [];
      const end = Math.min(start + BATCH_SIZE, TOTAL_EMPLOYEES + 1);

      for (let i = start; i < end; i++) {
        const firstName = firstNames[(i - 1) % firstNames.length];
        const lastName = lastNames[
          Math.floor((i - 1) / firstNames.length) %
          lastNames.length
        ];

        const location = locations[(i - 1) % locations.length];
        const fullName = `${firstName} ${lastName}`;
        const emailName = `${firstName}.${lastName}.${i}`.toLowerCase().replace(/[^a-z0-9.]/g, "");
        const now = new Date();

        employees.push({
          full_name: fullName,
          email: `${emailName}@example.com`,
          job_title: jobs[(i - 1) % jobs.length],
          department: departments[(i - 1) % departments.length],
          country_code: location.country_code,
          salary: generateSalary(location),
          hire_date: generateHireDate(),
          created_at: now,
          updated_at: now,
        });
      }

      await queryInterface.bulkInsert("employees", employees);
      console.log(`Inserted employees ${start}-${end - 1}`);
    }
    console.log(`Successfully seeded ${TOTAL_EMPLOYEES} employees.`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "employees",
      {
        email: {
          [Sequelize.Op.like]: "%@example.com",
        },
      }
    );
  },
};