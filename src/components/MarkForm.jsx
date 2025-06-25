import { useState, useEffect } from 'react'; // Add useEffect import
import axios from 'axios';

function MarkForm({ show, onClose, onSuccess, parentId }) {
  const [subject, setSubject] = useState('');
  const [score, setScore] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localParentId, setLocalParentId] = useState(parentId || '');

  useEffect(() => {
    setLocalParentId(parentId || '');
  }, [parentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Validate inputs
    if (!localParentId) {
      setError('Parent ID is required.');
      setIsSubmitting(false);
      return;
    }
    if (!subject || !score) {
      setError('Subject and Score are required.');
      setIsSubmitting(false);
      return;
    }
    if (isNaN(Number(score)) || Number(score) < 0 || Number(score) > 100) {
      setError('Score must be a number between 0 and 100.');
      setIsSubmitting(false);
      return;
    }

    const mark = { subject, score: Number(score) };
    const payload = { marks: [mark] };
    console.log('Submitting mark data:', { parentId: String(localParentId), marks: JSON.stringify(payload, null, 2) });

    try {
      // Validate parentId existence
      await axios.get(`http://localhost:5656/api/students/view/${String(localParentId)}`);
      const response = await axios.post(`http://localhost:5656/api/students/mark/add/${String(localParentId)}`, payload);
      console.log('Add mark response:', JSON.stringify(response.data, null, 2));
      if (response.status === 201) {
        setSubject('');
        setScore('');
        setError('');
        onSuccess(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error adding mark:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      setError(`Error adding mark: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={`modal fade ${show ? 'show' : ''}`}
        style={{ display: show ? 'block' : 'none' }}
        tabIndex="-1"
        aria-hidden={!show}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Mark</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  onClose();
                  setError('');
                  setSubject('');
                  setScore('');
                  setLocalParentId(parentId || '');
                }}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Parent ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={localParentId}
                    onChange={(e) => setLocalParentId(e.target.value)}
                    placeholder="Enter Parent ID"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Score</label>
                  <input
                    type="number"
                    className="form-control"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Mark'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show"></div>}
    </>
  );
}

export default MarkForm;