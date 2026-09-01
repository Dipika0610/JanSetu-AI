/**
 * JanSetu / CivicResolve AI - Data Model & Seed Datasets
 * Based on SIH26-S02 Problem Statement Specification
 */

export const WARDS = [
  { id: 'andheri-w', name: 'Andheri West', zone: 'Zone 4 - Western Suburbs', officer: 'S. Kulkarni', openCount: 48, coords: { x: 88, y: 55, lat: 19.1363, lng: 72.8276 } },
  { id: 'bandra-w', name: 'Bandra West', zone: 'Zone 3 - Western Suburbs', officer: 'A. Deshmukh', openCount: 36, coords: { x: 185, y: 60, lat: 19.0596, lng: 72.8295 } },
  { id: 'kurla', name: 'Kurla', zone: 'Zone 5 - Eastern Suburbs', officer: 'P. Sawant', openCount: 52, coords: { x: 235, y: 105, lat: 19.0726, lng: 72.8845 } },
  { id: 'dadar', name: 'Dadar', zone: 'Zone 2 - City Central', officer: 'R. Shinde', openCount: 29, coords: { x: 105, y: 120, lat: 19.0178, lng: 72.8478 } },
  { id: 'chembur', name: 'Chembur', zone: 'Zone 5 - Eastern Suburbs', officer: 'V. More', openCount: 33, coords: { x: 205, y: 160, lat: 19.0622, lng: 72.8994 } },
  { id: 'worli', name: 'Worli', zone: 'Zone 2 - South Mumbai', officer: 'M. Joshi', openCount: 20, coords: { x: 140, y: 45, lat: 19.0166, lng: 72.8166 } }
];

export const CATEGORIES = [
  { id: 'roads', name: 'Roads', subcategory: 'Pothole / Surface Damage', department: 'Public Works / Roads', escalationDept: 'Municipal Commissioner' },
  { id: 'streetlights', name: 'Streetlights', subcategory: 'Light Outage / Pole Defect', department: 'Electricity / Municipality', escalationDept: 'Ward Engineer' },
  { id: 'water', name: 'Water supply', subcategory: 'Shortage / Pipeline Burst', department: 'Water Department', escalationDept: 'Water Board' },
  { id: 'drainage', name: 'Drainage', subcategory: 'Overflowing Drain / Sewage', department: 'Sanitation / Drainage', escalationDept: 'Ward Officer' },
  { id: 'garbage', name: 'Garbage', subcategory: 'Waste Not Collected / Bin Overflow', department: 'Sanitation', escalationDept: 'Ward Officer' },
  { id: 'public-safety', name: 'Public safety', subcategory: 'Open Manhole / Structural Hazard', department: 'Emergency / Public Works', escalationDept: 'Emergency Response' },
  { id: 'electricity', name: 'Electricity', subcategory: 'Fallen Wire / Sparking Pole', department: 'Electricity Department', escalationDept: 'Emergency Control Room' },
  { id: 'traffic', name: 'Traffic', subcategory: 'Signal Malfunction', department: 'Traffic Police', escalationDept: 'Traffic Control Centre' },
  { id: 'parks', name: 'Parks', subcategory: 'Broken Equipment / Tree Fall', department: 'Parks Department', escalationDept: 'Horticulture Head' },
  { id: 'encroachment', name: 'Encroachment', subcategory: 'Footpath Blocked / Illegal Stalls', department: 'Municipal Enforcement', escalationDept: 'Zonal Deputy' }
];

export const OFFICERS = [
  { id: 'off-1', name: 'S. Kulkarni', designation: 'Ward Executive Officer', ward: 'Andheri West', email: 's.kulkarni@municipalcorp.gov.in' },
  { id: 'off-2', name: 'JE Nilesh Patil', designation: 'Junior Engineer (Sanitation/Drainage)', ward: 'Andheri West', email: 'nilesh.patil@municipalcorp.gov.in' },
  { id: 'off-3', name: 'AE Ramesh Jadhav', designation: 'Assistant Engineer (Water Works)', ward: 'Kurla', email: 'ramesh.jadhav@municipalcorp.gov.in' },
  { id: 'off-4', name: 'JE Priya Sharma', designation: 'Junior Engineer (Roads & Bridges)', ward: 'Bandra West', email: 'priya.sharma@municipalcorp.gov.in' },
  { id: 'off-5', name: 'Sub-Engg Amit Shinde', designation: 'Electrical Inspector', ward: 'Chembur', email: 'amit.shinde@municipalcorp.gov.in' }
];

