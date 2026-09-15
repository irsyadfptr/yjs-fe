"use client";
import { useEffect, useState } from 'react';

export default function CollabForm({ doc }) {
  const [formData, setFormData] = useState({ title: '', description: '' });

  useEffect(() => {
    if (!doc) return;

    // Get or create a Yjs Map for form fields
    const yForm = doc.getMap('form');

    const updateForm = () => {
      setFormData({
        title: yForm.get('title') || '',
        description: yForm.get('description') || ''
      });
    };

    // Listen for remote changes
    yForm.observe(updateForm);
    updateForm(); // Initial load

    return () => yForm.unobserve(updateForm);
  }, [doc]);

  const handleChange = (field, value) => {
    if (!doc) return;
    // Update local UI immediately for snappy feeling
    setFormData(prev => ({ ...prev, [field]: value }));
    // Broadcast to network
    doc.getMap('form').set(field, value);
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="font-semibold text-lg mb-4">Collaborative Form</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project Title</label>
          <input 
            className="border rounded-md px-3 py-2 w-full"
            value={formData.title} 
            onChange={(e) => handleChange('title', e.target.value)} 
            placeholder="Enter title..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea 
            className="border rounded-md px-3 py-2 w-full"
            value={formData.description} 
            onChange={(e) => handleChange('description', e.target.value)} 
            placeholder="Enter description..."
          />
        </div>
      </div>
    </div>
  );
}