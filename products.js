// Public product descriptions and destinations. Update this registry as products evolve.
export const products = [
  {
    id: "people",
    name: "Nonymauz People",
    short: "People",
    category: "work",
    categoryLabel: "People & HR",
    icon: "users",
    tone: "blue",
    headline: "Take care of your people.",
    description:
      "Employees, attendance, leave, payroll, and recruitment. Give your team one clear place to work.",
    features: [
      "Employee records & self-service",
      "Attendance, leave & approvals",
      "Payroll & claims",
      "Recruitment & People AI",
    ],
    detail:
      "An HR workspace built around the day-to-day needs of Malaysian teams. Manage employee records, review requests, prepare payroll, and organise recruitment with role-based access.",
    note: "AI, email, payroll rules, and other services depend on workspace configuration. Payroll requires employer review.",
    url: "https://hrms-delta-sooty.vercel.app",
    action: "Open People",
    visual: "people",
  },
  {
    id: "restu",
    name: "Restu.ai",
    short: "Restu.ai",
    category: "life",
    categoryLabel: "Wedding planning",
    icon: "heart",
    tone: "rose",
    headline: "A little less stress.<br>A little more restu.",
    description:
      "Keep your wedding checklist, budget, and vendor plans close. Plan your next chapter together.",
    features: [
      "Wedding checklist",
      "Budget & payments",
      "Vendor discovery",
      "Planning assistant",
    ],
    detail:
      "A wedding planning workspace for couples in Malaysia. Bring your tasks, costs, and vendor research into the same place, with an AI assistant for planning questions.",
    note: "Vendor information and official marriage requirements should be verified before making arrangements.",
    url: "https://restu-ai.vercel.app",
    action: "Open Restu.ai",
    visual: "restu",
  },
  {
    id: "kretiv",
    name: "KretivOS",
    short: "KretivOS",
    category: "work",
    categoryLabel: "Creative business",
    icon: "layers",
    tone: "lavender",
    headline: "Keep the whole picture.",
    description:
      "Connect clients, projects, content, and your team in a workspace for a creative business.",
    features: [
      "Clients & CRM pipeline",
      "Projects & delivery",
      "Content & brand planning",
      "Documents & approvals",
    ],
    detail:
      "A business workspace designed around a creative team. Follow a client from onboarding through proposals and delivery, keep brand assets and knowledge organised, and review work in an approval inbox.",
    note: "This is a business workspace. Access and connected services depend on the owning organisation’s setup.",
    url: "https://kretivos.vercel.app",
    action: "Open KretivOS",
    visual: "kretiv",
  },
  {
    id: "flow",
    name: "FlowTrack",
    short: "FlowTrack",
    category: "life",
    categoryLabel: "Personal finances",
    icon: "wallet",
    tone: "mint",
    headline: "Know where it all goes.",
    description:
      "Make room for better money habits. Keep commitments, subscriptions, and debts in view.",
    features: [
      "Monthly commitments",
      "Expense & budget tracking",
      "Subscriptions",
      "Debt overview",
    ],
    detail:
      "A personal expense tracker that gives your monthly commitments and spending a clearer home. Review your budget, organise recurring subscriptions, and keep track of debts.",
    note: "A tracking tool for your own records. It does not connect to or move money from your bank account.",
    url: "https://flow-track-sandy.vercel.app",
    action: "Open FlowTrack",
    visual: "flow",
  },
  {
    id: "power",
    name: "PowerOS",
    short: "PowerOS",
    category: "work",
    categoryLabel: "Business operations",
    icon: "briefcase",
    tone: "sand",
    headline: "Put work in motion.",
    description:
      "A broader workspace for business operations, with an AI-assisted approach to getting things done.",
    features: [
      "Business workspace",
      "Operations tools",
      "AI assistance",
      "Mobile-friendly experience",
    ],
    detail:
      "An evolving business operations workspace based on the open-source OpenKuasaOS project, with its own identity and mobile-oriented experience.",
    note: "Features and connected services are evolving. Check the app for current availability. Based on OpenKuasaOS; no affiliation is implied.",
    url: "https://power-nonymauz.vercel.app",
    action: "Open PowerOS",
    visual: "power",
  },
  {
    id: "cloud",
    name: "AI-Nonymauz Cloud",
    short: "AI Cloud",
    category: "tools",
    categoryLabel: "AI workspace",
    icon: "spark",
    tone: "ice",
    headline: "An open door to your AI.",
    description:
      "A dedicated viewer for conversations and experiments with the AI-Nonymauz backend.",
    features: [
      "AI conversations",
      "Model selection",
      "Conversation history",
      "Backend connection settings",
    ],
    detail:
      "A web interface for the AI-Nonymauz Cloud backend. Use it to test conversations, select available model aliases, and explore configured AI capabilities.",
    note: "Requires a configured backend. Model and video availability depend on providers, quotas, and enabled services.",
    url: "https://ai-nonymauz-cloud-viewer.vercel.app",
    action: "Open AI viewer",
    visual: "cloud",
  },
  {
    id: "secure",
    name: "SecureIntelligence",
    short: "SecureIntelligence",
    category: "tools",
    categoryLabel: "Developer toolkit",
    icon: "shield",
    tone: "slate",
    headline: "Build security into the workflow.",
    description:
      "Explore a security-focused project for application integration, detection, and review.",
    features: [
      "Security integration",
      "Detection & review",
      "Core & API components",
      "Developer-led setup",
    ],
    detail:
      "A security-focused development project intended for integration with other applications. Start with the repository documentation to understand its core and API components, configuration, and verification.",
    note: "A developer project, not a hosted consumer app or a guarantee of security. Review and test an integration for your application before production use.",
    url: "https://github.com/amnansyahmi/SecureIntelligence",
    action: "View repository",
    visual: "secure",
  },
];

