import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_COMPLAINTS, INITIAL_CLUSTERS, WARDS } from '../data/mockData';
import { normalizeComplaintText, classifyComplaint, calculatePriority } from '../services/aiEngine';
import { useAuth } from './AuthContext';

const GrievanceContext = createContext();

const STORAGE_KEY_COMPLAINTS = 'jansetu_react_complaints_v1';
const STORAGE_KEY_CLUSTERS = 'jansetu_react_clusters_v1';
const STORAGE_KEY_WARD = 'jansetu_react_ward_v1';

export const GrievanceProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
      return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
    } catch (e) {
      return INITIAL_COMPLAINTS;
    }
  });

  const [clusters, setClusters] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLUSTERS);
      return saved ? JSON.parse(saved) : INITIAL_CLUSTERS;
    } catch (e) {
      return INITIAL_CLUSTERS;
    }
  });

  const [selectedWard, setSelectedWard] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_WARD) || 'Andheri West';
  });

  const [selectedDept, setSelectedDept] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLUSTERS, JSON.stringify(clusters));
  }, [clusters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WARD, selectedWard);
  }, [selectedWard]);

  // Toast Helper
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  /**
   * Submits a fresh citizen complaint with full SIH26-S02 AI pipeline
   */
  const submitComplaint = (formData) => {
    const rawText = formData.description;
    const { normalized, language, duration } = normalizeComplaintText(rawText);
    const classification = classifyComplaint(rawText);
    const priorityAnalysis = calculatePriority(rawText, formData.location || selectedWard, 1);

    const idNumber = 1000 + Math.floor(Math.random() * 9000);
    const newId = `GRV-2026-00${idNumber}`;

    const newGrievance = {
      id: newId,
      original_text: rawText,
      normalized_text: normalized,
      language: language,
      category: classification.categoryName,
      subcategory: classification.subcategory,
      department: classification.department,
      escalationDept: classification.escalationDept,
      priority: priorityAnalysis.priority,
      priorityScore: priorityAnalysis.score,
      confidence: classification.confidence,
      ward: formData.ward || selectedWard,
      wardId: (formData.ward || selectedWard).toLowerCase().replace(/\s+/g, '-'),
      location: formData.location || `Near Link Road, ${selectedWard}`,
      reportedAt: new Date().toISOString(),
      timeAgo: 'Just now',
      status: 'assigned', // moves directly to assigned in modern AI pipeline
      assignedTo: 'JE Nilesh Patil',
      similarCount: 0,
      clusterId: null,
      duplicate_status: 'Unique',
      similar_complaint_id: null,
      similarity_score: 0,
      distance_from_similar_complaint: null,
      explanation: priorityAnalysis.explanation,
      recommended_action: priorityAnalysis.recommended_action,
      photo: formData.photo || null,
      upvotes: 1,
      authorName: currentUser ? currentUser.name : 'Citizen'
    };

    setComplaints(prev => [newGrievance, ...prev]);
    showToast(`Report #${newId} filed! Priority: ${priorityAnalysis.priority.toUpperCase()}`, 'success');
    return newGrievance;
  };

  /**
   * Citizen joins an existing duplicate issue cluster (+1 Me Too)
   */
  const joinCluster = (clusterOrComplaintId, formData = {}) => {
    setComplaints(prev => {
      return prev.map(item => {
        if (item.id === clusterOrComplaintId || item.clusterId === clusterOrComplaintId) {
          const newCount = (item.similarCount || 1) + 1;
          const newUpvotes = (item.upvotes || 1) + 1;
          const newScore = Math.min((item.priorityScore || 70) + 3, 99);
          return {
            ...item,
            similarCount: newCount,
            upvotes: newUpvotes,
            priorityScore: newScore,
            priority: newScore >= 82 ? 'High' : item.priority
          };
        }
        return item;
      });
    });

    setClusters(prev => {
      return prev.map(cl => {
        if (cl.id === clusterOrComplaintId || cl.primaryId === clusterOrComplaintId) {
          return {
            ...cl,
            count: cl.count + 1,
            members: [
              ...cl.members,
              {
                id: `GRV-2026-00${Math.floor(1000 + Math.random() * 9000)}`,
                note: 'Citizen joined report via duplicate interception',
                time: 'Just now',
                author: currentUser ? currentUser.name : 'You (Citizen)'
              }
            ]
          };
        }
        return cl;
      });
    });

    showToast(`Added your report to #${clusterOrComplaintId}. Priority score boosted!`, 'success');
  };

  /**
   * Authority updates complaint status and engineer assignment
   */
  const updateComplaintStatus = (id, updates) => {
    setComplaints(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      });
    });
    showToast(`Updated #${id} → Status: ${(updates.status || 'Updated').toUpperCase()}`, 'success');
  };

  /**
   * Merge and batch dispatch cluster in authority dashboard
   */
  const mergeCluster = (clusterId) => {
    setClusters(prev => {
      return prev.map(c => {
        if (c.id === clusterId) {
          return { ...c, isMerged: true };
        }
        return c;
      });
    });
    showToast(`Cluster ${clusterId} merged! Automated SMS update dispatched to all citizens.`, 'success');
  };

  /**
   * Rate resolution
   */
  const rateResolution = (id, rating, feedback) => {
    setComplaints(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            rating,
            feedback,
            status: 'closed'
          };
        }
        return item;
      });
    });
    showToast(`Resolution rated ${rating}★! Complaint #${id} closed.`, 'success');
  };

  /**
   * Reopen complaint
   */
  const reopenComplaint = (id, reason) => {
    setComplaints(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'escalated',
            reopenReason: reason,
            priority: 'Critical',
            priorityScore: 98
          };
        }
        return item;
      });
    });
    showToast(`Complaint #${id} reopened and escalated to Municipal Commissioner!`, 'warning');
  };

  return (
    <GrievanceContext.Provider
      value={{
        complaints,
        clusters,
        selectedWard,
        setSelectedWard,
        selectedDept,
        setSelectedDept,
        searchQuery,
        setSearchQuery,
        toasts,
        showToast,
        submitComplaint,
        joinCluster,
        updateComplaintStatus,
        mergeCluster,
        rateResolution,
        reopenComplaint
      }}
    >
      {children}
    </GrievanceContext.Provider>
  );
};

export const useGrievances = () => useContext(GrievanceContext);
