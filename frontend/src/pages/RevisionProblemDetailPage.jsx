import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRevisionStore } from '../stores/revisionStore';
import QuickReviewModal from '../components/features/QuickReviewModal';
import GuidedReviewModal from '../components/features/GuidedReviewModal';
import RevisionHeader from '../components/features/revision/RevisionHeader';
import RevisionSidebar from '../components/features/revision/RevisionSidebar';
import RevisionContent from '../components/features/revision/RevisionContent';

function RevisionProblemDetailPage({ autoOpenReview = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRevisionById, fetchRevisionById, updateRevisionNotes, completeReview, logRevisionTime } = useRevisionStore();
  
  const [revision, setRevision] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState({});
  const [showQuickReview, setShowQuickReview] = useState(autoOpenReview);
  const [showGuidedReview, setShowGuidedReview] = useState(false);

  useEffect(() => {
    const loadRevision = async () => {
      let rev = getRevisionById(id);
      
      if (!rev) {
        rev = await fetchRevisionById(id);
      }
      
      if (rev) {
        setRevision(rev);
        setEditedNotes({
          coreIdea: rev.coreIdea || '',
          algorithmSteps: rev.algorithmSteps?.join('\n') || '',
          edgeCases: rev.edgeCases?.join('\n') || '',
          notes: rev.notes || ''
        });
      } else {
        navigate('/revision');
      }
    };

    if (id) {
      loadRevision();
    }
  }, [id, getRevisionById, fetchRevisionById, navigate]);

  const handleSave = async () => {
    try {
      await updateRevisionNotes(id, {
        coreIdea: editedNotes.coreIdea,
        algorithmSteps: editedNotes.algorithmSteps.split('\n').filter(s => s.trim()),
        edgeCases: editedNotes.edgeCases.split('\n').filter(s => s.trim()),
        notes: editedNotes.notes
      });
      setIsEditing(false);
      // Refresh local state
      const updatedRev = getRevisionById(id);
      setRevision(updatedRev);
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const handleReviewComplete = async (reviewData) => {
    await completeReview(id, reviewData);
    // Refresh
    const updatedRev = getRevisionById(id);
    setRevision(updatedRev);
  };

  if (!revision) return null;

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <RevisionHeader revision={revision} />

      <div className="flex-1 max-w-screen-2xl mx-auto w-full p-8 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Sidebar (3 cols) - Sticky */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24">
            <RevisionSidebar 
              revision={revision}
              onStartReview={() => setShowQuickReview(true)}
              onGuidedReview={() => setShowGuidedReview(true)}
            />
          </div>
        </div>

        {/* Main Content (9 cols) */}
        <div className="lg:col-span-8 xl:col-span-9">
          <RevisionContent 
            revision={revision}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editedNotes={editedNotes}
            setEditedNotes={setEditedNotes}
            onSave={handleSave}
            onLogTime={logRevisionTime}
          />
        </div>
      </div>

      {/* Modals */}
      {showQuickReview && (
        <QuickReviewModal 
          revision={revision} 
          onClose={() => setShowQuickReview(false)}
          onComplete={handleReviewComplete}
        />
      )}
      
      {showGuidedReview && (
        <GuidedReviewModal 
          revision={revision} 
          onClose={() => setShowGuidedReview(false)}
          onComplete={handleReviewComplete}
        />
      )}
    </div>
  );
}

export default RevisionProblemDetailPage;
