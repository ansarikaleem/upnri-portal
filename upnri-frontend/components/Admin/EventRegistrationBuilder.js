// components/Admin/EventRegistrationBuilder.js
import React, { useState } from 'react';

const fieldTypes = [
  { type: 'text', label: 'Text Input', icon: '📝' },
  { type: 'email', label: 'Email', icon: '📧' },
  { type: 'tel', label: 'Phone', icon: '📱' },
  { type: 'number', label: 'Number', icon: '🔢' },
  { type: 'select', label: 'Dropdown', icon: '📋' },
  { type: 'textarea', label: 'Text Area', icon: '📄' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑️' }
];

export default function EventRegistrationBuilder({ fields, onChange }) {
  const [activeField, setActiveField] = useState(null);

  const addField = (fieldType) => {
    const newField = {
      id: Date.now().toString(),
      type: fieldType,
      label: '',
      required: false,
      placeholder: '',
      options: fieldType === 'select' ? [''] : []
    };
    onChange([...fields, newField]);
  };

  const updateField = (id, updates) => {
    const updatedFields = fields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    );
    onChange(updatedFields);
  };

  const removeField = (id) => {
    onChange(fields.filter(field => field.id !== id));
  };

  const moveField = (fromIndex, toIndex) => {
    const newFields = [...fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    onChange(newFields);
  };

  return (
    <div className="space-y-6">
      {/* Available Fields */}
      <div>
        <h3 className="text-lg font-medium mb-4">Available Fields</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {fieldTypes.map(fieldType => (
            <button
              key={fieldType.type}
              onClick={() => addField(fieldType.type)}
              className="p-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-1">{fieldType.icon}</div>
              <div className="text-sm text-gray-700">{fieldType.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Form Preview */}
      <div>
        <h3 className="text-lg font-medium mb-4">Registration Form Preview</h3>
        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 min-h-[200px]">
          {fields.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Drag and drop fields from above to build your form
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={`p-4 bg-white border rounded-lg cursor-move ${
                    activeField === field.id ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-300'
                  }`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', index);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    moveField(fromIndex, index);
                  }}
                  onClick={() => setActiveField(field.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm text-gray-500 capitalize">{field.type} Field</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeField(field.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Field label"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />

                    {field.type !== 'checkbox' && (
                      <input
                        type="text"
                        value={field.placeholder}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="Placeholder text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    )}

                    {field.type === 'select' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Options</label>
                        {field.options.map((option, optionIndex) => (
                          <input
                            key={optionIndex}
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...field.options];
                              newOptions[optionIndex] = e.target.value;
                              updateField(field.id, { options: newOptions });
                            }}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="w-full border border-gray-300 rounded px-3 py-1 text-sm mb-1"
                          />
                        ))}
                        <button
                          type="button"
                          onClick={() => updateField(field.id, { options: [...field.options, ''] })}
                          className="text-primary-600 text-sm hover:text-primary-700"
                        >
                          + Add Option
                        </button>
                      </div>
                    )}

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Required field</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}