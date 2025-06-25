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
  const [addParentId, setAddParentId] = useState('');

  const fetchMarks = async () => {
    try {
      const response = await axios.get('http://localhost:5656/api/students/mark/viewallwithmarks');
      console.log('fetchMarks response:', JSON.stringify(response.data, null, 2));
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      console.log('Setting marks:', JSON.stringify(data, null, 2));
      setMarks(data);
      console.log('Marks state after setMarks:', JSON.stringify(data, null, 2));
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
      setMessage(`Error retrieving marks: ${error.response?.data?.error || error.message}`);
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
      // Fetch marks
      const marksResponse = await axios.get(`http://localhost:5656/api/students/mark/view/${searchParentId}`);
      console.log('handleSearch marks response:', JSON.stringify(marksResponse.data, null, 2));
      const marksData = Array.isArray(marksResponse.data.data) ? marksResponse.data.data : [];

      // Fetch student to get name
      const studentResponse = await axios.get(`http://localhost:5656/api/students/view/${searchParentId}`);
      console.log('handleSearch student response:', JSON.stringify(studentResponse.data, null, 2));
      const student = studentResponse.data.data;

      // Combine data
      const combinedData = marksData.map(mark => ({
        ...mark,
        name: student?.name || 'N/A',
      }));

      console.log('Setting marks after search:', JSON.stringify(combinedData, null, 2));
      setMarks(combinedData);
      if (combinedData.length === 0) {
        setMessage(`No marks found for Parent ID: ${searchParentId}`);
      } else {
        setMessage(`Found ${combinedData.length} mark(s) for Parent ID: ${searchParentId}`);
      }
    } catch (error) {
      console.error('Error searching marks:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setMessage(`Error searching marks: ${error.response?.data?.error || error.message}`);
      setMarks([]);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDelete = (parentId) => {
    setSelectedMark(parentId);
    setModalAction('delete');
    setShowModal(true);
  };

  const handleUpdate = (mark) => {
    console.log('Preparing to update mark:', JSON.stringify(mark, null, 2));
    setSelectedMark(mark);
    setModalAction('update');
    setShowModal(true);
  };

  const confirmAction = async () => {
    try {
      if (modalAction === 'delete') {
        await axios.delete(`http://localhost:5656/api/students/mark/delete/${selectedMark}`);
        setMessage('Mark deleted successfully!');
      } else if (modalAction === 'update' && selectedMark) {
        const payload = {
          marks: [{ subject: selectedMark.subject, score: Number(selectedMark.score) }],
        };
        console.log('Updating mark with payload:', JSON.stringify(payload, null, 2));
        await axios.put(`http://localhost:5656/api/students/mark/update/${selectedMark.parentId}`, payload);
        setMessage('Mark updated successfully!');
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
    console.log('New mark added:', JSON.stringify(newMark, null, 2));
    setMessage('Mark added successfully!');
    fetchMarks();
    setShowAddModal(false);
    setAddParentId('');
    setTimeout(() => setMessage(''), 5000);
  };

  const handleAddClick = (parentId) => {
    console.log('handleAddClick with parentId:', parentId);
    setAddParentId(parentId);
    setShowAddModal(true);
  };

  return (
    <div className="container mt-4">
      <h2>Marks Management</h2>
      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`} role="alert">
          {message}
        </div>
      )}
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            setAddParentId('');
            setShowAddModal(true);
          }}
        >
          Add Mark
        </button>
      </div>
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
      <MarkList
        marks={marks}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        onAddClick={handleAddClick}
      />
      <MarkForm
        show={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddParentId('');
        }}
        onSuccess={handleAddSuccess}
        parentId={addParentId}
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