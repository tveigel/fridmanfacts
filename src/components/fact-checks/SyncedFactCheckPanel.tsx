// src/components/fact-checks/SyncedFactCheckPanel.tsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import FactCheck from './core/FactCheck';
import { FactCheck as FactCheckType, UserVotesMap } from '../../lib/types/types';
import { useFactCheckSettings } from '../../lib/context/FactCheckSettingsContext';

interface SyncedFactCheckPanelProps {
  factChecks: FactCheckType[];
  onVote: (factCheckId: string, value: number) => void;
  userVotes: UserVotesMap;
  onDelete: (factCheckId: string, updatedFactCheck?: FactCheckType) => void;
  transcriptRef: React.RefObject<HTMLDivElement>;
  selectedFactCheck: FactCheckType | null;
  onFactCheckSelect: (factCheck: FactCheckType | null) => void;
}

const SyncedFactCheckPanel: React.FC<SyncedFactCheckPanelProps> = ({
  factChecks = [],
  onVote,
  userVotes,
  onDelete,
  transcriptRef,
  selectedFactCheck,
  onFactCheckSelect
}) => {
  const [visibleFactChecks, setVisibleFactChecks] = useState<FactCheckType[]>([]);
  const [collapsedStates, setCollapsedStates] = useState<Record<string, boolean>>({});
  const [width, setWidth] = useState(850);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef<number>(0);
  const { shouldShowFactCheck } = useFactCheckSettings();
  const SCROLL_THROTTLE = 100;
  const EXPAND_ZONE = 300;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      e.preventDefault();
      const newWidth = Math.max(500, Math.min(1200, document.body.clientWidth - e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const calculateVisibleFactChecks = () => {
    if (!transcriptRef.current) return [];
    
    const transcriptTop = transcriptRef.current.getBoundingClientRect().top;
    const viewportTop = window.scrollY;
    const viewportBottom = viewportTop + window.innerHeight;
    const viewportCenter = viewportTop + (window.innerHeight / 2);
    
    return factChecks.filter(factCheck => {
      const element = transcriptRef.current?.querySelector(
        `[data-factcheck-id="${factCheck.id}"]`
      );
      if (!element) return false;
      
      const rect = element.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;
      const distanceFromCenter = Math.abs(absoluteTop - viewportCenter);
      const shouldExpand = distanceFromCenter < EXPAND_ZONE;
      
      setCollapsedStates(prev => ({
        ...prev,
        [factCheck.id]: !shouldExpand
      }));

      return absoluteTop > viewportTop && absoluteTop < viewportBottom;
    });
  };

  const handleScroll = () => {
    const now = Date.now();
    if (now - lastScrollTime.current < SCROLL_THROTTLE) return;
    
    lastScrollTime.current = now;
    requestAnimationFrame(() => {
      const visible = calculateVisibleFactChecks();
      setVisibleFactChecks(visible);
    });
  };

  useEffect(() => {
    const throttledScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime.current < SCROLL_THROTTLE) return;
      handleScroll();
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [factChecks]);

  const factChecksToShow = useMemo(() => {
    if (selectedFactCheck) {
      return shouldShowFactCheck(selectedFactCheck) ? [selectedFactCheck] : [];
    }

    const visibleChecks = visibleFactChecks.filter(shouldShowFactCheck);

    return [...visibleChecks].sort((a, b) => {
      const elemA = document.querySelector(`[data-factcheck-id="${a.id}"]`);
      const elemB = document.querySelector(`[data-factcheck-id="${b.id}"]`);
      if (!elemA || !elemB) return 0;
      return elemA.getBoundingClientRect().top - elemB.getBoundingClientRect().top;
    });
  }, [visibleFactChecks, selectedFactCheck, shouldShowFactCheck]);

  return (
    <div className="flex h-full">
      <div
        className="w-1 hover:bg-blue-200 cursor-col-resize flex-shrink-0"
        onMouseDown={handleMouseDown}
        style={{ cursor: 'col-resize' }}
      />
      
      <div
        ref={panelRef}
        style={{ width: `${width}px` }}
        className="flex-shrink-0"
      >
        <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {selectedFactCheck ? 'Selected Fact Check' : 'Visible Fact Checks'}
            </h2>
            
            {selectedFactCheck && (
              <button
                onClick={() => onFactCheckSelect(null)}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                View All
              </button>
            )}
          </div>
          
          <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
            {factChecksToShow.length > 0 ? (
              factChecksToShow.map((factCheck) => (
                <div key={factCheck.id}>
                  <FactCheck
                    factCheck={factCheck}
                    onVote={onVote}
                    userVotes={userVotes}
                    onUpdateOrDelete={onDelete}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No fact checks match your current filters
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SyncedFactCheckPanel);