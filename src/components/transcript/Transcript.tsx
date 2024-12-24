"use client";

import { useRef, useEffect } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { useFactChecks } from '../../hooks/useFactChecks';
import { useTextSelection } from '../../hooks/useTextSelection';
import SyncedFactCheckPanel from '../fact-checks/SyncedFactCheckPanel';
import SelectionModeButton from '../fact-checks/SelectionModeButton';
import SelectionPopup from '../fact-checks/SelectionPopup';
import Modal from '../common/Modal';
import FactCheckSubmission from '../fact-checks/FactCheckSubmission';
import { TranscriptEntry } from './TranscriptEntry';
import FactCheckFilterBar from '../fact-checks/FactCheckFilterBar';
import { LAYOUT } from '../../lib/utils/constants';
import { FactCheck, FactCheckMap } from '../../lib/types/types';

interface Timestamp {
  time: string;
  chapter: string;
}

interface TranscriptEntryType {
  time: string;
  speaker: string;
  text: string;
}

interface TranscriptProps {
  transcript: TranscriptEntryType[];
  timestamps: Timestamp[];
  episodeId: string;
  initialSelectedFactCheckId?: string;
}

export default function Transcript({ 
  transcript, 
  timestamps, 
  episodeId, 
  initialSelectedFactCheckId 
}: TranscriptProps) {
  const { user } = useAuth();
  const transcriptRef = useRef<HTMLDivElement>(null);
  
  const {
    factChecks,
    allFactChecks,
    userVotes,
    handleVote,
    handleUpdateOrDelete,
    selectedFactCheck,
    setSelectedFactCheck,
    loading,
    error,
  } = useFactChecks({ episodeId });

  const {
    isSelectionMode,
    setIsSelectionMode,
    selectedText,
    selectedEntry,
    popupPosition,
    showModal,
    setShowModal,
    handleTextSelection,
    handleFactCheckClick,
  } = useTextSelection();

  const timestampMap = timestamps.reduce((acc: { [key: string]: string }, ts) => {
    acc[ts.time] = ts.chapter;
    return acc;
  }, {});

  useEffect(() => {
    const handleInitialScroll = async () => {
      if (initialSelectedFactCheckId && allFactChecks.length > 0) {
        const selectedCheck = allFactChecks.find(fc => fc.id === initialSelectedFactCheckId);
        if (selectedCheck) {
          setSelectedFactCheck(selectedCheck);
          const sanitizedTime = selectedCheck.transcriptTime.replace(/[:()]/g, "");
          const transcriptElement = document.getElementById(`transcript-${sanitizedTime}`);
          
          if (transcriptElement) {
            setTimeout(() => {
              transcriptElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              });

              const factCheckElement = transcriptElement.querySelector(
                `[data-factcheck-id="${selectedCheck.id}"]`
              );
              
              if (factCheckElement) {
                factCheckElement.classList.add('animate-flash-highlight');
                setTimeout(() => {
                  factCheckElement.classList.remove('animate-flash-highlight');
                }, 2000);
              }
            }, 100);
          }
        }
      }
    };

    handleInitialScroll();
  }, [initialSelectedFactCheckId, allFactChecks, setSelectedFactCheck]);

  const handleFactCheckSelect = (factCheck: FactCheck | null) => {
    setSelectedFactCheck(factCheck);
    if (factCheck) {
      const sanitizedTime = factCheck.transcriptTime.replace(/[:()]/g, "");
      const transcriptElement = document.getElementById(`transcript-${sanitizedTime}`);
      
      if (transcriptElement) {
        transcriptElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        const factCheckElement = transcriptElement.querySelector(
          `[data-factcheck-id="${factCheck.id}"]`
        );
        
        if (factCheckElement) {
          factCheckElement.classList.add('animate-flash-highlight');
          setTimeout(() => {
            factCheckElement.classList.remove('animate-flash-highlight');
          }, 2000);
        }
      }
    }
  };

  if (loading) {
    return <div className="p-4">Loading fact checks...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="relative w-full">
      <div className={`flex ${LAYOUT.SIDEBAR_GAP} relative`}>
        <div 
          ref={transcriptRef}
          className={`${LAYOUT.CONTENT_WIDTH}`}
        >
          <h2 className="text-lg font-semibold mb-4">Transcript</h2>
          <div className="space-y-4">
            {transcript.map((entry, index) => (
              <TranscriptEntry
                key={index}
                entry={entry}
                timestampMap={timestampMap}
                factChecks={factChecks}
                isSelectionMode={isSelectionMode}
                onTextSelection={handleTextSelection}
                onFactCheckClick={handleFactCheckSelect}
              />
            ))}
          </div>
        </div>

        <div className={`${LAYOUT.SIDEBAR_WIDTH} relative`}>
          <FactCheckFilterBar />
          
          <div className="sticky top-4 max-h-screen overflow-y-auto pb-8">
            <SyncedFactCheckPanel
              factChecks={allFactChecks}
              onVote={handleVote}
              userVotes={userVotes}
              onDelete={handleUpdateOrDelete}
              transcriptRef={transcriptRef}
              selectedFactCheck={selectedFactCheck}
              onFactCheckSelect={setSelectedFactCheck}
            />
          </div>
        </div>
      </div>

      {popupPosition && isSelectionMode && selectedText && (
        <SelectionPopup
          top={popupPosition.top}
          left={popupPosition.left}
          onFactCheck={handleFactCheckClick}
        />
      )}

      <SelectionModeButton
        isActive={isSelectionMode}
        onClick={() => setIsSelectionMode(!isSelectionMode)}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <FactCheckSubmission
          episodeId={episodeId}
          transcriptTime={selectedEntry?.time}
          selectedText={selectedText}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}