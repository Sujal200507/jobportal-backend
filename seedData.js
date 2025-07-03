import { Job } from "./models/job.model.js";
import { Company } from "./models/company.model.js";
import { User } from "./models/user.model.js";
import connectDB from "./db/connection.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const companiesData = [
  {
    name: "Google",
    description: "Innovative tech company specializing in search, ads, and cloud.",
    location: "Delhi NCR",
    website: "https://google.com",
    logo: "https://logo.clearbit.com/google.com"
  },
  {
    name: "Microsoft",
    description: "Leading software and cloud solutions provider.",
    location: "Bangalore",
    website: "https://microsoft.com",
    logo: "https://logo.clearbit.com/microsoft.com"
  },
  {
    name: "Nvidia",
    description: "Pioneer in GPU and AI computing.",
    location: "Hyderabad",
    website: "https://nvidia.com",
    logo: "https://logo.clearbit.com/nvidia.com"
  },
  {
    name: "Amazon",
    description: "E-commerce and cloud computing giant.",
    location: "Pune",
    website: "https://amazon.com",
    logo: "https://logo.clearbit.com/amazon.com"
  },
  {
    name: "Apple",
    description: "Innovative consumer electronics and software company.",
    location: "Chennai",
    website: "https://apple.com",
    logo: "https://logo.clearbit.com/apple.com"
  },
  {
    name: "Facebook",
    description: "Social media and technology company.",
    location: "Mumbai",
    website: "https://facebook.com",
    logo: "https://logo.clearbit.com/facebook.com"
  },
  {
    name: "Netflix",
    description: "Streaming entertainment service.",
    location: "Delhi NCR",
    website: "https://netflix.com",
    logo: "https://logo.clearbit.com/netflix.com"
  },
  {
    name: "Tesla",
    description: "Electric vehicles and clean energy.",
    location: "Bangalore",
    website: "https://tesla.com",
    logo: "https://logo.clearbit.com/tesla.com"
  },
  {
    name: "IBM",
    description: "Enterprise IT and consulting.",
    location: "Hyderabad",
    website: "https://ibm.com",
    logo: "https://logo.clearbit.com/ibm.com"
  },
  {
    name: "Intel",
    description: "Semiconductor and microprocessor leader.",
    location: "Pune",
    website: "https://intel.com",
    logo: "https://logo.clearbit.com/intel.com"
  },
  {
    name: "Oracle",
    description: "Database and cloud solutions.",
    location: "Chennai",
    website: "https://oracle.com",
    logo: "https://logo.clearbit.com/oracle.com"
  },
  {
    name: "Adobe",
    description: "Creative software and digital marketing.",
    location: "Mumbai",
    website: "https://adobe.com",
    logo: "https://logo.clearbit.com/adobe.com"
  },
  {
    name: "Salesforce",
    description: "CRM and cloud software.",
    location: "Delhi NCR",
    website: "https://salesforce.com",
    logo: "https://logo.clearbit.com/salesforce.com"
  },
  {
    name: "Cisco",
    description: "Networking and cybersecurity.",
    location: "Bangalore",
    website: "https://cisco.com",
    logo: "https://logo.clearbit.com/cisco.com"
  },
  {
    name: "Samsung",
    description: "Electronics and technology.",
    location: "Hyderabad",
    website: "https://samsung.com",
    logo: "https://logo.clearbit.com/samsung.com"
  }
];

