import { useState } from 'react';
import { useProblemStore } from '../../stores/problemStore';
import { Sparkles, X } from 'lucide-react';

function AddProblemModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('LeetCode');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const { addProblem } = useProblemStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAnalyzing(true);

    try {
      await addProblem({
        title,
        platform,
        platformUrl: url,
        notes
      });

      // Reset form
      setTitle('');
      setPlatform('LeetCode');
      setUrl('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error adding problem:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="modal-content max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark-100">Add Problem</h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-dark-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Problem Title */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Problem Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input w-full"
              placeholder="e.g., Two Sum"
              required
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="input w-full"
            >
              <option value="LeetCode">LeetCode</option>
              <option value="GeeksforGeeks">GeeksforGeeks</option>
              <option value="HackerRank">HackerRank</option>
              <option value="CodeForces">CodeForces</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Problem URL (Optional)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input w-full"
              placeholder="https://leetcode.com/problems/two-sum/"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input w-full min-h-[100px]"
              placeholder="Your approach, key insights, mistakes made..."
            />
          </div>

          {/* AI Notice */}
          <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-lg p-3">
            <p className="text-sm text-brand-orange flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI will automatically analyze and categorize this problem (difficulty, topics, patterns, companies)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={analyzing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                'Add Problem'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProblemModal;
