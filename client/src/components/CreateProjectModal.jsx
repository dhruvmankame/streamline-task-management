
import React, { useState, useEffect } from 'react';
import { createProject, getTeamMembers } from '../services/api.js';
import './CreateProjectModal.css';

const CreateProjectModal = ({ projects, setProjects, setShowModal }) => {
    const [team, setTeam] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        getTeamMembers()
          .then(res => setTeam(res.data))
          .catch(err => console.error("Could not fetch team members", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const selectedMembers = Array.from(e.target.members.selectedOptions, option => option.value);
        const tags = e.target.tags.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        const newProject = {
            name: e.target.name.value,
            description: e.target.description.value,
            priority: e.target.priority.value,
            deadline: e.target.deadline.value,
            tags: tags,
            members: selectedMembers
        };
        
        try {
            const { data } = await createProject(newProject);
            // Add the newly created project to the top of the list
            setProjects([data, ...projects]);
            setShowModal(false);
        } catch (err) {
            console.error("Failed to create project", err);
            setError("Error: Could not create project.");
        }
    };

    return (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2 className="modal-title">Create New Project</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Project Name</label>
                            <input name="name" placeholder="e.g., Q4 Marketing Campaign" required />
                        </div>
                        
                        <div className="input-group">
                            <label>Priority</label>
                            <select name="priority" required>
                                <option value="Low">Low</option>
                                <option value="Medium" selected>Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-grid">
                        <div className="input-group form-grid-full">
                            <label>Description</label>
                            <textarea name="description" placeholder="A brief description of the project goals." rows="3"></textarea>
                        </div>
                    </div>
                    
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Assign Team</label>
                            <select name="members" multiple required>
                                {team.map(member => (
                                    <option key={member._id} value={member._id}>
                                        {member.name} ({member.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="input-group">
                            <label>Deadline</label>
                            <input 
                                type="date" 
                                name="deadline" 
                                required 
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>
                    
                    <div className="form-grid">
                        <div className="input-group form-grid-full">
                            <label>Tags (comma-separated)</label>
                            <input 
                                name="tags" 
                                placeholder="web, react, nodejs, ecommerce" 
                            />
                        </div>
                    </div>
                    
                    {error && <p className="error-message">{error}</p>}
                    
                    <div className="modal-actions">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;