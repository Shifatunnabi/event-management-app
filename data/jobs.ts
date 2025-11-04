export interface Job {
  id: string
  title: string
  eventName: string
  organizer: string
  location: string
  date: string
  duration: string
  salary: string
  type: string
  description: string
  requirements: string[]
  postedDate: string
  applicants: number
}

export const jobs: Job[] = [
  {
    id: "J001",
    title: "Event Photographer",
    eventName: "NEON COUNTDOWN 2025",
    organizer: "MegaEvents Co.",
    location: "Bangkok, Thailand",
    date: "2025-12-30",
    duration: "1 Day",
    salary: "$500 - $800",
    type: "Freelance",
    description:
      "We are looking for an experienced event photographer to capture the highlights of our New Year countdown festival. You will be responsible for taking high-quality photos of performances, crowd moments, and behind-the-scenes action.",
    requirements: [
      "Professional camera equipment",
      "3+ years of event photography experience",
      "Portfolio of previous event work",
      "Ability to work in low-light conditions",
      "Quick turnaround for photo delivery",
    ],
    postedDate: "2025-10-20",
    applicants: 23,
  },
  {
    id: "J002",
    title: "Stage Manager",
    eventName: "Tech Summit 2025",
    organizer: "TechHub Asia",
    location: "Singapore",
    date: "2025-11-15",
    duration: "3 Days",
    salary: "$1200 - $1500",
    type: "Contract",
    description:
      "Seeking an experienced stage manager to coordinate all technical aspects of our tech conference. You will oversee stage setup, manage speaker transitions, and ensure smooth event flow.",
    requirements: [
      "5+ years of stage management experience",
      "Experience with large-scale conferences",
      "Strong communication skills",
      "Technical knowledge of AV equipment",
      "Ability to handle high-pressure situations",
    ],
    postedDate: "2025-10-18",
    applicants: 15,
  },
  {
    id: "J003",
    title: "Event Coordinator",
    eventName: "Food & Wine Festival",
    organizer: "Culinary Arts Society",
    location: "Phuket, Thailand",
    date: "2025-11-20",
    duration: "2 Days",
    salary: "$600 - $900",
    type: "Freelance",
    description:
      "Looking for a detail-oriented event coordinator to help manage vendor setup, guest registration, and on-site logistics for our food and wine festival.",
    requirements: [
      "2+ years of event coordination experience",
      "Excellent organizational skills",
      "Customer service experience",
      "Ability to multitask",
      "Flexible schedule",
    ],
    postedDate: "2025-10-22",
    applicants: 31,
  },
  {
    id: "J004",
    title: "Sound Engineer",
    eventName: "Jazz Under The Stars",
    organizer: "Jazz Society Thailand",
    location: "Chiang Mai, Thailand",
    date: "2025-11-25",
    duration: "1 Day",
    salary: "$400 - $600",
    type: "Freelance",
    description:
      "We need a skilled sound engineer to manage audio setup and live sound mixing for our outdoor jazz concert. Experience with live music events is essential.",
    requirements: [
      "Professional audio equipment",
      "3+ years of live sound experience",
      "Knowledge of jazz music mixing",
      "Experience with outdoor venues",
      "Problem-solving skills",
    ],
    postedDate: "2025-10-25",
    applicants: 12,
  },
  {
    id: "J005",
    title: "Registration Staff",
    eventName: "Marathon for Charity",
    organizer: "Run for Hope Foundation",
    location: "Jakarta, Indonesia",
    date: "2025-12-05",
    duration: "1 Day",
    salary: "$150 - $200",
    type: "Part-time",
    description:
      "Seeking friendly and organized individuals to manage participant registration and packet pickup for our charity marathon event.",
    requirements: [
      "Customer service experience",
      "Good communication skills",
      "Ability to work early morning hours",
      "Basic computer skills",
      "Team player attitude",
    ],
    postedDate: "2025-10-28",
    applicants: 45,
  },
  {
    id: "J006",
    title: "Videographer",
    eventName: "Art Exhibition: Modern Asia",
    organizer: "Asia Art Gallery",
    location: "Hong Kong",
    date: "2025-11-18",
    duration: "1 Day",
    salary: "$700 - $1000",
    type: "Freelance",
    description:
      "Looking for a creative videographer to document our art exhibition opening and create promotional content for social media.",
    requirements: [
      "Professional video equipment",
      "Experience with event videography",
      "Social media content creation skills",
      "Quick editing turnaround",
      "Creative eye for composition",
    ],
    postedDate: "2025-10-15",
    applicants: 19,
  },
]
