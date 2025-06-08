'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModernFileUpload from '@/components/ModernFileUpload';
import ModernMarkdownEditor from '@/components/ModernMarkdownEditor';

interface ModernProjectFormProps {
  userPlan: string;
  currentProjectCount: number;
  userHandle: string | null;
}

export default function ModernProjectForm({ userPlan, currentProjectCount, userHandle }: ModernProjectFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    readme: '',
    isPublic: true,
    files: [] as File[]
  });

  const maxProjects = userPlan === 'PRO' ? Infinity : 5;
  const canCreateProject = currentProjectCount < maxProjects;

  const steps = [
    { id: 1, name: 'Project Details', description: 'Basic information about your project' },
    { id: 2, name: 'Upload Files', description: 'Add your CAD files, documentation, etc.' },
    { id: 3, name: 'Documentation', description: 'Write a README for your project' },
    { id: 4, name: 'Publish', description: 'Review and publish your project' }
  ];

  const handleSubmit = async () => {
    if (!canCreateProject) {
      alert('You have reached the project limit for your plan. Upgrade to Pro for unlimited projects.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.set('title', formData.title);
      formDataObj.set('description', formData.description);
      formDataObj.set('readme', formData.readme);
      formDataObj.set('public', formData.isPublic ? 'true' : '');
      
      formData.files.forEach(file => {
        formDataObj.append('files', file);
      });

      const response = await fetch('/api/projects/create', {
        method: 'POST',
        body: formDataObj
      });

      if (response.ok) {
        const { project } = await response.json();
        router.push(`/projects/${project.slug}`);
      } else {
        throw new Error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Autonomous Robot Arm, Custom PCB Design..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your project (optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-blue-500 mt-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Plan Status</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {userPlan === 'PRO' ? (
                      `Pro Plan: Unlimited projects (${currentProjectCount} created)`
                    ) : (
                      `Free Plan: ${currentProjectCount}/${maxProjects} projects used`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <ModernFileUpload
              files={formData.files}
              onFilesChange={(files) => setFormData(prev => ({ ...prev, files }))}
              userPlan={userPlan}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <ModernMarkdownEditor
              value={formData.readme}
              onChange={(value) => setFormData(prev => ({ ...prev, readme: value }))}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Project Preview */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Preview</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Title:</span>
                  <p className="text-gray-900">{formData.title || 'Untitled Project'}</p>
                </div>
                
                {formData.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Description:</span>
                    <p className="text-gray-900">{formData.description}</p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-500">Files:</span>
                  <p className="text-gray-900">{formData.files.length} file(s) uploaded</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">Visibility:</span>
                  <p className="text-gray-900">{formData.isPublic ? 'Public' : 'Private'}</p>
                </div>
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-base font-semibold text-gray-900 mb-4">Visibility Settings</h4>
              
              <div className="space-y-3">
                <label className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.isPublic}
                    onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Public Project</div>
                    <div className="text-sm text-gray-500">
                      Anyone can view and comment on this project
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!formData.isPublic}
                    onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                    disabled={userPlan !== 'PRO'}
                  />
                  <div>
                    <div className={`font-medium ${userPlan !== 'PRO' ? 'text-gray-400' : 'text-gray-900'}`}>
                      Private Project {userPlan !== 'PRO' && '(Pro Only)'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Only you can view this project
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-500'
              }`}>
                {currentStep > step.id ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-3 hidden md:block">
                <div className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 ml-4 mr-4 h-0.5 bg-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                disabled={currentStep === 1 && !formData.title.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !canCreateProject || !formData.title.trim()}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Project'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 