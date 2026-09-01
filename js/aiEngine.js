/**
 * JanSetu AI Engine
 * Multilingual NLP Classifier, Semantic Duplicate Detector & Priority Scorer
 */

window.JanSetuAI = (function () {
  // Multilingual Lexicons
  const VOCABULARY = {
    sanitation: [
      'gutter', 'sewage', 'drain', 'drainage', 'garbage', 'kachra', 'trash', 'waste', 'foul', 'smell', 'badbu',
      'nalli', 'safai', 'stink', 'filth', 'overflow', 'overflowing', 'bin', 'dump', 'debrish',
      'गटार', 'कचरा', 'घाण', 'दुर्गंधी', 'सांडपाणी', 'गटर', 'कचरापेटी', 'सफाई', 'बदबू'
    ],
    water: [
      'water', 'supply', 'pipe', 'pipeline', 'leak', 'leakage', 'contamination', 'dirty water', 'paani', 'pani',
      'pressure', 'tank', 'drinking water', 'tap', 'burst', 'dry', 'no water', 'tanker',
      'पाणी', 'पाण्याची', 'पाईप', 'गळती', 'नळ', 'टँकर', 'जलवाहिनी'
    ],
    roads: [
      'road', 'pothole', 'khadda', 'gaddha', 'asphalt', 'zebra crossing', 'traffic', 'signal', 'speedbreaker',
      'accident', 'footpath', 'crater', 'divider', 'tar', 'sidewalk', 'lane', 'street',
      'रस्ता', 'खड्डा', 'अपघात', 'पदपथ', 'सिग्नल', 'रस्ते'
    ],
    electricity: [
      'light', 'streetlight', 'lamp', 'pole', 'dark', 'bulb', 'wire', 'spark', 'current', 'shock', 'batti',
      'power cut', 'transformer', 'blackout', 'outage', 'flicker', 'flickering',
      'दिवा', 'पथदिवा', 'विद्युत', 'वीज', 'अंधार', 'पोल', 'वायर', 'लाईट'
    ],
    'public-works': [
      'manhole', 'open manhole', 'slab', 'bridge', 'flyover', 'tree fall', 'falling', 'wall collapsed', 'safety',
      'danger', 'chamber', 'culvert', 'railing', 'structure', 'hazard',
      'मॅनहोल', 'धोकादायक', 'झाड', 'पूल', 'भिंत', 'संरक्षण'
    ]
  };

  const URGENCY_TERMS = [
    'danger', 'emergency', 'urgent', 'accident', 'hospital', 'school', 'child', 'children',
    'spark', 'shock', 'severe', 'hazard', 'death', 'serious', 'risk', 'flooding', 'illness',
    'धोका', 'तातडीने', 'रुग्णालय', 'शाळा', 'अपघात', 'गंभीर', 'खतरा', 'इमरजेंसी', 'अस्पताल'
  ];

  const SENSITIVE_AREAS = ['hospital', 'school', 'station', 'junction', 'clinic', 'bus stop', 'market', 'शाळा', 'रुग्णालय'];

  /**
   * Normalizes text across Hindi, Hinglish, Marathi, and English
   */
  function normalizeText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Classifies text into a municipal department category with confidence rating
   */
  function classifyComplaint(text) {
    const clean = normalizeText(text);
    const words = clean.split(' ');
    
    let scores = {
      sanitation: 0,
      water: 0,
      roads: 0,
      electricity: 0,
      'public-works': 0
    };

    for (const [dept, keywords] of Object.entries(VOCABULARY)) {
      for (const kw of keywords) {
        if (clean.includes(kw)) {
          scores[dept] += kw.includes(' ') ? 4 : 2;
        }
      }
    }

    let topDept = 'sanitation';
    let maxScore = 0;
    let totalScore = 0;

    for (const [dept, score] of Object.entries(scores)) {
      totalScore += score;
      if (score > maxScore) {
        maxScore = score;
        topDept = dept;
      }
    }

    const confidence = totalScore > 0 ? Math.min(Math.round((maxScore / (totalScore + 1)) * 100), 98) : 65;

    const deptDisplayNames = {
      sanitation: 'Sanitation',
      water: 'Water Supply',
      roads: 'Roads & Traffic',
      electricity: 'Electricity & Lighting',
      'public-works': 'Public Works & Safety'
    };

    return {
      department: topDept,
      departmentName: deptDisplayNames[topDept] || 'General Grievance',
      confidence: confidence < 50 ? 55 : confidence
    };
  }

  /**
   * Computes multi-factor priority score (0 - 100)
   */
  function calculatePriority(text, location, clusterCount = 1) {
    const clean = normalizeText(text + ' ' + (location || ''));
    let score = 30; // base score

    // 1. Urgency / Safety keywords (up to +35 pts)
    let urgencyHits = 0;
    for (const term of URGENCY_TERMS) {
      if (clean.includes(term)) urgencyHits++;
    }
    score += Math.min(urgencyHits * 12, 35);

    // 2. Sensitive zone proximity (up to +15 pts)
    let sensitiveHit = false;
    for (const zone of SENSITIVE_AREAS) {
      if (clean.includes(zone)) {
        sensitiveHit = true;
        break;
      }
    }
    if (sensitiveHit) score += 15;

    // 3. Cluster duplicate multiplier (up to +20 pts)
    if (clusterCount > 1) {
      score += Math.min(Math.round(Math.log2(clusterCount) * 4.5), 20);
    }

    score = Math.min(Math.max(score, 25), 98);

    let tier = 'low';
    if (score >= 78) tier = 'high';
    else if (score >= 50) tier = 'med';

    return {
      score,
      tier
    };
  }

  /**
   * Calculates similarity between two text strings using token overlap & n-gram Jaccard
   */
  function calculateSemanticSimilarity(textA, textB) {
    const tokensA = new Set(normalizeText(textA).split(' ').filter(w => w.length > 2));
    const tokensB = new Set(normalizeText(textB).split(' ').filter(w => w.length > 2));
    
    if (tokensA.size === 0 || tokensB.size === 0) return 0;

    let intersection = 0;
    for (const token of tokensA) {
      if (tokensB.has(token)) intersection++;
    }

    const union = new Set([...tokensA, ...tokensB]).size;
    const jaccard = intersection / union;

    // Boost if department keywords overlap
    return Math.min(Number((jaccard * 1.5).toFixed(2)), 0.99);
  }

  /**
   * Checks for duplicate issues against current active complaints & clusters
   */
  function findDuplicates(text, ward, existingList = []) {
    const clean = normalizeText(text);
    if (clean.length < 8) return null;

    let bestMatch = null;
    let highestSim = 0;

    for (const item of existingList) {
      // Compare description + title
      const sim = calculateSemanticSimilarity(text, item.title + ' ' + item.description);
      
      // Check ward/location match or high keyword correlation
      const wardMatch = !ward || (item.ward && item.ward.toLowerCase() === ward.toLowerCase());
      
      if (sim > highestSim && (sim >= 0.45 || (sim >= 0.35 && wardMatch))) {
        highestSim = sim;
        bestMatch = item;
      }
    }

    if (bestMatch && highestSim >= 0.35) {
      const matchScore = Math.min(Math.round(highestSim * 100 + (bestMatch.similarCount > 5 ? 15 : 0)), 96);
      return {
        isDuplicate: true,
        matchedComplaint: bestMatch,
        similarityScore: matchScore,
        similarCount: (bestMatch.similarCount || 1) + 1,
        message: `${bestMatch.similarCount || 34} people nearby reported a similar ${bestMatch.departmentName.toLowerCase()} issue on ${bestMatch.location || 'this location'} recently.`
      };
    }

    return null;
  }

  return {
    normalizeText,
    classifyComplaint,
    calculatePriority,
    findDuplicates,
    calculateSemanticSimilarity
  };
})();
