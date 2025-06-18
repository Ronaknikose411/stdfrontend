import { useState, useEffect } from 'react';
import axios from 'axios';
import MarkList from '../components/MarkList.jsx';
import MarkForm from '../components/MarkForm.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';

function Marks() {
  const [marks, setMarks] = useState([]);
  const [searchParentId, setSearchParentId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedMark, setSelectedMark] = useState(null);
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchMarks = async () => {
    try {
      const response = await axios.get('http://localhost:5656/api/students/mark/viewallwithmarks');
      console.log('fetchMarks response:', response.data);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      console.log('Setting marks:', data);
      setMarks(data);
      if (data.length === 0) {
        setMessage('No marks found in the database.');
      } else {
        setMessage('');
      }
    } catch (error) {
      console.error('Error fetching marks:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setMessage(`Error fetching marks: ${error.response?.data?.error || error.message}`);
      setMarks([]);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  useEffect(() => {
    fetchMarks();
  }, []);

  const handleSearch = async () => {
    if (!searchParentId) {
      fetchMarks();
      setMessage('');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5656/api/students/mark/view/${searchParentId}`);
      console.log('handleSearch response:', response.data);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      console.log('Setting marks after search:', data);
      setMarks(data);
      if (data.length === 0) {
        setMessage(`No marks found for Parent ID: ${searchParentId}`);
      } else {
        setMessage(`Found ${data.length} mark(s) for Parent ID: ${searchParentId}`);
      }
    } catch (error) {
      console.error('Error searching marks:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setMarks([]);
      setMessage(`Error searching marks: ${error.response?.data?.error || error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDelete = (parentId) => {
    setSelectedMark(parentId);
    setModalAction('delete');
    setShowModal(true);
  };

  const handleUpdate = (mark) => {
    console.log('Preparing to update mark:', mark);
    setSelectedMark(mark);
    setModalAction('update');
    setShowModal(true);
  };

  const confirmAction = async () => {
    try {
      if (modalAction === 'delete') {
        await axios.delete(`http://localhost:5656/api/students/mark/delete/${selectedMark}`);
        setMessage('Mark deleted successfully');
      } else if (modalAction === 'update' && selectedMark) {
        const payload = {
          subject: selectedMark.subject,
          score: Number(selectedMark.score),
          parentId: selectedMark.parentId,
        };
        console.log('Updating mark with payload:', payload);
        await axios.put(`http://localhost:5656/api/students/mark/update/${selectedMark.parentId}`, payload);
        setMessage('Mark updated successfully');
      }
      fetchMarks();
      setShowModal(false);
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error performing action:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleAddSuccess = (newMark) => {
    console.log('New mark added:', newMark);
    setMessage('Mark added successfully');
    fetchMarks();
    setShowAddModal(false);
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div>
      <h2>Marks</h2>
      {message && <div className="alert alert-info">{message}</div>}
    
      <div className="mb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Parent ID"
            value={searchParentId}
            onChange={(e) => setSearchParentId(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
      <MarkList marks={marks} onDelete={handleDelete} onUpdate={handleUpdate} />
      <MarkForm
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
      <ConfirmationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmAction}
        action={modalAction}
      />
    </div>
  );
}

export default Marks;