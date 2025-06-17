'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';

// ============================================================================
// WORLD-CLASS ENGINEERING PROJECT CREATION FORM
// Designed specifically for engineers to showcase their work
// ============================================================================

interface ProjectFile {
  file: File;
  category: 'cad' | 'documentation' | 'image' | 'code' | 'simulation' | 'other';
  preview?: string;
}

interface FormData {
  title: string;
  description: string;
  readme: string;
  engineeringDiscipline: string;
  projectType: string;
  complexityLevel: string;
  tags: string[];
  technologies: string[];
  materials: string[];
  license: string;
  repositoryUrl: string;
  demoUrl: string;
  videoUrl: string;
  isPublic: boolean;
  files: ProjectFile[];
}

const ENGINEERING_DISCIPLINES = [
  { value: 'mechanical-engineering', label: 'Mechanical Engineering' },
  { value: 'electrical-engineering', label: 'Electrical Engineering' },
  { value: 'civil-engineering', label: 'Civil Engineering' },
  { value: 'aerospace-engineering', label: 'Aerospace Engineering' },
  { value: 'chemical-engineering', label: 'Chemical Engineering' },
  { value: 'biomedical-engineering', label: 'Biomedical Engineering' },
  { value: 'environmental-engineering', label: 'Environmental Engineering' },
  { value: 'software-engineering', label: 'Software Engineering' },
  { value: 'materials-engineering', label: 'Materials Engineering' },
  { value: 'robotics', label: 'Robotics & Automation' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'renewable-energy', label: 'Renewable Energy' },
];

const PROJECT_TYPES = [
  { value: 'design', label: 'Design Project' },
  { value: 'prototype', label: 'Prototype Development' },
  { value: 'analysis', label: 'Engineering Analysis' },
  { value: 'simulation', label: 'Simulation Study' },
  { value: 'manufacturing', label: 'Manufacturing Process' },
  { value: 'research', label: 'Research Project' },
  { value: 'testing', label: 'Testing & Validation' },
];

const COMPLEXITY_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Simple projects, educational content' },
  { value: 'intermediate', label: 'Intermediate', description: 'Standard engineering projects' },
  { value: 'advanced', label: 'Advanced', description: 'Complex systems, innovative solutions' },
  { value: 'expert', label: 'Expert', description: 'Cutting-edge research, industry-leading work' },
];

const COMMON_TECHNOLOGIES = [
  'SolidWorks', 'AutoCAD', 'Fusion 360', 'CATIA', 'Inventor',
  'ANSYS', 'MATLAB', 'Simulink', 'LabVIEW', 'Python',
  'Arduino', 'Raspberry Pi', 'PLC', 'SCADA', 'CAM',
  'FEA', 'CFD', 'CAE', 'PCB Design', 'Embedded Systems'
];

const COMMON_MATERIALS = [
  'Aluminum', 'Steel', 'Stainless Steel', 'Carbon Fiber', 'Titanium',
  'ABS Plastic', 'PLA', 'PETG', 'Nylon', 'Polycarbonate',
  'Copper', 'Brass', 'Silicon', 'Composite Materials', 'Ceramics'
];

function categorizeFile(file: File): 'cad' | 'documentation' | 'image' | 'code' | 'simulation' | 'other' {
  const extension = file.name.toLowerCase().split('.').pop() || '';
  const type = file.type.toLowerCase();

  // CAD files
  if (['stl', 'step', 'stp', 'iges', 'igs', 'dwg', 'dxf'].includes(extension) ||
      type.includes('step') || type.includes('dwg') || type.includes('dxf')) {
    return 'cad';
  }

  // Documentation
  if (['pdf', 'doc', 'docx', 'md', 'txt'].includes(extension) ||
      type.includes('pdf') || type.includes('document') || type.includes('text')) {
    return 'documentation';
  }

  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'tiff'].includes(extension) ||
      type.includes('image')) {
    return 'image';
  }

  // Code
  if (['ino', 'cpp', 'c', 'h', 'py', 'js', 'ts', 'm', 'json'].includes(extension) ||
      type.includes('javascript') || type.includes('python')) {
    return 'code';
  }

  // Simulation
  if (['csv', 'xlsx', 'dat', 'inp'].includes(extension) ||
      type.includes('spreadsheet') || type.includes('csv')) {
    return 'simulation';
  }

  return 'other';
}

