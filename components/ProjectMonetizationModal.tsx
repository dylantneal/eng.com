'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DollarSign,
  Package,
  Shield,
  Lock,
  FileText,
  Users,
  Star,
  CheckCircle,
  AlertCircle,
  X,
  ArrowRight,
  Zap,
  Crown
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  files: any[];
  owner_id: string;
  image_url?: string;
  discipline?: string;
  repository_url?: string;
  license?: string;
}

interface MonetizationData {
  title: string;
  description: string;
  category: 'design' | 'kit' | 'service' | 'tutorial';
  pricing: {
    personal: number;
    commercial: number;
    extended: number;
  };
  license_types: string[];
  drm_protected: boolean;
  escrow_eligible: boolean;
  access_control: 'instant' | 'manual_review' | 'subscription_only';
  metadata: {
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    estimated_time?: number;
    tools_required: string[];
    materials: string[];
    assembly_required: boolean;
  };
}

interface ProjectMonetizationModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (marketplaceId: string) => void;
}

export default function ProjectMonetizationModal({
  project,
  isOpen,
  onClose,
  onSuccess
}: ProjectMonetizationModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MonetizationData>({
    title: project.title,
    description: project.description,
    category: 'design',
    pricing: {
      personal: 999, // $9.99
      commercial: 2999, // $29.99
      extended: 9999 // $99.99
    },
    license_types: ['personal', 'commercial'],
    drm_protected: true,
    escrow_eligible: true,
    access_control: 'instant',
    metadata: {
      difficulty_level: 'intermediate',
      estimated_time: 2,
      tools_required: [],
      materials: [],
      assembly_required: false
    }
  });

  const categories = [
    { 
      id: 'design', 
      label: 'CAD Files & Designs', 
      icon: FileText,
      description: 'Digital design files, CAD models, schematics'
    },
    { 
      id: 'kit', 
      label: 'Hardware Kits', 
      icon: Package,
      description: 'Physical products and component bundles'
    },
    { 
      id: 'service', 
      label: 'Engineering Services', 
      icon: Users,
      description: 'Professional consulting and custom work'
    },
    { 
      id: 'tutorial', 
      label: 'Courses & Tutorials', 
      icon: Star,
      description: 'Educational content and learning materials'
    }
  ];

  const licenseTypes = [
    {
      id: 'personal',
      name: 'Personal License',
      description: 'For personal, non-commercial use only',
      features: ['Personal projects', 'Learning & education', 'Non-commercial prototypes'],
      multiplier: 1,
      recommended: true
    },
    {
      id: 'commercial',
      name: 'Commercial License',
      description: 'For business and commercial use',
      features: ['Commercial products', 'Client projects', 'Business applications'],
      multiplier: 3,
      recommended: true
    },
    {
      id: 'extended',
      name: 'Extended License',
      description: 'Full rights including resale and distribution',
      features: ['Resale rights', 'Distribution rights', 'Modify and redistribute'],
      multiplier: 10,
      recommended: false
    }
  ];

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects/monetize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.id,
          monetization_data: data
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to monetize project');
      }

      const result = await response.json();
      onSuccess(result.marketplace_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateData = (updates: Partial<MonetizationData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const toggleLicenseType = (licenseId: string) => {
    setData(prev => ({
      ...prev,
      license_types: prev.license_types.includes(licenseId)
        ? prev.license_types.filter(id => id !== licenseId)
        : [...prev.license_types, licenseId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Monetize Project</h2>
            <p className="text-gray-600">Convert "{project.title}" to a marketplace listing</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > num ? <CheckCircle className="w-5 h-5" /> : num}
                </div>
                {num < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Step {step} of 3: {
              step === 1 ? 'Category & Basic Info' :
              step === 2 ? 'Pricing & Licensing' :
              'Review & Publish'
            }
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Category & Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => updateData({ category: category.id as any })}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          data.category === category.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <Icon className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="font-medium text-gray-900">{category.label}</span>
                        </div>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => updateData({ title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Product title for marketplace"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={data.metadata.difficulty_level}
                    onChange={(e) => updateData({
                      metadata: {
                        ...data.metadata,
                        difficulty_level: e.target.value as any
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) => updateData({ description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed description for potential buyers..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Licensing */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">License Types & Pricing</h3>
                <div className="grid gap-4">
                  {licenseTypes.map((license) => (
                    <div
                      key={license.id}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        data.license_types.includes(license.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              checked={data.license_types.includes(license.id)}
                              onChange={() => toggleLicenseType(license.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="ml-3 font-medium text-gray-900">
                              {license.name}
                              {license.recommended && (
                                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  Recommended
                                </span>
                              )}
                            </label>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{license.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {license.features.map((feature, index) => (
                              <span key={index} className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-lg font-bold">
                            ${(data.pricing.personal * license.multiplier / 100).toFixed(2)}
                          </div>
                          {license.multiplier > 1 && (
                            <div className="text-xs text-gray-500">{license.multiplier}x base price</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal License Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={data.pricing.personal / 100}
                      onChange={(e) => updateData({
                        pricing: { ...data.pricing, personal: Math.round(parseFloat(e.target.value) * 100) }
                      })}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commercial (3x)
                  </label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                    ${(data.pricing.personal * 3 / 100).toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extended (10x)
                  </label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                    ${(data.pricing.personal * 10 / 100).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Crown className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-800">Security & Protection</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.drm_protected}
                      onChange={(e) => updateData({ drm_protected: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Lock className="w-4 h-4 text-purple-600 ml-2 mr-1" />
                    <span className="text-sm text-blue-700">DRM Protection</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.escrow_eligible}
                      onChange={(e) => updateData({ escrow_eligible: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Shield className="w-4 h-4 text-green-600 ml-2 mr-1" />
                    <span className="text-sm text-blue-700">Escrow Protection</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Publish */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Review & Publish</h3>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Listing Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Title:</span>
                    <span className="ml-2 font-medium">{data.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium capitalize">{data.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">License Types:</span>
                    <span className="ml-2 font-medium">{data.license_types.length} selected</span>
                  </div>
                  <div>
                    <span className="text-gray-600">DRM Protected:</span>
                    <span className="ml-2 font-medium">{data.drm_protected ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <span className="text-gray-600">Price Range:</span>
                  <span className="ml-2 font-medium">
                    ${(data.pricing.personal / 100).toFixed(2)} - 
                    ${(data.pricing.personal * 10 / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800">{error}</span>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Zap className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-800">What happens next?</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Your project will be converted to a marketplace listing</p>
                  <p>• Original project remains accessible to collaborators</p>
                  <p>• Buyers will purchase licenses according to your pricing</p>
                  <p>• You'll receive 95% of the sale price (5% platform fee)</p>
                  <p>• Analytics and sales tracking available in seller dashboard</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Publish to Marketplace
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 