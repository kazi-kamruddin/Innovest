const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const { parseAmountRange } = require('../utils/amounts');
const { textFieldsError } = require('../utils/inputValidation');
const { rollbackQuietly } = require('../utils/transactions');

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Real Estate',
  'Education',
  'Food & Beverage',
  'Other',
];
const STAGES = ['Idea', 'Prototype', 'Early Revenue', 'Scaling', 'Profitable'];
const ROLES = ['Silent Investor', 'Active Partner', 'Advisor', 'Board Member'];
const COUNTRIES = [
  'Afghanistan',
  'Bangladesh',
  'Bhutan',
  'India',
  'Maldives',
  'Nepal',
  'Pakistan',
  'Sri Lanka',
];
const RESPONSE_STATUSES = ['submitted', 'under_review', 'interested', 'declined'];

const DEMO_USERS = [
  {
    email: 'kazi.kamruddin@demo.innovest.local',
    name: 'Kazi Kamruddin Ahmed',
    userInfo: {
      location: 'Dhaka, Bangladesh',
      areas_of_interest: 'FinTech, Embedded Payments, B2B SaaS',
      about: 'Product engineer and early-stage fintech angel backing MSME credit rails and compliant payment workflows across South Asia.',
    },
    investorInfo: {
      fields_of_interest: 'Merchant Payments, Invoice Financing, Developer Infrastructure',
      investment_range_min: 15000,
      investment_range_max: 120000,
      preferred_industries: 'Finance, Technology',
    },
  },
  {
    email: 'hasibur.srijon@demo.innovest.local',
    name: 'Hasibur Rahman Srijon',
    userInfo: {
      location: 'Dhaka, Bangladesh',
      areas_of_interest: 'AgriTech, Cold-Chain Logistics, Sustainable Packaging',
      about: 'Founder focused on post-harvest cold storage and climate-resilient industrial supply chains across Delta markets.',
    },
    investorInfo: {
      fields_of_interest: 'Climate Telemetry, Food Supply Chains, IoT Monitoring',
      investment_range_min: 5000,
      investment_range_max: 50000,
      preferred_industries: 'Technology, Food & Beverage, Other',
    },
  },
  {
    email: 'sumit.majumder@demo.innovest.local',
    name: 'Sumit Majumder',
    userInfo: {
      location: 'Chattogram, Bangladesh',
      areas_of_interest: 'Commercial Real Estate, Port Logistics, Smart Warehousing',
      about: 'Operations lead building fractional commercial spaces and maritime river-route telemetry across port corridors.',
    },
    investorInfo: {
      fields_of_interest: 'Logistics Parks, Fractional Properties, Smart Metering',
      investment_range_min: 25000,
      investment_range_max: 250000,
      preferred_industries: 'Real Estate, Technology',
    },
  },
  {
    email: 'rakibul.islam@demo.innovest.local',
    name: 'Rakibul Islam',
    userInfo: {
      location: 'Sylhet, Bangladesh',
      areas_of_interest: 'Telemedicine, Rural Diagnostics, Health Records',
      about: 'Healthcare operator expanding nurse-assisted diagnostic clinics and bilingual triage software for tier-2 cities.',
    },
    investorInfo: {
      fields_of_interest: 'Primary Care Clinics, Portable Diagnostics, EdTech',
      investment_range_min: 10000,
      investment_range_max: 85000,
      preferred_industries: 'Healthcare, Education',
    },
  },
  {
    email: 'abdullah.ishtiaq@demo.innovest.local',
    name: 'Abdullah Ishtiaq',
    userInfo: {
      location: 'Dhaka, Bangladesh',
      areas_of_interest: 'Specialty Beverages, Vocational EdTech, D2C Supply Chains',
      about: 'Builder launching high-margin specialty food brands and applied STEM learning labs for regional graduates.',
    },
    investorInfo: {
      fields_of_interest: 'Functional Beverages, Specialty Exports, Applied Training',
      investment_range_min: 5000,
      investment_range_max: 40000,
      preferred_industries: 'Food & Beverage, Education',
    },
  },
  {
    email: 'sadik.rahman@demo.innovest.local',
    name: 'Sadik Rahman',
    userInfo: {
      location: 'Rajshahi, Bangladesh',
      areas_of_interest: 'Clean Water, Maternal Health, Technical Academies',
      about: 'Impact-oriented entrepreneur backing renewable microgrids, diagnostic kits, and technical workforce academies.',
    },
    investorInfo: {
      fields_of_interest: 'Solar Microgrids, Maternal Care, Technical Skills',
      investment_range_min: 20000,
      investment_range_max: 150000,
      preferred_industries: 'Healthcare, Education, Technology',
    },
  },
];