const jobTemplates = [
  {
    title: "Frontend Developer",
    description: "We are looking for a Frontend Developer who can create beautiful, responsive, and user-friendly web interfaces using React and modern JavaScript frameworks. You should have a keen eye for design and UX.",
    requirements: ["React", "JavaScript", "CSS", "HTML"],
    salary: 3,
    location: "Delhi NCR",
    jobType: "Full-time",
    experienceLevel: "Mid-level",
    position: 2,
    industry: "Frontend Developer"
  },
  {
    title: "Backend Developer",
    description: "We need a Backend Developer who can build robust APIs and also collaborate with frontend teams to deliver professional UI web pages. Experience with Node.js, Express, and database design is required.",
    requirements: ["Node.js", "Express", "MongoDB"],
    salary: 7.5,
    location: "Bangalore",
    jobType: "Full-time",
    experienceLevel: "Senior",
    position: 1,
    industry: "Backend Developer"
  },
  {
    title: "Data Scientist",
    description: "Join our team as a Data Scientist to analyze large datasets, build predictive models, and provide actionable insights for business growth. You should be comfortable with Python and machine learning libraries.",
    requirements: ["Python", "Machine Learning", "SQL"],
    salary: 12,
    location: "Hyderabad",
    jobType: "Full-time",
    experienceLevel: "Senior",
    position: 1,
    industry: "Data Science"
  },
  {
    title: "FullStack Developer",
    description: "We are seeking a FullStack Developer who can work on both frontend and backend, delivering end-to-end solutions for web applications. You should be able to design APIs and create interactive UIs.",
    requirements: ["React", "Node.js", "MongoDB"],
    salary: 10,
    location: "Pune",
    jobType: "Full-time",
    experienceLevel: "Mid-level",
    position: 2,
    industry: "FullStack Developer"
  },
  {
    title: "Nextjs Developer",
    description: "Looking for a Next.js Developer to build server-side rendered React applications with excellent SEO and performance. Experience with SSR, SSG, and API routes is a plus.",
    requirements: ["Next.js", "React", "SSR"],
    salary: 15,
    location: "Chennai",
    jobType: "Full-time",
    experienceLevel: "Mid-level",
    position: 1,
    industry: "Nextjs Developer"
  },
  // Add more job templates for each filter option as needed
];

const allCities = ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Chennai", "Mumbai"];
const allIndustries = ["Frontend Developer", "Backend Developer", "Data Science", "FullStack Developer", "Nextjs Developer"];
const allSalaries = [3, 3.5, 4, 4.5, 5, 6, 7.5, 8, 10, 12, 15, 20, 25, 30, 40, 50];

const setupSampleData = async () => {
  try {
    await connectDB();

    // Remove all existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});

    // Create recruiter users and companies
    const users = [];
    const companies = [];
    for (let i = 0; i < companiesData.length; i++) {
      const company = companiesData[i];
      const hashedPassword = await bcrypt.hash("password123", 10);
      const user = await User.create({
        fullname: `${company.name} Recruiter`,
        email: `${company.name.toLowerCase().replace(/ /g, "")}@example.com`,
        password: hashedPassword,
        role: "recruiter",
        phoneNumber: `99999999${(i+1).toString().padStart(2, '0')}`
      });
      users.push(user);
      const createdCompany = await Company.create({
        ...company,
        userId: user._id
      });
      companies.push(createdCompany);
    }

    // Only 12 jobs, each from a different company (if possible)
    let jobCount = 0;
    let createdJobs = [];
    for (let i = 0; i < 12; i++) {
      const user = users[i % users.length];
      const company = companies[i % companies.length];
      const job = {
        ...jobTemplates[i % jobTemplates.length],
        salary: allSalaries[i % allSalaries.length],
        location: allCities[i % allCities.length],
        industry: allIndustries[i % allIndustries.length],
        company: company._id,
        created_by: user._id
      };
      const createdJob = await Job.create(job);
      if (createdJobs.length < 5) createdJobs.push(createdJob);
      jobCount++;
    }
    console.log(`Sample data setup completed! ${companies.length} companies, ${jobCount} jobs.`);
    console.log('First 5 jobs for verification:', createdJobs.map(j => ({title: j.title, salary: j.salary, company: j.company})));
  } catch (error) {
    console.error("Error setting up sample data:", error);
  } finally {
    process.exit(0);
  }
};

setupSampleData(); 