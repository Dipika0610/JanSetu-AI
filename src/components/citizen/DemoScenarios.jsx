import React, { useState } from 'react';
import { useGrievances } from '../../context/GrievanceContext';
import { DEMO_SCENARIO } from '../../data/mockData';
import { Play, CheckCircle2, ArrowRight, Layers, Sparkles } from 'lucide-react';

export const DemoScenarios = () => {
  const { submitComplaint, showToast } = useGrievances();
  const [currentStep, setCurrentStep] = useState(0);
  const [demoLogs, setDemoLogs] = useState([]);

  const runStep = (stepNum) => {
    const stepData = DEMO_SCENARIO.steps[stepNum - 1];
    if (!stepData) return;

    if (stepNum === 1) {
      submitComplaint({
        description: stepData.text,
        location: 'Opposite City Mall, Main Road',
        ward: 'Andheri West'
      });
      setDemoLogs(prev => [
        ...prev,
        {
          step: 1,
          title: 'Complaint 1 Filed',
          desc: stepData.text,
          aiResult: 'Classified: Roads | Priority: High (Accident Risk) | Status: Standalone Ticket'
        }
      ]);
      setCurrentStep(1);
    } else if (stepNum === 2) {
      submitComplaint({
        description: stepData.text,
        location: 'Beside City Mall, Main Road (150m from Complaint 1)',
        ward: 'Andheri West'
      });
      setDemoLogs(prev => [
        ...prev,
        {
          step: 2,
          title: 'Complaint 2 (Semantic & Geo Match)',
          desc: stepData.text,
          aiResult: 'Semantic Similarity: 89% | Distance: 150m | Action: Auto-grouped into City Mall Pothole Cluster'
        }
      ]);
      setCurrentStep(2);
    } else if (stepNum === 3) {
      submitComplaint({
        description: stepData.text,
        location: 'City Mall Junction',
        ward: 'Andheri West'
      });
      setDemoLogs(prev => [
        ...prev,
        {
          step: 3,
          title: 'Complaint 3 (Distinct Category)',
          desc: stepData.text,
          aiResult: 'Category: Streetlights (Electricity Dept) | Action: Maintained as independent work order'
        }
      ]);
      setCurrentStep(3);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setDemoLogs([]);
    showToast('Demo scenario reset.', 'info');
  };

  return (
    <div className="card animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Sparkles size={18} style={{ color: 'var(--blue)' }} />
        <h3 style={{ margin: 0, fontSize: '15.5px' }}>{DEMO_SCENARIO.title}</h3>
      </div>
      <p style={{ fontSize: '12.8px', color: 'var(--ink-soft)', marginBottom: 16 }}>
        {DEMO_SCENARIO.description}
      </p>

      {/* Step Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {DEMO_SCENARIO.steps.map((step) => {
          const isDone = currentStep >= step.step;
          const isNext = currentStep === step.step - 1;

          return (
            <div
              key={step.step}
              style={{
                border: `1px solid ${isDone ? 'var(--moss)' : isNext ? 'var(--blue)' : 'var(--line-strong)'}`,
                background: isDone ? 'var(--moss-soft)' : isNext ? 'var(--card)' : 'var(--paper)',
                padding: '12px 14px',
                borderRadius: 8,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <strong style={{ fontSize: '13px', color: isDone ? 'var(--moss)' : 'var(--ink)' }}>
                  Step {step.step}: {step.name}
                </strong>
                {isDone ? (
                  <span className="badge badge-moss"><CheckCircle2 size={11} /> Executed</span>
                ) : (
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '4px 10px', fontSize: '11.5px', margin: 0, width: 'auto' }}
                    onClick={() => runStep(step.step)}
                    disabled={!isNext}
                  >
                    <Play size={11} />
                    <span>Run Step</span>
                  </button>
                )}
              </div>
              <div style={{ fontSize: '12.2px', color: 'var(--ink-soft)' }}>
                "{step.text}"
              </div>
              {step.result && (
                <div style={{ fontSize: '11.3px', color: 'var(--blue-dim)', marginTop: 4, fontWeight: 500 }}>
                  Expected: {step.result}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Live Demonstration Execution Log */}
      {demoLogs.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8, padding: '12px', marginTop: 14 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--blue)', marginBottom: 8 }}>
            AI Processing Pipeline Output Log:
          </div>
          {demoLogs.map((log, i) => (
            <div key={i} style={{ borderTop: i > 0 ? '1px dashed var(--line)' : 'none', padding: '6px 0', fontSize: '11.8px' }}>
              <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{log.title}:</div>
              <div style={{ color: 'var(--ink-soft)', fontStyle: 'italic' }}>"{log.desc}"</div>
              <div style={{ color: 'var(--moss)', fontWeight: 500, marginTop: 2 }}>{log.aiResult}</div>
            </div>
          ))}
          <button
            type="button"
            className="btn-ghost"
            onClick={resetDemo}
            style={{ marginTop: 10, padding: '6px 0', fontSize: '12px' }}
          >
            Reset Demonstration
          </button>
        </div>
      )}
    </div>
  );
};