const DEMO_REQUESTS = [
  {
    investorEmail: 'kazi.kamruddin@demo.innovest.local',
    title: 'B2B Embedded Payments & Accounting Infrastructure',
    description: 'Seeking early-revenue fintech teams streamlining GST/VAT invoicing, automated supplier payouts, and working-capital underwriting for SME distributors.',
    category: 'Finance',
    minInvestment: 20000,
    maxInvestment: 120000,
    status: 'open',
  },
  {
    investorEmail: 'rakibul.islam@demo.innovest.local',
    title: 'Rural Diagnostic Clinics & Digital Triage Platforms',
    description: 'Looking for clinical hardware or hybrid clinic networks delivering affordable pathology, maternal screening, and doctor tele-consultations outside metro hubs.',
    category: 'Healthcare',
    minInvestment: 15000,
    maxInvestment: 80000,
    status: 'open',
  },
  {
    investorEmail: 'sumit.majumder@demo.innovest.local',
    title: 'Green Warehousing & Cold-Chain Facility Developers',
    description: 'Backing modular warehouse operators deploying rooftop solar, automated bay scheduling, and temperature-monitored storage near highway corridors.',
    category: 'Real Estate',
    minInvestment: 50000,
    maxInvestment: 250000,
    status: 'open',
  },
  {
    investorEmail: 'hasibur.srijon@demo.innovest.local',
    title: 'AI-Assisted Climate & Agri-Yield Telemetry',
    description: 'Interested in practical IoT sensor networks, satellite moisture forecasting, or solar cooling software proving measurable crop-loss reduction.',
    category: 'Technology',
    minInvestment: 10000,
    maxInvestment: 50000,
    status: 'open',
  },
  {
    investorEmail: 'abdullah.ishtiaq@demo.innovest.local',
    title: 'Export-Ready Functional Beverage & Snack Makers',
    description: 'Partnering with specialty tea, botanical beverage, and clean-label snack processors holding repeatable shelf traction and export packaging readiness.',
    category: 'Food & Beverage',
    minInvestment: 8000,
    maxInvestment: 40000,
    status: 'open',
  },
  {
    investorEmail: 'sadik.rahman@demo.innovest.local',
    title: 'Vocational Coding & Hardware Training Academies',
    description: 'Investing in outcome-driven engineering bootcamps, Bangla/regional STEM curriculum studios, and employer placement marketplaces.',
    category: 'Education',
    minInvestment: 15000,
    maxInvestment: 100000,
    status: 'open',
  },
  {
    investorEmail: 'kazi.kamruddin@demo.innovest.local',
    title: '2025 Circular Packaging & Fleet Retrofit Cohort',
    description: 'Completed cohort focused on biodegradable courier mailers and electric three-wheeler battery swapping pilots.',
    category: 'Other',
    minInvestment: 10000,
    maxInvestment: 60000,
    status: 'closed',
  },
];