export const productPages = {
  people: {
    number: "01",
    eyebrow: "A little more human.",
    title: "Good work starts<br>with your people.",
    audience: "For HR teams and growing businesses",
    demo: "people",
    color: "#3455db",
    summary:
      "Make everyday HR feel manageable. Bring employee information, requests, and your next decision into focus.",
    steps: [
      [
        "Bring your team together",
        "Keep employee records and self-service in one workspace.",
      ],
      [
        "Make the next decision",
        "Review leave and claims with the context you need.",
      ],
      [
        "Prepare with confidence",
        "Organise payroll and recruitment, with people reviewing the important decisions.",
      ],
    ],
    screenshot: "/assets/products/people-desktop.webp",
    mobile: "/assets/products/people-mobile.webp",
  },
  kretiv: {
    number: "02",
    eyebrow: "Make space for the good ideas.",
    title: "From the first brief<br>to the final delivery.",
    audience: "For creative teams and independent studios",
    demo: "kretiv",
    color: "#7758bd",
    summary:
      "Keep clients, projects, content, and feedback close. A shared workspace for the work behind the work.",
    steps: [
      [
        "Start with the client",
        "Organise your client relationships and keep the brief in view.",
      ],
      [
        "Give the work a home",
        "Follow projects, content plans, and the people moving them forward.",
      ],
      [
        "Keep feedback moving",
        "Bring documents and approvals into the delivery process.",
      ],
    ],
  },
  flow: {
    number: "03",
    eyebrow: "A clearer month ahead.",
    title: "Your money.<br>A little more clarity.",
    audience: "For your everyday finances",
    demo: "flow",
    color: "#247c65",
    summary:
      "See your monthly commitments, subscriptions, and debts together. Make room for the things you want to plan for.",
    steps: [
      [
        "Know your commitments",
        "Bring your regular monthly costs into one clear view.",
      ],
      [
        "See what is left",
        "Track expenses against your budget as the month unfolds.",
      ],
      [
        "Keep the future in view",
        "Review recurring subscriptions and debt commitments alongside everyday spending.",
      ],
    ],
  },
  restu: {
    number: "04",
    eyebrow: "Plan your next chapter.",
    title: "More together.<br>Less to remember.",
    audience: "For couples planning their wedding in Malaysia",
    demo: "restu",
    color: "#a35b68",
    summary:
      "The checklist, the budget, the vendor conversations. Give your wedding plans a place you can come back to together.",
    steps: [
      [
        "Start with a plan",
        "Keep a wedding checklist around the moments that matter.",
      ],
      [
        "Keep costs in view",
        "Organise your budget and payment plans as decisions take shape.",
      ],
      [
        "Find your people",
        "Explore vendors and use the planning assistant for your next questions.",
      ],
    ],
  },
  power: {
    number: "05",
    eyebrow: "Room to run your business.",
    title: "Bring the moving<br>parts into view.",
    audience: "For teams exploring a broader business workspace",
    demo: "power",
    color: "#a47536",
    summary:
      "Explore business operations and AI assistance in an evolving workspace with its own mobile-oriented identity.",
    steps: [
      [
        "Explore the workspace",
        "Start with the operations tools available in the current app.",
      ],
      [
        "Set up for your team",
        "Configure access and connected services around your organisation.",
      ],
      [
        "Work with assistance",
        "Explore AI features where they are enabled in your workspace.",
      ],
    ],
  },
  cloud: {
    number: "06",
    eyebrow: "A place to think things through.",
    title: "Your questions.<br>New possibilities.",
    audience: "For AI conversations and experiments",
    demo: "cloud",
    color: "#427da4",
    summary:
      "A dedicated interface for the AI-Nonymauz backend. Explore conversations, available models, and your next idea.",
    steps: [
      [
        "Connect your backend",
        "Use the app settings to connect a configured AI-Nonymauz service.",
      ],
      [
        "Choose your model",
        "Select from model aliases currently available through your backend.",
      ],
      [
        "Keep the conversation",
        "Return to your conversation history and continue exploring.",
      ],
    ],
  },
  secure: {
    number: "07",
    eyebrow: "Security belongs in the build.",
    title: "A considered approach<br>to safer systems.",
    audience: "For developers integrating security tooling",
    demo: "secure",
    color: "#5d6b82",
    summary:
      "Explore the core and API components of a security-focused project, with integration, detection, and review in mind.",
    steps: [
      [
        "Read the project",
        "Start with the repository documentation and supported components.",
      ],
      [
        "Plan the integration",
        "Review the core and API configuration for your application.",
      ],
      [
        "Verify in context",
        "Test behaviour and review findings before using an integration in production.",
      ],
    ],
  },
};
export const productPath = (id) => `/systems/${id}/`;
