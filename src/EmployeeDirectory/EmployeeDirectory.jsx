import React, { useState, useEffect } from 'react';
import { db } from 'src/firebase';
import {
    collection,
    addDoc,
    setDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    limit
} from 'firebase/firestore';
import './styles.css';

function EmployeeDirectory() {
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({
        employeeId: '',
        name: '',
        position: '',
        department: '',
        contact: '',
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        const querySnapshot = await getDocs(collection(db, 'employees'));
        setEmployees(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };

    const handleInputChange = e => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        // Check if all the required fields are filled and not just spaces
        if (!form.name.trim() || !form.position.trim() || !form.department.trim() || !form.contact.trim()) {
            alert('All fields are required and cannot be just spaces.');
            return; // Stop the function if any field is empty or only spaces
        }

        // Proceed with the existing logic to create an employee
        const q = query(collection(db, "employees"), orderBy("id", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        let maxEmployeeId = 100; // Default starting ID if there are no employees yet

        if (!querySnapshot.empty) {
            const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            maxEmployeeId = lastVisible.data().id;
        }

        const newEmployeeId = maxEmployeeId + 1;

        // Create the employee data with the new ID
        const newEmployeeData = {
            id: newEmployeeId,
            name: form.name.trim(),
            position: form.position.trim(),
            department: form.department.trim(),
            contact: form.contact.trim(),
        };

        try {
            await setDoc(doc(db, "employees", newEmployeeId.toString()), newEmployeeData);

            fetchEmployees();
            setForm({ employeeId: '', name: '', position: '', department: '', contact: '' });
        } catch (error) {
            console.error("Error creating employee: ", error);
            alert('Error creating employee.');
        }
    };




    const handleRead = async e => {
        e.preventDefault();
        const employeeRef = doc(db, 'employees', form.employeeId);
        const docSnap = await getDoc(employeeRef);
        if (docSnap.exists()) {
            setForm({
                ...form,
                name: docSnap.data().name,
                position: docSnap.data().position,
                department: docSnap.data().department,
                contact: docSnap.data().contact,
            });
        } else {
            alert('No such employee!');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (form.employeeId) {
            const employeeRef = doc(db, 'employees', form.employeeId);
            const updates = {};

            // Only add fields to updates object if they have a value
            if (form.name) updates.name = form.name;
            if (form.position) updates.position = form.position;
            if (form.department) updates.department = form.department;
            if (form.contact) updates.contact = form.contact;

            // Update the employee with new data
            await updateDoc(employeeRef, updates);
            fetchEmployees();
            setForm({ employeeId: '', name: '', position: '', department: '', contact: '' });
        } else {
            alert('Please provide the employee ID to update.');
        }
    };

    const handleDelete = async e => {
        e.preventDefault();
        await deleteDoc(doc(db, 'employees', form.employeeId));
        fetchEmployees();
    };

    return (
        <div className="employee-directory">
            <h1>Employee Directory</h1>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Contact</th>
                </tr>
                </thead>
                <tbody>
                {employees.map(employee => (
                    <tr key={employee.id}>
                        <td>{employee.id}</td>
                        <td>{employee.name}</td>
                        <td>{employee.position}</td>
                        <td>{employee.department}</td>
                        <td>{employee.contact}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="form-container">
                <form>
                    <label htmlFor="employeeId">Employee ID:</label>
                    <input
                        type="text"
                        name="employeeId"
                        value={form.employeeId}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="position">Position:</label>
                    <input
                        type="text"
                        name="position"
                        value={form.position}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="department">Department:</label>
                    <input
                        type="text"
                        name="department"
                        value={form.department}
                        onChange={handleInputChange}
                    />

                    <label htmlFor="contact">Contact:</label>
                    <input
                        type="text"
                        name="contact"
                        value={form.contact}
                        onChange={handleInputChange}
                    />

                    <div className="buttons">
                        <button type="button" onClick={handleCreate}>Create</button>
                        <button type="button" onClick={handleRead}>Read</button>
                        <button type="button" onClick={handleUpdate}>Update</button>
                        <button type="button" onClick={handleDelete}>Delete</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EmployeeDirectory;