const DEMO_PITCHES = [
  {
    founderEmail: 'hasibur.srijon@demo.innovest.local',
    title: 'PalliGrid Smart Cold Storage',
    industry: 'Technology',
    company_location: 'Dhaka, Mirpur',
    country: 'Bangladesh',
    cell_number: '+8801700000101',
    stage: 'Scaling',
    ideal_investor_role: 'Active Partner',
    total_raising_amount: 180000,
    minimum_investment: 15000,
    the_business: 'Solar-hybrid modular cold storage pods leased pay-per-crate to smallholder potato and vegetable cooperatives.',
    the_market: 'Post-harvest spoilage exceeds 25% across regional collection hubs lacking reliable grid cold rooms.',
    progress: '14 operational pods across Bogura and Rangpur serving 620 farmers with 91% seasonal utilization.',
    objective: 'Deploy 20 additional smart telemetry pods and integrate dynamic wholesale buyer booking.',
  },
  {
    founderEmail: 'rakibul.islam@demo.innovest.local',
    title: 'ShasthyaLink Telemedicine Clinics',
    industry: 'Healthcare',
    company_location: 'Sylhet, Zindabazar',
    country: 'Bangladesh',
    cell_number: '+8801700000102',
    stage: 'Early Revenue',
    ideal_investor_role: 'Advisor',
    total_raising_amount: 120000,
    minimum_investment: 10000,
    the_business: 'Paramedic-staffed neighborhood diagnostic kiosks connected in real time to Dhaka specialist physicians.',
    the_market: 'Millions of district residents travel 4+ hours for routine specialist follow-ups and lab interpretations.',
    progress: '6 clinics processing 3,800 paid monthly consultations with repeat chronic-care memberships.',
    objective: 'Open 12 new kiosks along northern highway corridors and automate digital lab referrals.',
  },
  {
    founderEmail: 'kazi.kamruddin@demo.innovest.local',
    title: 'TakaFlow MSME Invoice Credit',
    industry: 'Finance',
    company_location: 'Dhaka, Motijheel',
    country: 'Bangladesh',
    cell_number: '+8801700000103',
    stage: 'Profitable',
    ideal_investor_role: 'Board Member',
    total_raising_amount: 350000,
    minimum_investment: 25000,
    the_business: 'Automated B2B receivables reconciliation and instant supplier settlement workflows for FMCG distributors.',
    the_market: 'Tier-2 wholesale suppliers wait 45-75 days for invoice clearing without standardized digital audit trails.',
    progress: '$4.2M annualized payment volume reconciled with positive unit contribution margin across 190 wholesalers.',
    objective: 'Scale bank-partner credit integrations and launch automated VAT compliance exports.',
  },
  {
    founderEmail: 'sumit.majumder@demo.innovest.local',
    title: 'BhumiLedger Commercial Micro-Suites',
    industry: 'Real Estate',
    company_location: 'Chattogram, Agrabad',
    country: 'Bangladesh',
    cell_number: '+8801700000104',
    stage: 'Scaling',
    ideal_investor_role: 'Silent Investor',
    total_raising_amount: 420000,
    minimum_investment: 30000,
    the_business: 'Retrofit operator converting underutilized commercial floors near port districts into turnkey flex offices and micro-fulfillment bays.',
    the_market: 'Export agencies and tech teams struggle to find flexible, metered commercial space without 3-year lock-ins.',
    progress: '38,000 sq ft under management at 94% occupancy across two Chattogram buildings.',
    objective: 'Acquire long-term master leases on two additional hubs and launch tenant energy analytics.',
  },
  {
    founderEmail: 'abdullah.ishtiaq@demo.innovest.local',
    title: 'SkillBridge South Asia STEM Labs',
    industry: 'Education',
    company_location: 'Kathmandu, Lalitpur',
    country: 'Nepal',
    cell_number: '+9779800000105',
    stage: 'Early Revenue',
    ideal_investor_role: 'Advisor',
    total_raising_amount: 95000,
    minimum_investment: 5000,
    the_business: 'Interactive robotics, embedded systems, and cloud-engineering lab kits bundled with bilingual mentor cohorts for engineering colleges.',
    the_market: 'Regional university graduates often lack hands-on hardware debugging and deployment experience demanded by employers.',
    progress: 'Adopted by 22 partner campuses with 1,900 active lab seats and 78% graduate placement.',
    objective: 'Expand curriculum licensing into Bangladesh and Sri Lanka partner universities.',
  },
  {
    founderEmail: 'abdullah.ishtiaq@demo.innovest.local',
    title: 'ChaBagan Direct Botanical Roasters',
    industry: 'Food & Beverage',
    company_location: 'Colombo, Cinnamon Gardens',
    country: 'Sri Lanka',
    cell_number: '+947700000106',
    stage: 'Profitable',
    ideal_investor_role: 'Active Partner',
    total_raising_amount: 140000,
    minimum_investment: 10000,
    the_business: 'Single-estate cold-brew tea concentrates and spiced botanical RTDs sourced directly from high-grown South Asian estates.',
    the_market: 'Hospitality chains and specialty grocers demand traceable low-sugar botanical beverages with longer cold-chain shelf stability.',
    progress: 'Stocked across 85 cafes and boutique grocers with recurring B2B wholesale contracts.',
    objective: 'Commission an automated canning line to fulfill GCC and Singapore export orders.',
  },
  {
    founderEmail: 'hasibur.srijon@demo.innovest.local',
    title: 'JuteCraft Modular Eco-Packaging',
    industry: 'Other',
    company_location: 'Bengaluru, Indiranagar',
    country: 'India',
    cell_number: '+919800000107',
    stage: 'Prototype',
    ideal_investor_role: 'Active Partner',
    total_raising_amount: 85000,
    minimum_investment: 5000,
    the_business: 'Moisture-resistant molded jute-pulp inserts replacing expanded polystyrene foam for appliance and e-commerce shipping.',
    the_market: 'D2C electronics and export manufacturers face rising plastic-packaging fees across domestic and EU shipments.',
    progress: 'Passed ISTA-3A drop-testing with 3 electronics assembly pilots underway.',
    objective: 'Complete high-volume thermal press tooling and sign initial commercial supply contracts.',
  },
  {
    founderEmail: 'sumit.majumder@demo.innovest.local',
    title: 'NadiGuard River Freight Telemetry',
    industry: 'Technology',
    company_location: 'Karachi, Clifton',
    country: 'Pakistan',
    cell_number: '+923000000108',
    stage: 'Idea',
    ideal_investor_role: 'Advisor',
    total_raising_amount: 45000,
    minimum_investment: 3000,
    the_business: 'Low-cost hull draft, fuel-burn, and berth-queue telemetry boxes built for inland barge operators.',
    the_market: 'Coastal and river cargo fleets run mostly on manual paper logs, creating heavy fuel waste and port bottlenecks.',
    progress: 'Completed hardware BOM architecture and letters of intent from 4 fleet owners.',
    objective: 'Build 25 ruggedized field prototypes and run a 90-day coastal corridor trial.',
  },
  {
    founderEmail: 'sadik.rahman@demo.innovest.local',
    title: 'DrukCare Maternal Diagnostic Kits',
    industry: 'Healthcare',
    company_location: 'Thimphu, Changangkha',
    country: 'Bhutan',
    cell_number: '+97517000109',
    stage: 'Prototype',
    ideal_investor_role: 'Board Member',
    total_raising_amount: 70000,
    minimum_investment: 5000,
    the_business: 'Point-of-care smartphone-paired urinalysis and hemoglobin screening strips tailored for high-altitude rural health posts.',
    the_market: 'Mountain community health workers need battery-free screening tools calibrated for cold, remote clinics.',
    progress: 'Clinical validation batch completed with 96% concordance against benchtop analyzers.',
    objective: 'Secure regional medical device registration and manufacture 20,000 field kits.',
  },
  {
    founderEmail: 'sadik.rahman@demo.innovest.local',
    title: 'AtollSolar Desalination Microgrids',
    industry: 'Technology',
    company_location: 'Male, Henveiru',
    country: 'Maldives',
    cell_number: '+9607700110',
    stage: 'Early Revenue',
    ideal_investor_role: 'Silent Investor',
    total_raising_amount: 260000,
    minimum_investment: 20000,
    the_business: 'Containerized solar-powered reverse-osmosis freshwater plants leased per liter to island resorts and municipalities.',
    the_market: 'Diesel desalination imposes high fuel volatility and noise across outer island hospitality properties.',
    progress: '2 containerized units producing 45,000 liters daily under 5-year municipal off-take agreements.',
    objective: 'Finance fabrication of 4 additional solar desalination skids for neighboring atolls.',
  },
];

