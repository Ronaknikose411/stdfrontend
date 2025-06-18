import { useState } from 'react';
import axios from 'axios';

function MarkForm({ show, onClose, onSuccess, parentId }) {
  const [subject, setSubject] = useState('');
  const [score, setScore] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate inputs
    if (!subject || !score) {
      setError('Subject and Score are required.');
      return;
    }
    if (isNaN(Number(score)) || Number(score) < 0 || Number(score) > 100) {
      setError('Score must be a number between 0 and 100.');
      return;
    }

    const mark = { subject, score: Number(score) }; // Only subject and score
    const payload = [mark]; // Wrap in an array as per API requirement
    console.log('Submitting mark data:', { parentId, marks: payload });

    try {
      const response = await axios.post(`http://localhost:5656/api/students/mark/add/${parentId}`, payload);
      console.log('Add mark response:', response.data);
      setSubject('');
      setScore('');
      setError('');
      onSuccess(response.data);
      onClose();
    } catch (error) {
      console.error('Error adding mark:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setError(`Error adding mark: ${error.response?.data?.error || error.message}`);
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
                    value={parentId || ''}
                    readOnly // Make it read-only since it's pre-filled
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
                <button type="submit" className="btn btn-primary">
                  Add Mark
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