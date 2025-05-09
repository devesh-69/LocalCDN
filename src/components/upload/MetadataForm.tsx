'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface MetadataFormProps {
  onMetadataChange: (metadata: {
    title: string;
    description: string;
    tags: string[];
    isPublic: boolean;
  }) => void;
  initialMetadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
  };
}

const MetadataForm: React.FC<MetadataFormProps> = ({
  onMetadataChange,
  initialMetadata = {},
}) => {
  const [title, setTitle] = useState(initialMetadata.title || '');
  const [description, setDescription] = useState(initialMetadata.description || '');
  const [tags, setTags] = useState<string[]>(initialMetadata.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(initialMetadata.isPublic || false);

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      setTagInput('');
      
      // Notify parent of the change
      onMetadataChange({
        title,
        description,
        tags: newTags,
        isPublic,
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    
    // Notify parent of the change
    onMetadataChange({
      title,
      description,
      tags: newTags,
      isPublic,
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onMetadataChange({
      title: e.target.value,
      description,
      tags,
      isPublic,
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    onMetadataChange({
      title,
      description: e.target.value,
      tags,
      isPublic,
    });
  };

  const handlePublicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPublic(e.target.checked);
    onMetadataChange({
      title,
      description,
      tags,
      isPublic: e.target.checked,
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      addTag(tagInput.trim());
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={handleTitleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                   shadow-sm focus:outline-none focus:ring-1 focus:ring-primary 
                   focus:border-primary dark:bg-gray-900"
          placeholder="Image title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={handleDescriptionChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
                   shadow-sm focus:outline-none focus:ring-1 focus:ring-primary 
                   focus:border-primary dark:bg-gray-900"
          placeholder="Image description (optional)"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium mb-1">
          Tags
        </label>
        <div className="flex">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md 
                     shadow-sm focus:outline-none focus:ring-1 focus:ring-primary 
                     focus:border-primary dark:bg-gray-900"
            placeholder="Add tags (press Enter)"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-3 py-2 bg-primary text-white rounded-r-md hover:bg-primary/90"
            aria-label="Add tag"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs 
                         bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={handlePublicChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="isPublic" className="ml-2 block text-sm">
          Make this image public
        </label>
      </div>
    </div>
  );
};

export default MetadataForm; 