import { useState } from 'react';
import MarkForm from './MarkForm.jsx'; // Add this import

function MarkList({ marks, onDelete, onUpdate, onAdd }) {
  const [editMark, setEditMark] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);

  const handleEditChange = (e, field) => {
    setEditMark({ ...editMark, [field]: e.target.value });
  };

  const handleEditSubmit = () => {
    onUpdate(editMark);
    setEditMark(null);
  };

  const handleAddClick = (parentId) => {
    setSelectedParentId(parentId);
    setShowAddForm(true);
  };

  if (!Array.isArray(marks) || marks.length === 0) {
    return (
      <div className="alert alert-info">
        No marks available to display.
      </div>
    );
  }

  return (
    <>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Parent ID</th>
            <th>Name</th>
            <th>Subject</th>
            <th>Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {marks.map((mark, index) => (
            <tr key={mark.id || mark.parentId || index}>
              {editMark && editMark.id === mark.id ? (
                <>
                  <td>{mark.parentId}</td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={editMark.name || ''}
                      onChange={(e) => handleEditChange(e, 'name')}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={editMark.subject}
                      onChange={(e) => handleEditChange(e, 'subject')}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={editMark.score}
                      onChange={(e) => handleEditChange(e, 'score')}
                    />
                  </td>
                  <td>
                    <button className="btn btn-success me-2" onClick={handleEditSubmit}>
                      Save
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditMark(null)}>
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{mark.parentId}</td>
                  <td>{mark.name || 'N/A'}</td>
                  <td>{mark.subject}</td>
                  <td>{mark.score}</td>
                  <td>
                    <button
                      className="btn btn-warning me-2"
                      onClick={() => setEditMark(mark)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger me-2"
                      onClick={() => onDelete(mark.parentId)}
                    >
                      Delete
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAddClick(mark.parentId)}
                    >
                      Add Mark
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {showAddForm && (
        <MarkForm
          show={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSuccess={onAdd}
          parentId={selectedParentId}
        />
      )}
    </>
  );
}

export default MarkList;