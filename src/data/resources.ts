export interface Resource {
  title: string;
  description: string;
  url: string;
  badge?: string;
}

export interface ResourceCategory {
  id: string;
  label: string;
  color: "blue" | "orange" | "green" | "purple";
  resources: Resource[];
}

export interface GlossaryTerm {
  term: string;
  acronym?: string;
  definition: string;
}

export const resourceCategories: ResourceCategory[] = [
  {
    id: "participants",
    label: "For Participants",
    color: "blue",
    resources: [
      {
        title: "Understanding Your NDIS Plan",
        description: "Official guide to understanding your NDIS plan, budget categories, and how to use your funding effectively.",
        url: "https://www.ndis.gov.au/participants/using-your-plan",
        badge: "Essential",
      },
      {
        title: "Participant Rights and Responsibilities",
        description: "Your rights as an NDIS participant include choice and control, privacy, dignity of risk, and access to advocacy. Your responsibilities include using funds as agreed and keeping the NDIA informed of changes.",
        url: "https://www.ndis.gov.au/understanding/supports-funded-ndis/reasonable-and-necessary-supports",
      },
      {
        title: "Choosing and Managing Providers",
        description: "How to find, choose, change, and manage your NDIS service providers, including what to look for in service agreements.",
        url: "https://www.ndis.gov.au/participants/working-providers",
      },
      {
        title: "Plan Management Options",
        description: "Understand the three ways to manage your NDIS funding: self-managed, plan-managed, and NDIA-managed (agency-managed).",
        url: "https://www.ndis.gov.au/participants/using-your-plan/managing-your-funding",
      },
      {
        title: "How to Lodge a Complaint",
        description: "If you're unhappy with an NDIS provider or the NDIA, you can lodge a complaint with the NDIS Quality and Safeguards Commission. Complaints can be made online, by phone (1800 035 544), or by post.",
        url: "https://www.ndiscommission.gov.au/about/complaints",
        badge: "Important",
      },
      {
        title: "NDIS Appeals and Reviews",
        description: "How to request an internal review of an NDIS decision or appeal to the Administrative Appeals Tribunal (AAT) if you disagree with your plan.",
        url: "https://www.ndis.gov.au/participants/using-your-plan/changing-your-plan/reviewing-your-plan",
      },
      {
        title: "Accessing an NDIS Advocate",
        description: "Free, independent advocacy services are available to help you understand and exercise your rights, and to navigate the NDIS system.",
        url: "https://www.ndis.gov.au/understanding/families-and-carers/advocacy",
      },
      {
        title: "Early Childhood Approach",
        description: "Information for families of children under 9 who may need early childhood supports and how to access the NDIS.",
        url: "https://www.ndis.gov.au/understanding/families-and-carers/early-childhood-approach",
      },
    ],
  },
  {
    id: "providers",
    label: "For Providers",
    color: "orange",
    resources: [
      {
        title: "NDIS Provider Registration",
        description: "Step-by-step guide to registering as an NDIS provider with the NDIS Quality and Safeguards Commission, including registration groups and audit requirements.",
        url: "https://www.ndiscommission.gov.au/providers/registered-ndis-providers/provider-registration",
        badge: "Essential",
      },
      {
        title: "NDIS Price Guide & Support Catalogue",
        description: "The current NDIS Pricing Arrangements and Price Limits document sets the maximum prices registered providers can charge for supports. Updated annually by the NDIA.",
        url: "https://www.ndis.gov.au/providers/pricing-arrangements",
        badge: "Essential",
      },
      {
        title: "NDIS Quality & Safeguards Commission",
        description: "The Commission regulates NDIS providers, handles complaints, monitors compliance, and promotes the safety and quality of NDIS supports across Australia.",
        url: "https://www.ndiscommission.gov.au/",
      },
      {
        title: "NDIS Practice Standards",
        description: "The NDIS Practice Standards outline the quality requirements that registered NDIS providers must meet, covering participant rights, governance, and support delivery.",
        url: "https://www.ndiscommission.gov.au/providers/ndis-practice-standards",
      },
      {
        title: "Code of Conduct",
        description: "The NDIS Code of Conduct requires all providers and workers to act with integrity and respect. Applies to both registered and unregistered providers.",
        url: "https://www.ndiscommission.gov.au/providers/ndis-code-conduct",
      },
      {
        title: "Worker Screening Requirements",
        description: "Information on the NDIS Worker Screening Check - a national check required for workers delivering certain NDIS supports in risk-assessed roles.",
        url: "https://www.ndiscommission.gov.au/workers/worker-screening",
      },
      {
        title: "Incident Management & Reporting",
        description: "Requirements for registered providers to have an incident management system and report certain incidents (including reportable incidents) to the Commission.",
        url: "https://www.ndiscommission.gov.au/providers/incident-management-and-reportable-incidents",
      },
      {
        title: "Behaviour Support Requirements",
        description: "Obligations for providers whose participants have behaviour support plans, including use of regulated restrictive practices.",
        url: "https://www.ndiscommission.gov.au/providers/behaviour-support",
      },
    ],
  },
  {
    id: "forms",
    label: "Forms & Guides",
    color: "green",
    resources: [
      {
        title: "Access Request Form (NDIS Application)",
        description: "The official form to apply for access to the NDIS. Submit to the NDIA to determine eligibility.",
        url: "https://www.ndis.gov.au/applying-access-ndis/how-apply",
      },
      {
        title: "Service Agreement Template",
        description: "A template service agreement to use between participants and providers, covering supports, cost, and cancellation terms.",
        url: "https://www.ndis.gov.au/participants/working-providers/service-agreements",
      },
      {
        title: "Plan Review Request",
        description: "Request an unscheduled plan review if your circumstances have changed and your current plan no longer meets your needs.",
        url: "https://www.ndis.gov.au/participants/using-your-plan/changing-your-plan",
      },
      {
        title: "NDIS Complaint Form (Commission)",
        description: "Submit a complaint about an NDIS provider or worker directly to the NDIS Quality and Safeguards Commission.",
        url: "https://www.ndiscommission.gov.au/about/complaints/how-make-complaint",
      },
      {
        title: "Provider Registration Application",
        description: "Start your registration as an NDIS provider through the Commission's online portal.",
        url: "https://www.ndiscommission.gov.au/providers/registered-ndis-providers/provider-registration/how-apply",
      },
      {
        title: "Payment Request / Claiming Guide",
        description: "How providers and plan managers submit payment requests through the NDIS myplace provider portal.",
        url: "https://www.ndis.gov.au/providers/working-provider/claiming-payments",
      },
      {
        title: "Supported Decision Making Resources",
        description: "Guides and templates to help participants make decisions about their life with appropriate support.",
        url: "https://www.ndis.gov.au/understanding/supports-funded-ndis/reasonable-and-necessary-supports",
      },
      {
        title: "NDIS Annual Price Guide (PDF)",
        description: "Download the current NDIS Pricing Arrangements and Price Limits document for detailed support pricing.",
        url: "https://www.ndis.gov.au/providers/pricing-arrangements",
        badge: "PDF",
      },
    ],
  },
];

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Supported Independent Living",
    acronym: "SIL",
    definition: "Funding for supports to help a participant live as independently as possible in their own home or shared accommodation. SIL covers the cost of paid support workers, not the accommodation itself.",
  },
  {
    term: "Specialist Disability Accommodation",
    acronym: "SDA",
    definition: "Funding for purpose-built or significantly modified housing for participants with very high support needs or an extreme functional impairment. SDA covers the bricks-and-mortar cost.",
  },
  {
    term: "Short Term Accommodation",
    acronym: "STA",
    definition: "Funding for temporary accommodation and support away from home (up to 28 days per year). Also known as respite, it gives participants new experiences and gives carers a break.",
  },
  {
    term: "Core Supports",
    acronym: "Core",
    definition: "One of the three NDIS budget categories. Core Supports fund everyday activities including assistance with daily life, consumables, social and community participation, and transport.",
  },
  {
    term: "Capacity Building Supports",
    acronym: "CB",
    definition: "One of the three NDIS budget categories. Capacity Building Supports are designed to build a participant's independence and skills over time, across areas like employment, social participation, and daily living.",
  },
  {
    term: "Capital Supports",
    acronym: "Capital",
    definition: "One of the three NDIS budget categories. Capital Supports fund higher-cost items including assistive technology, home modifications, and Specialist Disability Accommodation.",
  },
  {
    term: "National Disability Insurance Agency",
    acronym: "NDIA",
    definition: "The independent statutory agency that implements the NDIS. The NDIA assesses and plans for participant needs, manages funding, and oversees the scheme.",
  },
  {
    term: "National Disability Insurance Scheme",
    acronym: "NDIS",
    definition: "Australia's national scheme for people with significant and permanent disability. The NDIS provides individualised funding and support to eligible Australians under age 65.",
  },
  {
    term: "NDIS Quality and Safeguards Commission",
    acronym: "Commission",
    definition: "The independent Commonwealth agency that regulates NDIS providers, handles complaints, and promotes the safety and quality of NDIS supports and services.",
  },
  {
    term: "Support Coordinator",
    acronym: "SC",
    definition: "A funded role in some NDIS plans to help participants understand and implement their plan, connect with providers, and coordinate supports across multiple services.",
  },
  {
    term: "Specialist Support Coordinator",
    acronym: "SSC",
    definition: "A higher-level support coordinator with specialist skills to manage complex support needs and crisis situations.",
  },
  {
    term: "Local Area Coordinator",
    acronym: "LAC",
    definition: "A partner organisation funded by the NDIA to help people access the NDIS, develop their plans, and connect with mainstream and community services.",
  },
  {
    term: "Assistive Technology",
    acronym: "AT",
    definition: "Equipment, devices, or systems that help a participant to perform tasks they would otherwise have difficulty doing. Ranges from low-cost items (grab rails) to high-cost (power wheelchairs).",
  },
  {
    term: "Plan Management",
    acronym: "PM",
    definition: "A funded support where a registered plan manager handles the financial and administrative aspects of a participant's NDIS plan, paying providers and tracking budgets.",
  },
  {
    term: "Self-Management",
    acronym: "Self-Managed",
    definition: "When a participant (or their nominee) manages their own NDIS funds directly - paying providers, keeping records, and claiming reimbursements from the NDIA.",
  },
  {
    term: "Agency-Managed",
    acronym: "NDIA-Managed",
    definition: "When the NDIA manages a participant's funds and pays registered providers directly on the participant's behalf. Least flexible option; only registered providers can be used.",
  },
  {
    term: "Reasonable and Necessary",
    acronym: "R&N",
    definition: "The test the NDIA applies to determine if a support can be funded. Supports must be related to the participant's disability, represent value for money, and be effective and beneficial.",
  },
  {
    term: "Goals",
    acronym: undefined,
    definition: "Personal goals are central to every NDIS plan. They describe what a participant wants to achieve in life, and all funded supports must link back to helping achieve these goals.",
  },
  {
    term: "Service Agreement",
    acronym: "SA",
    definition: "A written agreement between a participant and a provider setting out what services will be delivered, at what price, for how long, and the terms of cancellation.",
  },
  {
    term: "Functional Capacity Assessment",
    acronym: "FCA",
    definition: "An assessment by an allied health professional measuring a participant's ability to perform daily tasks, used to determine NDIS eligibility and appropriate funding levels.",
  },
  {
    term: "Behaviour Support Plan",
    acronym: "BSP",
    definition: "A documented plan developed by a specialist behaviour support practitioner to address behaviours of concern in a way that supports a participant's dignity and wellbeing.",
  },
  {
    term: "Restrictive Practices",
    acronym: "RP",
    definition: "Any practice that restricts a participant's rights or freedom of movement. Use of regulated restrictive practices must be authorised by the relevant state/territory body and reported to the Commission.",
  },
  {
    term: "Continuity of Supports",
    acronym: "CoS",
    definition: "Transitional support for people ageing out of the NDIS (turning 65) who choose to remain on the NDIS rather than move to aged care services.",
  },
  {
    term: "Early Childhood Early Intervention",
    acronym: "ECEI",
    definition: "The NDIS approach for children under 9 with developmental delay or disability, focusing on family-centred supports delivered through Early Childhood partners.",
  },
  {
    term: "Independent Living Options",
    acronym: "ILO",
    definition: "A flexible, participant-led model for arranging living supports, allowing participants to design their own support arrangements (e.g. with family, flatmates, or support workers).",
  },
];