export const INITIAL_COMPLAINTS = [
  {
    id: 'GRV-2026-000145',
    original_text: 'Gutter overflowing near the bus stop on Link Road, water has been standing for two days and smells very bad.',
    normalized_text: 'Sewage drain overflowing near bus stand, water stagnation 2 days, severe odor',
    language: 'English',
    category: 'Drainage',
    subcategory: 'Sewage overflow',
    department: 'Sanitation / Drainage',
    escalationDept: 'Ward Officer',
    priority: 'Critical',
    priorityScore: 94,
    confidence: 0.96,
    ward: 'Andheri West',
    wardId: 'andheri-w',
    location: 'Near Link Road Bus Stop, Andheri West',
    reportedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    timeAgo: '3 hrs ago',
    status: 'assigned', // submitted -> ai_processed -> assigned -> acknowledged -> investigation -> progress -> resolved -> confirmed -> closed
    assignedTo: 'JE Nilesh Patil',
    similarCount: 34,
    clusterId: 'CLUSTER-024',
    duplicate_status: 'Cluster Primary Root',
    similar_complaint_id: 'GRV-2026-000121',
    similarity_score: 0.92,
    distance_from_similar_complaint: '120 metres',
    explanation: [
      'The complaint involves high public health risk with standing sewage.',
      'Reported location is directly beside a high-density transit bus stop.',
      '34 similar complaints received in the same 500m radius in the last 72 hours.'
    ],
    recommended_action: [
      'Deploy suction tanker vehicle immediately.',
      'Clear main line blockage on Link Road.',
      'Disinfect standing pool area with bleaching powder.',
      'Broadcast automated SMS resolution notice to all 34 citizen tickets.'
    ],
    photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    upvotes: 34,
    authorName: 'Karan Malhotra'
  },
  {
    id: 'GRV-2026-000224',
    original_text: 'Open manhole chamber without cover near Worli Sea Face bus shelter, children walking to school can fall.',
    normalized_text: 'Open stormwater manhole without cover near school transit path, acute safety risk',
    language: 'English',
    category: 'Public safety',
    subcategory: 'Open manhole on road',
    department: 'Emergency / Public Works',
    escalationDept: 'Emergency Response',
    priority: 'Critical',
    priorityScore: 98,
    confidence: 0.98,
    ward: 'Worli',
    wardId: 'worli',
    location: 'Worli Sea Face, opp. Sunrise Apartments',
    reportedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    timeAgo: '5 hrs ago',
    status: 'investigation',
    assignedTo: 'M. Joshi',
    similarCount: 2,
    clusterId: null,
    duplicate_status: 'Unique safety hazard',
    similar_complaint_id: null,
    similarity_score: 0,
    distance_from_similar_complaint: null,
    explanation: [
      'Contains life-safety hazard trigger: open manhole.',
      'Located within 50m of school pedestrian walkway.',
      'Immediate hazard during night-time low visibility.'
    ],
    recommended_action: [
      'Install emergency barricade and warning blinker within 1 hour.',
      'Fabricate and replace reinforced ductile iron cover.',
      'Upload geofenced post-fix inspection photo.'
    ],
    photo: null,
    upvotes: 3,
    authorName: 'Aarav Mehta'
  },
  {
    id: 'GRV-2026-000190',
    original_text: 'Pipeline supply completely cut off for 4 consecutive days in Kurla West near hospital zone.',
    normalized_text: 'Drinking water pipeline disruption 4 days, 150+ households impacted in hospital vicinity',
    language: 'English',
    category: 'Water supply',
    subcategory: 'Pipeline disruption / No water',
    department: 'Water Department',
    escalationDept: 'Water Board',
    priority: 'High',
    priorityScore: 88,
    confidence: 0.95,
    ward: 'Kurla',
    wardId: 'kurla',
    location: 'Pipeline Road, Kurla West',
    reportedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    timeAgo: '6 hrs ago',
    status: 'assigned',
    assignedTo: 'AE Ramesh Jadhav',
    similarCount: 12,
    clusterId: 'CLUSTER-019',
    duplicate_status: 'Cluster Member',
    similar_complaint_id: 'GRV-2026-000185',
    similarity_score: 0.89,
    distance_from_similar_complaint: '90 metres',
    explanation: [
      'Extended duration of 4 days without municipal drinking water.',
      'Sensitive zone proximity: Kurla General Hospital.',
      '12 grouped households reporting same hydraulic grid fault.'
    ],
    recommended_action: [
      'Dispatch municipal water tankers as interim relief.',
      'Isolate valve chamber at Junction 4 to detect pressure drop.'
    ],
    photo: null,
    upvotes: 12,
    authorName: 'Deepa Sawant'
  },
  {
    id: 'GRV-2026-000166',
    original_text: 'Road pe bahut bada gaddha ho gaya hai SV road junction, do bikers gir chuke hain.',
    normalized_text: 'Large deep pothole on SV Road junction causing vehicle skid accidents',
    language: 'Hinglish',
    category: 'Roads',
    subcategory: 'Large pothole',
    department: 'Public Works / Roads',
    escalationDept: 'Municipal Commissioner',
    priority: 'High',
    priorityScore: 82,
    confidence: 0.94,
    ward: 'Bandra West',
    wardId: 'bandra-w',
    location: 'SV Road Junction, near Lucky Restaurant',
    reportedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    timeAgo: '1 day ago',
    status: 'progress',
    assignedTo: 'JE Priya Sharma',
    similarCount: 8,
    clusterId: 'CLUSTER-012',
    duplicate_status: 'Cluster Primary',
    similar_complaint_id: 'GRV-2026-000150',
    similarity_score: 0.86,
    distance_from_similar_complaint: '60 metres',
    explanation: [
      'Active accident risk on arterial junction.',
      'Multilingual Hinglish text normalized and verified.',
      '8 citizen endorsements received.'
    ],
    recommended_action: [
      'Deploy cold-mix asphalt quick-fill team.',
      'Smooth road transition and paint temporary white boundary.'
    ],
    photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    upvotes: 8,
    authorName: 'Faizan Ansari'
  },
  {
    id: 'GRV-2026-000151',
    original_text: 'रात्रीच्या वेळी शाळेच्या परिसरात सर्व पथदिवे बंद असतात. विद्यार्थ्यांसाठी सुरक्षित नाही.',
    normalized_text: 'Streetlights outage near municipal primary school, safety concern during dark hours',
    language: 'Marathi',
    category: 'Streetlights',
    subcategory: 'Streetlight outage',
    department: 'Electricity / Municipality',
    escalationDept: 'Ward Engineer',
    priority: 'Medium',
    priorityScore: 68,
    confidence: 0.93,
    ward: 'Chembur',
    wardId: 'chembur',
    location: 'Near BMC School No. 4, Chembur East',
    reportedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    timeAgo: '1 day ago',
    status: 'acknowledged',
    assignedTo: 'Sub-Engg Amit Shinde',
    similarCount: 3,
    clusterId: 'CLUSTER-008',
    duplicate_status: 'Cluster Member',
    similar_complaint_id: 'GRV-2026-000140',
    similarity_score: 0.81,
    distance_from_similar_complaint: '110 metres',
    explanation: [
      'School zone public safety impact.',
      'Marathi regional text normalized into standard English for central processing.'
    ],
    recommended_action: [
      'Inspect phase cable line 3 near school transformer.',
      'Replace burnt sodium/LED fixtures.'
    ],
    photo: null,
    upvotes: 3,
    authorName: 'Mahesh Kadam'
  },
  {
    id: 'GRV-2026-000140',
    original_text: 'Low water pressure in morning hours, 3rd floor tanks taking 3 hours to fill.',
    normalized_text: 'Low water pressure during morning municipal supply window in residential building',
    language: 'English',
    category: 'Water supply',
    subcategory: 'Low pressure',
    department: 'Water Department',
    escalationDept: 'Water Board',
    priority: 'Medium',
    priorityScore: 56,
    confidence: 0.88,
    ward: 'Dadar',
    wardId: 'dadar',
    location: 'Gokhale Road, Dadar West',
    reportedAt: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
    timeAgo: '1 day ago',
    status: 'ai_processed',
    assignedTo: null,
    similarCount: 0,
    clusterId: null,
    duplicate_status: 'Unique',
    similar_complaint_id: null,
    similarity_score: 0,
    distance_from_similar_complaint: null,
    explanation: ['Routine pressure fluctuation.', 'No sensitive zone proximity.'],
    recommended_action: ['Adjust booster pump regulator timing at Dadar feeder station.'],
    photo: null,
    upvotes: 1,
    authorName: 'Sunita Patil'
  },
  {
    id: 'GRV-2026-000098',
    original_text: 'Garbage not collected on scheduled morning round, bins overflowing on footpath.',
    normalized_text: 'Garbage collection missed on scheduled morning run, waste bins overflowing',
    language: 'English',
    category: 'Garbage',
    subcategory: 'Missed waste pickup',
    department: 'Sanitation',
    escalationDept: 'Ward Officer',
    priority: 'Low',
    priorityScore: 42,
    confidence: 0.95,
    ward: 'Dadar',
    wardId: 'dadar',
    location: 'Ranade Road, Dadar',
    reportedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    timeAgo: '2 days ago',
    status: 'resolved',
    assignedTo: 'JE Nilesh Patil',
    similarCount: 1,
    clusterId: null,
    duplicate_status: 'Resolved',
    similar_complaint_id: null,
    similarity_score: 0,
    distance_from_similar_complaint: null,
    explanation: ['Standard municipal collection delay.', 'Resolved within SLA.'],
    recommended_action: ['Clear bin and verify GPS log of garbage compactor vehicle.'],
    photo: null,
    upvotes: 1,
    authorName: 'Rahul Verma'
  }
];

