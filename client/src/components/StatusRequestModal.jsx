import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import './StatusRequestModal.css';

const StatusRequestModal = ({ task, onSubmit, onClose }) => {
    const [requestedStatus, setRequestedStatus] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const statusOptions = ['To Do', 'In Progress', 'Done'].filter(s => s !== task.status);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!requestedStatus || !reason.trim()) {
            setError('Please select a status and provide a reason');
            return;
        }

        if (reason.trim().length < 10) {
            setError('Reason must be at least 10 characters');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            await onSubmit({
                taskId: task._id,
                requestedStatus,
                reason: reason.trim()
            });

            setSuccess('Status change request submitted successfully!');
            
            // Close after showing success
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Status request error:', err);
            
            // Better error handling
            let errorMessage = 'Failed to submit request';
            
            if (err.response) {
                // Server responded with error
                errorMessage = err.response.data?.error || err.response.data?.message || errorMessage;
            } else if (err.request) {
                // Request was made but no response
                errorMessage = 'Server is not responding. Please check if the server is running.';
            } else {
                // Something else happened
                errorMessage = err.message || errorMessage;
            }
            
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content status-request-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Request Status Change</h2>
                    <button onClick={onClose} className="close-button" type="button">
                        <X size={24}/>
                    </button>
                </div>

                <div className="task-info-card">
                    <h3>{task.title}</h3>
                    <div className="info-row">
                        <span className="label">Current Status:</span>
                        <span className={`status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>
                            {task.status}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="label">Project:</span>
                        <span>{task.project?.name || 'N/A'}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="requestedStatus">
                            New Status * 
                            <span className="hint">Select the status you want to change to</span>
                        </label>
                        <select
                            id="requestedStatus"
                            value={requestedStatus}
                            onChange={(e) => setRequestedStatus(e.target.value)}
                            required
                        >
                            <option value="">-- Select New Status --</option>
                            {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reason">
                            Reason for Change * 
                            <span className="hint">Explain why this status change is needed (min 10 characters)</span>
                        </label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="E.g., All development work completed and tested locally. Ready for code review and deployment."
                            rows="5"
                            required
                        />
                        <div className="char-count">{reason.length} characters</div>
                    </div>

                    <div className="info-box">
                        <AlertCircle size={18} />
                        <p>Your manager will review this request and approve or reject it. You'll receive a notification when they respond.</p>
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={isSubmitting || !requestedStatus || !reason.trim()}
                        >
                            {isSubmitting ? (
                                <div className="spinner"></div>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Submit Request
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StatusRequestModal;