const DEMO_RESPONSES = [
  {
    requestTitle: 'B2B Embedded Payments & Accounting Infrastructure',
    founderEmail: 'hasibur.srijon@demo.innovest.local',
    responseStatus: 'interested',
    pitch: {
      title: 'Khatabook-to-Ledger Wholesale Sync API',
      industry: 'Finance',
      company_location: 'Dhaka, Banani',
      country: 'Bangladesh',
      cell_number: '+8801700000201',
      stage: 'Early Revenue',
      ideal_investor_role: 'Board Member',
      total_raising_amount: 110000,
      minimum_investment: 20000,
      the_business: 'Webhook bridge turning SME distributor mobile-wallet receipts into reconciled VAT-ready ledger entries.',
      the_market: 'Directly complements B2B invoice-credit platforms by eliminating manual statement uploads.',
      progress: '42 wholesale distributors live with 18,000 monthly reconciled supplier settlements.',
      objective: 'Integrate our API directly with partner underwriting stacks over a 6-month pilot.',
    },
  },
  {
    requestTitle: 'Rural Diagnostic Clinics & Digital Triage Platforms',
    founderEmail: 'sadik.rahman@demo.innovest.local',
    responseStatus: 'under_review',
    pitch: {
      title: 'GramPath Portable CBC Readers',
      industry: 'Healthcare',
      company_location: 'Rajshahi, Shaheb Bazar',
      country: 'Bangladesh',
      cell_number: '+8801700000202',
      stage: 'Prototype',
      ideal_investor_role: 'Advisor',
      total_raising_amount: 65000,
      minimum_investment: 15000,
      the_business: 'Compact optical blood-count analyzer built for clinic kiosks without benchtop centrifuge maintenance.',
      the_market: 'Reduces clinic capex by 60% when expanding into new upazila health centers.',
      progress: 'Bench accuracy verified across 400 patient samples at two regional hospitals.',
      objective: 'Run a joint multi-clinic field rollout across Sylhet and Rajshahi.',
    },
  },
  {
    requestTitle: 'AI-Assisted Climate & Agri-Yield Telemetry',
    founderEmail: 'sumit.majumder@demo.innovest.local',
    responseStatus: 'submitted',
    pitch: {
      title: 'BorshaSense Soil & Cold-Bay Edge Nodes',
      industry: 'Technology',
      company_location: 'Chattogram, Halishahar',
      country: 'Bangladesh',
      cell_number: '+8801700000203',
      stage: 'Early Revenue',
      ideal_investor_role: 'Active Partner',
      total_raising_amount: 50000,
      minimum_investment: 10000,
      the_business: 'Solar LoRaWAN humidity and compressor-health sensors alerting storage managers before temperature drift occurs.',
      the_market: 'Directly lowers energy waste and spoilage insurance claims across rural cold hubs.',
      progress: '180 nodes deployed across commercial produce storage facilities.',
      objective: 'Bundle sensors directly across new cold-storage sites.',
    },
  },
];

