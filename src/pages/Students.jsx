import { useState, useEffect } from 'react';
import axios from 'axios';
import StudentList from '../components/StudentList.jsx';
import StudentForm from '../components/StudentForm.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';

function Students() {
  const [students, setStudents] = useState([]);
  const [searchParentId, setSearchParentId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5656/api/students/viewall');
      console.log('fetchStudents response:', response.data);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      console.log('Setting students:', data);
      setStudents(data);
      if (data.length === 0) {
        setMessage('No students found in the database.');
      } else {
        setMessage('');
      }
    } catch (error) {
      console.error('Error fetching students:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setMessage(`Error fetching students: ${error.response?.data?.error || error.message}`);
      setStudents([]);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = async () => {
    if (!searchParentId) {
      fetchStudents();
      setMessage('');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5656/api/students/view/${searchParentId}`);
      console.log('handleSearch response:', response.data);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      console.log('Setting students after search:', data);
      setStudents(data);
      if (data.length === 0) {
        setMessage(`No student found for Parent ID: ${searchParentId}`);
      } else {
        setMessage(`Found ${data.length} student(s) for Parent ID: ${searchParentId}`);
      }
    } catch (error) {
      console.error('Error searching student:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setStudents([]);
      setMessage(`Error searching student: ${error.response?.data?.error || error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDelete = (parentId) => {
    setSelectedStudent(parentId);
    setModalAction('delete');
    setShowModal(true);
  };

  const handleUpdate = (student) => {
    console.log('Preparing to update student:', student);
    setSelectedStudent(student);
    setModalAction('update');
    setShowModal(true);
  };

  const confirmAction = async () => {
    try {
      if (modalAction === 'delete') {
        await axios.delete(`http://localhost:5656/api/students/delete/${selectedStudent}`);
        setMessage('Student deleted successfully');
      } else if (modalAction === 'update' && selectedStudent) {
        const payload = {
          name: selectedStudent.name,
          email: selectedStudent.email,
          age: Number(selectedStudent.age),
          parentId: selectedStudent.parentId,
        };
        console.log('Updating student with payload:', payload);
        await axios.put(`http://localhost:5656/api/students/update/${selectedStudent.parentId}`, payload);
        setMessage('Student updated successfully');
      }
      fetchStudents();
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

  const handleAddSuccess = (newStudent) => {
    console.log('New student added:', newStudent);
    setMessage('Student added successfully');
    fetchStudents();
    setShowAddModal(false);
    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div>
      <h2>Students</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add Student
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
      <StudentList students={students} onDelete={handleDelete} onUpdate={handleUpdate} />
      <StudentForm
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

export default Students;