export default function EngineeringProjectForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    readme: '',
    engineeringDiscipline: '',
    projectType: 'design',
    complexityLevel: 'intermediate',
    tags: [],
    technologies: [],
    materials: [],
    license: 'MIT',
    repositoryUrl: '',
    demoUrl: '',
    videoUrl: '',
    isPublic: true,
    files: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [technologyInput, setTechnologyInput] = useState('');
  const [materialInput, setMaterialInput] = useState('');

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: ProjectFile[] = acceptedFiles.map(file => ({
      file,
      category: categorizeFile(file),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles].slice(0, 20), // Max 20 files
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md'],
      'application/*': ['.step', '.stp', '.iges', '.igs', '.dwg', '.dxf', '.stl'],
      'model/*': ['.step', '.stl'],
    },
    maxFiles: 20,
    maxSize: 500 * 1024 * 1024, // 500MB per file
  });

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const addTechnology = (tech: string) => {
    if (tech && !formData.technologies.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech],
      }));
    }
  };

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech),
    }));
  };

  const addMaterial = (material: string) => {
    if (material && !formData.materials.includes(material)) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, material],
      }));
    }
  };

  const removeMaterial = (material: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m !== material),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a project title.');
      return;
    }

    if (formData.files.length === 0) {
      alert('Please upload at least one file.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      formDataObj.set('title', formData.title.trim());
      formDataObj.set('description', formData.description.trim());
      formDataObj.set('readme', formData.readme.trim());
      formDataObj.set('engineeringDiscipline', formData.engineeringDiscipline);
      formDataObj.set('projectType', formData.projectType);
      formDataObj.set('complexityLevel', formData.complexityLevel);
      formDataObj.set('tags', JSON.stringify(formData.tags));
      formDataObj.set('technologies', JSON.stringify(formData.technologies));
      formDataObj.set('materials', JSON.stringify(formData.materials));
      formDataObj.set('license', formData.license);
      formDataObj.set('repositoryUrl', formData.repositoryUrl.trim());
      formDataObj.set('demoUrl', formData.demoUrl.trim());
      formDataObj.set('videoUrl', formData.videoUrl.trim());
      formDataObj.set('public', formData.isPublic ? 'true' : 'false');

      formData.files.forEach(({ file }) => {
        formDataObj.append('files', file);
      });

      console.log('🚀 Submitting engineering project...');

      const response = await fetch('/api/projects/create', {
        method: 'POST',
        body: formDataObj,
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        console.log('✅ Project created successfully!', responseData.project);
        alert(`🎉 Engineering project "${formData.title}" created successfully!`);
        router.push(`/projects`);
      } else {
        throw new Error(responseData.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('❌ Error creating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cad': return '🔧';
      case 'documentation': return '📄';
      case 'image': return '🖼️';
      case 'code': return '💻';
      case 'simulation': return '📊';
      default: return '📁';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cad': return 'bg-blue-100 text-blue-800';
      case 'documentation': return 'bg-green-100 text-green-800';
      case 'image': return 'bg-purple-100 text-purple-800';
      case 'code': return 'bg-yellow-100 text-yellow-800';
      case 'simulation': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Showcase Your Engineering Project
        </h1>
        <p className="text-gray-600">
          Share your engineering work with the community. Upload CAD files, documentation, images, and more.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📋 Project Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Arduino-Based Weather Monitoring System"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engineering Discipline
              </label>
              <select
                value={formData.engineeringDiscipline}
                onChange={(e) => setFormData(prev => ({ ...prev, engineeringDiscipline: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select discipline</option>
                {ENGINEERING_DISCIPLINES.map(discipline => (
                  <option key={discipline.value} value={discipline.value}>
                    {discipline.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Type
              </label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData(prev => ({ ...prev, projectType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROJECT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your engineering project, its purpose, and key features..."
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📁 Project Files</h2>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-4xl mb-4">📤</div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragActive ? 'Drop your files here!' : 'Upload Engineering Files'}
            </p>
            <p className="text-sm text-gray-500">
              CAD files, documentation, images, code, simulation data
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Max 20 files, 500MB each • Supports: STL, STEP, DWG, PDF, images, code files
            </p>
          </div>

          {formData.files.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-3">Uploaded Files ({formData.files.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.files.map((projectFile, index) => (
                  <div key={index} className="flex items-center p-3 bg-white rounded border">
                    <div className="flex-shrink-0 mr-3">
                      <span className="text-2xl">{getCategoryIcon(projectFile.category)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {projectFile.file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(projectFile.category)}`}>
                          {projectFile.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(projectFile.file.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0 ml-2 text-red-500 hover:text-red-700"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Technical Details */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🔧 Technical Details</h2>
          
          <div className="space-y-6">
            {/* Technologies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technologies Used
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.technologies.map(tech => (
                  <span key={tech} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={technologyInput}
                  onChange={(e) => setTechnologyInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTechnology(technologyInput.trim());
                      setTechnologyInput('');
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add technology (press Enter)"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {COMMON_TECHNOLOGIES.map(tech => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => addTechnology(tech)}
                    className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    + {tech}
                  </button>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materials Used
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.materials.map(material => (
                  <span key={material} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {material}
                    <button
                      type="button"
                      onClick={() => removeMaterial(material)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={materialInput}
                  onChange={(e) => setMaterialInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addMaterial(materialInput.trim());
                      setMaterialInput('');
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add material (press Enter)"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {COMMON_MATERIALS.map(material => (
                  <button
                    key={material}
                    type="button"
                    onClick={() => addMaterial(material)}
                    className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    + {material}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(tagInput.trim());
                    setTagInput('');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add tags (press Enter)"
              />
            </div>
          </div>
        </div>

        {/* Project Settings */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">⚙️ Project Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complexity Level
              </label>
              <select
                value={formData.complexityLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, complexityLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COMPLEXITY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License
              </label>
              <select
                value={formData.license}
                onChange={(e) => setFormData(prev => ({ ...prev, license: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MIT">MIT License</option>
                <option value="Apache-2.0">Apache 2.0</option>
                <option value="GPL-3.0">GPL 3.0</option>
                <option value="Creative Commons">Creative Commons</option>
                <option value="Proprietary">Proprietary</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Make this project public (visible to everyone)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || formData.files.length === 0}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '🚀 Creating Project...' : '🎉 Publish Project'}
          </button>
        </div>
      </form>
    </div>
  );
} 