const DEMO_CONVERSATIONS = [
  {
    participantEmails: ['kazi.kamruddin@demo.innovest.local', 'hasibur.srijon@demo.innovest.local'],
    messages: [
      {
        senderEmail: 'kazi.kamruddin@demo.innovest.local',
        body: 'Hi Hasibur — I reviewed your Khatabook-to-Ledger API pitch response. Our team liked the automated VAT export metrics.',
      },
      {
        senderEmail: 'hasibur.srijon@demo.innovest.local',
        body: 'Thank you Kazi! Happy to walk through the sandbox API docs and live merchant settlement logs this week.',
      },
    ],
  },
  {
    participantEmails: ['rakibul.islam@demo.innovest.local', 'sadik.rahman@demo.innovest.local'],
    messages: [
      {
        senderEmail: 'rakibul.islam@demo.innovest.local',
        body: 'Hello Sadik, we moved your GramPath Portable CBC reader response to under review — could you share cartridge unit pricing?',
      },
      {
        senderEmail: 'sadik.rahman@demo.innovest.local',
        body: 'Great to hear, Rakibul. At 5,000 monthly tests our per-cartridge landed cost drops under $1.40.',
      },
    ],
  },
];

function parseKeepEmails(raw = process.env.SEED_KEEP_EMAILS || '') {
  return [...new Set(
    String(raw)
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  )];
}

function validateSeedDataset() {
  const userEmails = new Set();
  for (const user of DEMO_USERS) {
    if (!user.email || !user.name) throw new Error('Seed user missing email or name');
    const normalized = user.email.toLowerCase();
    if (userEmails.has(normalized)) throw new Error(`Duplicate demo user email: ${normalized}`);
    userEmails.add(normalized);

    const uiErr = textFieldsError(user.userInfo, { location: 255, areas_of_interest: 'text', about: 'text' });
    if (uiErr) throw new Error(`Invalid userInfo for ${normalized}: ${uiErr}`);

    const iiErr = textFieldsError(user.investorInfo, { fields_of_interest: 'text', preferred_industries: 'text' });
    if (iiErr) throw new Error(`Invalid investorInfo for ${normalized}: ${iiErr}`);
    if (!parseAmountRange(user.investorInfo.investment_range_min, user.investorInfo.investment_range_max)) {
      throw new Error(`Invalid investor range for ${normalized}`);
    }
  }

  const requestByTitle = new Map();
  for (const req of DEMO_REQUESTS) {
    if (!userEmails.has(req.investorEmail)) throw new Error(`Unknown request owner: ${req.investorEmail}`);
    if (!INDUSTRIES.includes(req.category)) throw new Error(`Invalid request category: ${req.category}`);
    if (!['open', 'closed'].includes(req.status)) throw new Error(`Invalid request status: ${req.status}`);
    const reqErr = textFieldsError(req, { title: 255, description: 'text', category: 255 }, ['title', 'description', 'category']);
    if (reqErr) throw new Error(`Invalid request "${req.title}": ${reqErr}`);
    if (!parseAmountRange(req.minInvestment, req.maxInvestment)) {
      throw new Error(`Invalid request range for "${req.title}"`);
    }
    requestByTitle.set(req.title, req);
  }

  const validatePitchEntry = (pitch, label) => {
    if (!INDUSTRIES.includes(pitch.industry)) throw new Error(`Invalid industry in ${label}: ${pitch.industry}`);
    if (!STAGES.includes(pitch.stage)) throw new Error(`Invalid stage in ${label}: ${pitch.stage}`);
    if (!ROLES.includes(pitch.ideal_investor_role)) throw new Error(`Invalid investor role in ${label}: ${pitch.ideal_investor_role}`);
    if (!COUNTRIES.includes(pitch.country)) throw new Error(`Invalid country in ${label}: ${pitch.country}`);
    const err = textFieldsError(pitch, {
      title: 255, industry: 255, company_location: 255, country: 255, cell_number: 255,
      stage: 255, ideal_investor_role: 255, the_business: 'text', the_market: 'text',
      progress: 'text', objective: 'text',
    }, ['title', 'industry']);
    if (err) throw new Error(`Invalid pitch (${label}): ${err}`);
    if (!parseAmountRange(pitch.minimum_investment, pitch.total_raising_amount)) {
      throw new Error(`Invalid funding range in pitch (${label})`);
    }
  };

  for (const pitch of DEMO_PITCHES) {
    if (!userEmails.has(pitch.founderEmail)) throw new Error(`Unknown pitch founder: ${pitch.founderEmail}`);
    validatePitchEntry(pitch, pitch.title);
  }

  for (const response of DEMO_RESPONSES) {
    const targetReq = requestByTitle.get(response.requestTitle);
    if (!targetReq) throw new Error(`Response references missing request "${response.requestTitle}"`);
    if (targetReq.status !== 'open') throw new Error(`Response targets closed request "${response.requestTitle}"`);
    if (!userEmails.has(response.founderEmail)) throw new Error(`Unknown response founder: ${response.founderEmail}`);
    if (targetReq.investorEmail === response.founderEmail) {
      throw new Error(`Response pitch "${response.pitch.title}" cannot belong to request owner`);
    }
    if (!RESPONSE_STATUSES.includes(response.responseStatus)) {
      throw new Error(`Invalid response status: ${response.responseStatus}`);
    }
    validatePitchEntry(response.pitch, response.pitch.title);
  }

  for (const convo of DEMO_CONVERSATIONS) {
    const [a, b] = convo.participantEmails;
    if (!userEmails.has(a) || !userEmails.has(b) || a === b) {
      throw new Error(`Invalid conversation participants: ${a}, ${b}`);
    }
    for (const msg of convo.messages) {
      if (![a, b].includes(msg.senderEmail) || !msg.body?.trim()) {
        throw new Error(`Invalid message in conversation ${a} <-> ${b}`);
      }
    }
  }

  const coveredIndustries = new Set(DEMO_PITCHES.map((p) => p.industry));
  const coveredStages = new Set(DEMO_PITCHES.map((p) => p.stage));
  for (const ind of INDUSTRIES) {
    if (!coveredIndustries.has(ind)) throw new Error(`Missing showcase pitch coverage for industry: ${ind}`);
  }
  for (const st of STAGES) {
    if (!coveredStages.has(st)) throw new Error(`Missing showcase pitch coverage for stage: ${st}`);
  }

  return {
    users: DEMO_USERS.length,
    investorProfiles: DEMO_USERS.length,
    requestsOpen: DEMO_REQUESTS.filter((r) => r.status === 'open').length,
    requestsClosed: DEMO_REQUESTS.filter((r) => r.status === 'closed').length,
    publicPitches: DEMO_PITCHES.length,
    responsePitches: DEMO_RESPONSES.length,
    conversations: DEMO_CONVERSATIONS.length,
    messages: DEMO_CONVERSATIONS.reduce((sum, c) => sum + c.messages.length, 0),
  };
}