export const INITIAL_CLUSTERS = [
  {
    id: 'CLUSTER-024',
    title: 'Sewage overflow, Link Road',
    category: 'Drainage',
    department: 'Sanitation / Drainage',
    ward: 'Andheri West',
    similarityScore: 92,
    count: 34,
    isMerged: false,
    primaryId: 'GRV-2026-000145',
    members: [
      { id: 'GRV-2026-000145', note: 'Root report · near bus stand', time: '3 hrs ago', author: 'Karan M.' },
      { id: 'GRV-2026-000148', note: 'Shop front submerged', time: '2 hrs ago', author: 'Deepa S.' },
      { id: 'GRV-2026-000155', note: 'Foul odor across commercial block', time: '1 hr ago', author: 'Rahul V.' }
    ]
  },
  {
    id: 'CLUSTER-012',
    title: 'Road crater & bike skids, SV Road',
    category: 'Roads',
    department: 'Public Works / Roads',
    ward: 'Bandra West',
    similarityScore: 88,
    count: 19,
    isMerged: false,
    primaryId: 'GRV-2026-000166',
    members: [
      { id: 'GRV-2026-000166', note: 'Original report · opp Lucky Restaurant', time: '1 day ago', author: 'Faizan A.' },
      { id: 'GRV-2026-000170', note: 'Biker accident recorded', time: '18 hrs ago', author: 'Sunita P.' }
    ]
  },
  {
    id: 'CLUSTER-008',
    title: 'Streetlight outage, entire lane near school',
    category: 'Streetlights',
    department: 'Electricity / Municipality',
    ward: 'Chembur',
    similarityScore: 81,
    count: 11,
    isMerged: false,
    primaryId: 'GRV-2026-000151',
    members: [
      { id: 'GRV-2026-000151', note: 'Original Marathi report · BMC School No. 4', time: '1 day ago', author: 'Mahesh K.' },
      { id: 'GRV-2026-000159', note: 'Lane 3 pitch dark', time: '20 hrs ago', author: 'Nalini B.' }
    ]
  }
];

