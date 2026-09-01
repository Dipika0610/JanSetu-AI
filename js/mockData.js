/**
 * JanSetu AI - Mock Database & Seed Datasets
 * Real-world civic scenarios across Mumbai Wards
 */

window.JanSetuData = (function () {
  const WARDS = [
    { id: 'andheri-w', name: 'Andheri West', zone: 'Western Suburbs', officer: 'S. Kulkarni', openCount: 48, coords: { x: 88, y: 55, lat: 19.1363, lng: 72.8276 } },
    { id: 'bandra-w', name: 'Bandra West', zone: 'Western Suburbs', officer: 'A. Deshmukh', openCount: 36, coords: { x: 185, y: 60, lat: 19.0596, lng: 72.8295 } },
    { id: 'kurla', name: 'Kurla', zone: 'Eastern Suburbs', officer: 'P. Sawant', openCount: 52, coords: { x: 235, y: 105, lat: 19.0726, lng: 72.8845 } },
    { id: 'dadar', name: 'Dadar', zone: 'City Central', officer: 'R. Shinde', openCount: 29, coords: { x: 105, y: 120, lat: 19.0178, lng: 72.8478 } },
    { id: 'chembur', name: 'Chembur', zone: 'Eastern Suburbs', officer: 'V. More', openCount: 33, coords: { x: 205, y: 160, lat: 19.0622, lng: 72.8994 } },
    { id: 'worli', name: 'Worli', zone: 'South Mumbai', officer: 'M. Joshi', openCount: 20, coords: { x: 140, y: 45, lat: 19.0166, lng: 72.8166 } }
  ];

  const DEPARTMENTS = [
    { id: 'sanitation', name: 'Sanitation', head: 'Solid Waste Management', icon: 'trash-2' },
    { id: 'water', name: 'Water Supply', head: 'Hydraulic Engineering', icon: 'droplet' },
    { id: 'roads', name: 'Roads & Traffic', head: 'Roads & Bridges Dept', icon: 'navigation' },
    { id: 'electricity', name: 'Electricity & Lighting', head: 'Electrical Works', icon: 'zap' },
    { id: 'public-works', name: 'Public Works & Safety', head: 'Stormwater & Drainage', icon: 'shield-alert' }
  ];

  const OFFICERS = [
    { id: 'off-1', name: 'S. Kulkarni', designation: 'Ward Executive Engineer', ward: 'Andheri West' },
    { id: 'off-2', name: 'JE Nilesh Patil', designation: 'Junior Engineer (Sanitation)', ward: 'Andheri West' },
    { id: 'off-3', name: 'AE Ramesh Jadhav', designation: 'Assistant Engineer (Water Supply)', ward: 'Kurla' },
    { id: 'off-4', name: 'JE Priya Sharma', designation: 'Junior Engineer (Roads)', ward: 'Bandra West' },
    { id: 'off-5', name: 'Sub-Engg Amit Shinde', designation: 'Electrical Inspector', ward: 'Chembur' }
  ];

  // Initial seed complaints
  const INITIAL_COMPLAINTS = [
    {
      id: 'GRV-40218',
      title: 'Sewage overflow flooding Link Road',
      description: 'Gutter overflowing near the bus stop on Link Road, water has been standing for two days and smells very bad.',
      department: 'sanitation',
      departmentName: 'Sanitation',
      ward: 'Andheri West',
      wardId: 'andheri-w',
      location: 'Near Link Road Bus Stop, Andheri West',
      reportedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      timeAgo: '3 hrs ago',
      priority: 'high',
      priorityScore: 94,
      status: 'unassigned',
      assignedTo: null,
      similarCount: 34,
      clusterId: 'CLUST-LINKRD-SEWAGE',
      isDuplicate: false,
      photo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
      upvotes: 34
    },
    {
      id: 'GRV-40224',
      title: 'Open manhole near bus stop, high safety risk',
      description: 'Cover missing on stormwater drainage chamber right in front of Worli Sea Face bus stop. Very dangerous in the dark.',
      department: 'public-works',
      departmentName: 'Public Works',
      ward: 'Worli',
      wardId: 'worli',
      location: 'Worli Sea Face, opp. Sunrise Apartments',
      reportedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      timeAgo: '5 hrs ago',
      priority: 'high',
      priorityScore: 91,
      status: 'unassigned',
      assignedTo: null,
      similarCount: 2,
      clusterId: null,
      isDuplicate: false,
      photo: null,
      upvotes: 2
    },
    {
      id: 'GRV-40190',
      title: 'No water supply for 4 consecutive days',
      description: 'Pipeline supply completely disrupted across CTS 410 to 440 in Kurla West. 150+ families severely impacted near hospital.',
      department: 'water',
      departmentName: 'Water Supply',
      ward: 'Kurla',
      wardId: 'kurla',
      location: 'Pipeline Road, Kurla West',
      reportedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      timeAgo: '6 hrs ago',
      priority: 'high',
      priorityScore: 89,
      status: 'assigned',
      assignedTo: 'AE Ramesh Jadhav',
      similarCount: 12,
      clusterId: 'CLUST-KURLA-WATER',
      isDuplicate: false,
      photo: null,
      upvotes: 12
    },
    {
      id: 'GRV-40166',
      title: 'Deep pothole causing bike skid accidents',
      description: 'Bada khadda ho gaya hai road pe, do bikers gir chuke hain barish ke paani se dikhta nahi hai.',
      department: 'roads',
      departmentName: 'Roads & Traffic',
      ward: 'Bandra West',
      wardId: 'bandra-w',
      location: 'SV Road Junction, near Lucky Restaurant',
      reportedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      timeAgo: '1 day ago',
      priority: 'med',
      priorityScore: 72,
      status: 'progress',
      assignedTo: 'JE Priya Sharma',
      similarCount: 8,
      clusterId: 'CLUST-SV-POTHOLE',
      isDuplicate: false,
      photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      upvotes: 8
    },
    {
      id: 'GRV-40151',
      title: 'Streetlights out near municipal primary school',
      description: 'रात्रीच्या वेळी शाळेच्या परिसरात सर्व पथदिवे बंद असतात. विद्यार्थ्यांसाठी सुरक्षित नाही.',
      department: 'electricity',
      departmentName: 'Electricity & Lighting',
      ward: 'Chembur',
      wardId: 'chembur',
      location: 'Near BMC School No. 4, Chembur East',
      reportedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
      timeAgo: '1 day ago',
      priority: 'med',
      priorityScore: 68,
      status: 'assigned',
      assignedTo: 'Sub-Engg Amit Shinde',
      similarCount: 3,
      clusterId: 'CLUST-CHEMBUR-LIGHTS',
      isDuplicate: false,
      photo: null,
      upvotes: 3
    },
    {
      id: 'GRV-40140',
      title: 'Low water pressure, 3rd floor and above',
      description: 'Morning water pressure is very sluggish, barely filling ground tanks.',
      department: 'water',
      departmentName: 'Water Supply',
      ward: 'Dadar',
      wardId: 'dadar',
      location: 'Gokhale Road, Dadar West',
      reportedAt: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
      timeAgo: '1 day ago',
      priority: 'med',
      priorityScore: 58,
      status: 'unassigned',
      assignedTo: null,
      similarCount: 0,
      clusterId: null,
      isDuplicate: false,
      photo: null,
      upvotes: 1
    },
    {
      id: 'GRV-40098',
      title: 'Garbage not collected on scheduled morning run',
      description: 'Wet and dry waste bins are overflowing onto the footpath.',
      department: 'sanitation',
      departmentName: 'Sanitation',
      ward: 'Dadar',
      wardId: 'dadar',
      location: 'Ranade Road, Dadar',
      reportedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      timeAgo: '2 days ago',
      priority: 'low',
      priorityScore: 42,
      status: 'resolved',
      assignedTo: 'JE Nilesh Patil',
      similarCount: 1,
      clusterId: null,
      isDuplicate: false,
      photo: null,
      upvotes: 1
    },
    {
      id: 'GRV-40071',
      title: 'Faded zebra crossing near busy junction',
      description: 'Pedestrian crossing marks are almost invisible due to recent resurfacing.',
      department: 'roads',
      departmentName: 'Roads & Traffic',
      ward: 'Chembur',
      wardId: 'chembur',
      location: 'Diamond Garden Signal, Chembur',
      reportedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      timeAgo: '3 days ago',
      priority: 'low',
      priorityScore: 35,
      status: 'progress',
      assignedTo: 'JE Priya Sharma',
      similarCount: 0,
      clusterId: null,
      isDuplicate: false,
      photo: null,
      upvotes: 0
    }
  ];

  // Pre-configured Duplicate Clusters
  const INITIAL_CLUSTERS = [
    {
      id: 'CLUST-LINKRD-SEWAGE',
      title: 'Sewage overflow, Link Road',
      department: 'sanitation',
      departmentName: 'Sanitation',
      ward: 'Andheri West',
      similarityScore: 92,
      count: 34,
      isMerged: false,
      primaryId: 'GRV-40218',
      members: [
        { id: 'GRV-40218', note: 'Original root report', time: '3 hrs ago', author: 'Karan M.' },
        { id: 'GRV-40219', note: 'Same block, shop front flooded', time: '2 hrs ago', author: 'Deepa S.' },
        { id: 'GRV-40221', note: 'Same block, pungent foul odor', time: '1 hr ago', author: 'Rahul V.' }
      ]
    },
    {
      id: 'CLUST-SV-POTHOLE',
      title: 'Water pipeline burst & road crater, SV Road',
      department: 'roads',
      departmentName: 'Roads / Water',
      ward: 'Bandra West',
      similarityScore: 88,
      count: 19,
      isMerged: false,
      primaryId: 'GRV-40166',
      members: [
        { id: 'GRV-40166', note: 'Original report', time: '1 day ago', author: 'Faizan A.' },
        { id: 'GRV-40201', note: 'Opposite Lucky restaurant', time: '18 hrs ago', author: 'Sunita P.' }
      ]
    },
    {
      id: 'CLUST-CHEMBUR-LIGHTS',
      title: 'Streetlight outage, entire stretch near school',
      department: 'electricity',
      departmentName: 'Electricity',
      ward: 'Chembur',
      similarityScore: 81,
      count: 11,
      isMerged: false,
      primaryId: 'GRV-40151',
      members: [
        { id: 'GRV-40151', note: 'Original report', time: '1 day ago', author: 'Mahesh K.' },
        { id: 'GRV-40155', note: 'Nearby lane 3 pitch dark', time: '20 hrs ago', author: 'Nalini B.' }
      ]
    }
  ];

  return {
    WARDS,
    DEPARTMENTS,
    OFFICERS,
    INITIAL_COMPLAINTS,
    INITIAL_CLUSTERS
  };
})();