function buildPruneQuery(preserveEmails) {
  const normalized = [...new Set(preserveEmails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  if (!normalized.length) {
    throw new Error('Preserved email allowlist cannot be empty when pruning test data');
  }
  const placeholders = normalized.map(() => '?').join(', ');
  return {
    sql: `DELETE FROM users WHERE LOWER(email) NOT IN (${placeholders})`,
    params: normalized,
  };
}

async function seedDemo({
  db,
  apply = false,
  pruneTestData = false,
  keepEmails = parseKeepEmails(),
  demoPassword = process.env.SEED_DEMO_PASSWORD || null,
} = {}) {
  const counts = validateSeedDataset();
  const demoEmailList = DEMO_USERS.map((u) => u.email.toLowerCase());
  const preservedEmails = [...new Set([...demoEmailList, ...keepEmails])];

  if (!apply) {
    return {
      dryRun: true,
      apply: false,
      pruneTestData,
      preservedEmails,
      counts,
    };
  }

  const rawPassword = demoPassword || crypto.randomBytes(18).toString('base64url');
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  let connection;
  let prunedUsers = 0;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    if (pruneTestData) {
      const prune = buildPruneQuery(preservedEmails);
      const [pruneRes] = await connection.execute(prune.sql, prune.params);
      prunedUsers = pruneRes?.affectedRows ?? 0;
    }

    const userIdsByEmail = new Map();
    for (const user of DEMO_USERS) {
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [user.email]
      );
      let userId;
      if (existingUsers.length > 0) {
        userId = existingUsers[0].id;
        if (demoPassword) {
          await connection.execute('UPDATE users SET name = ?, password = ? WHERE id = ?', [user.name, passwordHash, userId]);
        } else {
          await connection.execute('UPDATE users SET name = ? WHERE id = ?', [user.name, userId]);
        }
      } else {
        const [insUser] = await connection.execute(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [user.name, user.email, passwordHash]
        );
        userId = insUser.insertId;
      }
      userIdsByEmail.set(user.email, userId);

      await connection.execute(
        `INSERT INTO auth_account_state (user_id, email_verified_at, token_version)
         VALUES (?, UTC_TIMESTAMP(6), 0)
         ON DUPLICATE KEY UPDATE email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP(6))`,
        [userId]
      );

      await connection.execute(
        `INSERT INTO user_info (user_id, location, areas_of_interest, about)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           location = VALUES(location),
           areas_of_interest = VALUES(areas_of_interest),
           about = VALUES(about)`,
        [userId, user.userInfo.location, user.userInfo.areas_of_interest, user.userInfo.about]
      );

      await connection.execute(
        `INSERT INTO investor_info (user_id, fields_of_interest, investment_range_min, investment_range_max, preferred_industries)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           fields_of_interest = VALUES(fields_of_interest),
           investment_range_min = VALUES(investment_range_min),
           investment_range_max = VALUES(investment_range_max),
           preferred_industries = VALUES(preferred_industries)`,
        [
          userId,
          user.investorInfo.fields_of_interest,
          user.investorInfo.investment_range_min,
          user.investorInfo.investment_range_max,
          user.investorInfo.preferred_industries,
        ]
      );
    }

    const requestIdsByTitle = new Map();
    for (const req of DEMO_REQUESTS) {
      const investorId = userIdsByEmail.get(req.investorEmail);
      const [existingReqs] = await connection.execute(
        'SELECT id FROM investor_requests WHERE investorId = ? AND title = ? LIMIT 1',
        [investorId, req.title]
      );
      let requestId;
      if (existingReqs.length > 0) {
        requestId = existingReqs[0].id;
        await connection.execute(
          `UPDATE investor_requests
           SET description = ?, category = ?, minInvestment = ?, maxInvestment = ?, status = ?
           WHERE id = ?`,
          [req.description, req.category, req.minInvestment, req.maxInvestment, req.status, requestId]
        );
      } else {
        const [insReq] = await connection.execute(
          `INSERT INTO investor_requests (investorId, title, description, category, minInvestment, maxInvestment, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [investorId, req.title, req.description, req.category, req.minInvestment, req.maxInvestment, req.status]
        );
        requestId = insReq.insertId;
      }
      requestIdsByTitle.set(req.title, requestId);
    }

    for (const pitch of DEMO_PITCHES) {
      const founderId = userIdsByEmail.get(pitch.founderEmail);
      const [existingPitch] = await connection.execute(
        'SELECT id FROM pitches WHERE user_id = ? AND title = ? AND forRequestId IS NULL LIMIT 1',
        [founderId, pitch.title]
      );
      if (existingPitch.length > 0) {
        await connection.execute(
          `UPDATE pitches
           SET industry = ?, company_location = ?, country = ?, cell_number = ?, stage = ?,
               ideal_investor_role = ?, total_raising_amount = ?, minimum_investment = ?,
               the_business = ?, the_market = ?, progress = ?, objective = ?
           WHERE id = ?`,
          [
            pitch.industry, pitch.company_location, pitch.country, pitch.cell_number, pitch.stage,
            pitch.ideal_investor_role, pitch.total_raising_amount, pitch.minimum_investment,
            pitch.the_business, pitch.the_market, pitch.progress, pitch.objective,
            existingPitch[0].id,
          ]
        );
      } else {
        await connection.execute(
          `INSERT INTO pitches
            (user_id, title, company_location, country, cell_number, industry, stage, ideal_investor_role,
             total_raising_amount, minimum_investment, the_business, the_market, progress, objective, forRequestId)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
          [
            founderId, pitch.title, pitch.company_location, pitch.country, pitch.cell_number,
            pitch.industry, pitch.stage, pitch.ideal_investor_role,
            pitch.total_raising_amount, pitch.minimum_investment,
            pitch.the_business, pitch.the_market, pitch.progress, pitch.objective,
          ]
        );
      }
    }

    const ensureNotification = async ({ userId, actorId, kind, text, targetPath }) => {
      const [existingNotif] = await connection.execute(
        'SELECT id FROM user_notifications WHERE user_id = ? AND kind = ? AND target_path = ? LIMIT 1',
        [userId, kind, targetPath]
      );
      if (existingNotif.length === 0) {
        await connection.execute(
          'INSERT INTO user_notifications (user_id, actor_id, kind, text, target_path) VALUES (?, ?, ?, ?, ?)',
          [userId, actorId, kind, text, targetPath]
        );
      }
    };

    for (const resp of DEMO_RESPONSES) {
      const founderId = userIdsByEmail.get(resp.founderEmail);
      const targetReq = DEMO_REQUESTS.find((r) => r.title === resp.requestTitle);
      const investorId = userIdsByEmail.get(targetReq.investorEmail);
      const requestId = requestIdsByTitle.get(resp.requestTitle);
      const p = resp.pitch;

      const [existingResp] = await connection.execute(
        'SELECT id FROM pitches WHERE user_id = ? AND title = ? AND forRequestId = ? LIMIT 1',
        [founderId, p.title, requestId]
      );
      let pitchId;
      if (existingResp.length > 0) {
        pitchId = existingResp[0].id;
      } else {
        const [insResp] = await connection.execute(
          `INSERT INTO pitches
            (user_id, title, company_location, country, cell_number, industry, stage, ideal_investor_role,
             total_raising_amount, minimum_investment, the_business, the_market, progress, objective, forRequestId)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            founderId, p.title, p.company_location, p.country, p.cell_number,
            p.industry, p.stage, p.ideal_investor_role, p.total_raising_amount, p.minimum_investment,
            p.the_business, p.the_market, p.progress, p.objective, requestId,
          ]
        );
        pitchId = insResp.insertId;
      }

      await connection.execute(
        `INSERT INTO pitch_response_states (pitch_id, status) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [pitchId, resp.responseStatus]
      );

      await ensureNotification({
        userId: investorId,
        actorId: founderId,
        kind: 'pitch_response',
        text: `New pitch response submitted for "${resp.requestTitle}".`,
        targetPath: `/investor-request/${requestId}/response-pitches`,
      });

      if (resp.responseStatus !== 'submitted') {
        const statusLabel = resp.responseStatus === 'under_review' ? 'under review' : resp.responseStatus;
        await ensureNotification({
          userId: founderId,
          actorId: investorId,
          kind: 'response_status',
          text: `Your pitch response is now ${statusLabel}.`,
          targetPath: '/fundraise-dashboard',
        });
      }
    }

    for (const convo of DEMO_CONVERSATIONS) {
      const idA = userIdsByEmail.get(convo.participantEmails[0]);
      const idB = userIdsByEmail.get(convo.participantEmails[1]);
      const userOne = Math.min(idA, idB);
      const userTwo = Math.max(idA, idB);

      const [existingConvo] = await connection.execute(
        `SELECT id FROM conversations
         WHERE (user_one_id = ? AND user_two_id = ?) OR (user_one_id = ? AND user_two_id = ?)
         LIMIT 1`,
        [userOne, userTwo, userTwo, userOne]
      );
      let conversationId;
      if (existingConvo.length > 0) {
        conversationId = existingConvo[0].id;
      } else {
        const [insConvo] = await connection.execute(
          'INSERT INTO conversations (user_one_id, user_two_id, created_at) VALUES (?, ?, NOW())',
          [userOne, userTwo]
        );
        conversationId = insConvo.insertId;
      }

      const [[msgCount]] = await connection.execute(
        'SELECT COUNT(*) AS count FROM messages WHERE conversation_id = ?',
        [conversationId]
      );
      if (Number(msgCount?.count || 0) === 0) {
        for (const msg of convo.messages) {
          await connection.execute(
            'INSERT INTO messages (conversation_id, sender_id, body, created_at) VALUES (?, ?, ?, NOW())',
            [conversationId, userIdsByEmail.get(msg.senderEmail), msg.body]
          );
        }
      }

      const lastMsg = convo.messages[convo.messages.length - 1];
      const senderId = userIdsByEmail.get(lastMsg.senderEmail);
      const recipientEmail = convo.participantEmails.find((e) => e !== lastMsg.senderEmail);
      await ensureNotification({
        userId: userIdsByEmail.get(recipientEmail),
        actorId: senderId,
        kind: 'message',
        text: 'You have a new message.',
        targetPath: `/messages?conversation=${encodeURIComponent(conversationId)}`,
      });
    }

    await connection.commit();
    return {
      dryRun: false,
      apply: true,
      pruneTestData,
      preservedEmails,
      prunedUsers,
      counts,
    };
  } catch (error) {
    await rollbackQuietly(connection);
    throw error;
  } finally {
    connection?.release();
  }
}

async function runCli() {
  const args = new Set(process.argv.slice(2));
  const apply = args.has('--apply');
  const pruneTestData = args.has('--prune-test-data');
  const keepEmails = parseKeepEmails();

  if (!apply) {
    const preview = await seedDemo({ apply: false, pruneTestData, keepEmails });
    console.log('[dry-run] Validated showcase seed payload cleanly:');
    console.log(JSON.stringify(preview.counts, null, 2));
    if (pruneTestData) {
      console.log(`[dry-run] --prune-test-data would keep ${preview.preservedEmails.length} email(s): ${preview.preservedEmails.join(', ')}`);
    }
    console.log('[dry-run] Re-run with --apply (and optional --prune-test-data) to write to DB_NAME.');
    return;
  }

  const db = require('../config/database');
  try {
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      throw new Error('DB_HOST, DB_USER, and DB_NAME must be configured in backEnd/.env');
    }
    const result = await seedDemo({ db, apply: true, pruneTestData, keepEmails });
    console.log(`Seed complete on ${process.env.DB_NAME} (${process.env.DB_HOST}):`, JSON.stringify(result.counts));
    if (pruneTestData) {
      console.log(`Pruned ${result.prunedUsers} non-allowlisted user account(s) (and cascading test rows).`);
    }
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  runCli().catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  INDUSTRIES,
  STAGES,
  ROLES,
  COUNTRIES,
  RESPONSE_STATUSES,
  DEMO_USERS,
  DEMO_REQUESTS,
  DEMO_PITCHES,
  DEMO_RESPONSES,
  DEMO_CONVERSATIONS,
  parseKeepEmails,
  validateSeedDataset,
  buildPruneQuery,
  seedDemo,
};