export const DEMO_SCENARIO = {
  title: 'SIH26-S02 Demonstration Scenario',
  description: 'Simulate 3 incoming complaints to demonstrate automatic Classification, Prioritization, Hybrid Duplicate Detection, and Cluster Formation.',
  steps: [
    {
      step: 1,
      name: 'Complaint 1 (Root)',
      text: 'Huge pothole near City Mall on main road',
      expectedCategory: 'Roads',
      expectedDept: 'Public Works / Roads',
      expectedPriority: 'High',
      isDuplicate: false
    },
    {
      step: 2,
      name: 'Complaint 2 (Semantic & Geo Match)',
      text: 'Road has a dangerous hole beside City Mall',
      expectedCategory: 'Roads',
      expectedDept: 'Public Works / Roads',
      expectedPriority: 'High',
      isDuplicate: true,
      similarity: '89%',
      distance: '150 metres',
      result: 'Auto-grouped into City Mall Pothole Cluster'
    },
    {
      step: 3,
      name: 'Complaint 3 (Distinct Category)',
      text: 'Streetlight is not working near City Mall',
      expectedCategory: 'Streetlights',
      expectedDept: 'Electricity / Municipality',
      expectedPriority: 'Medium',
      isDuplicate: false,
      result: 'Maintained as separate electrical work order'
    }
  ]
};
