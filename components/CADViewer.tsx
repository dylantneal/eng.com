'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
// Temporarily commenting out Three.js imports to fix server startup
// import { Canvas, useLoader, useFrame } from '@react-three/fiber';
// import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
// import { OrbitControls, PerspectiveCamera, Environment, Grid } from '@react-three/drei';
import { ProcessingResult } from '@/lib/cad-processor';
// import * as THREE from 'three';

interface CADViewerProps {
  processingResult: ProcessingResult;
  onMeasurement?: (measurement: Measurement) => void;
  className?: string;
}

interface Measurement {
  type: 'distance' | 'area' | 'volume';
  value: number;
  unit: string;
  points?: any[]; // Simplified for testing
}

export default function CADViewer({ processingResult, onMeasurement, className }: CADViewerProps) {
  const [viewerMode, setViewerMode] = useState<'3D' | '2D' | 'PCB'>('3D');
  const [showWireframe, setShowWireframe] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('default');
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get the primary viewer type from processing result
  useEffect(() => {
    const primaryViewer = processingResult.viewers[0];
    if (primaryViewer) {
      setViewerMode(primaryViewer.type);
    }
  }, [processingResult]);

  // Render different viewers based on file type
  const renderViewer = () => {
    switch (viewerMode) {
      case '3D':
        return <ThreeDViewer 
          processingResult={processingResult}
          showWireframe={showWireframe}
          showMeasurements={showMeasurements}
          selectedMaterial={selectedMaterial}
          onMeasurement={handleMeasurement}
        />;
      case '2D':
        return <TwoDViewer 
          processingResult={processingResult}
          showMeasurements={showMeasurements}
          onMeasurement={handleMeasurement}
        />;
      case 'PCB':
        return <PCBViewer 
          processingResult={processingResult}
          showMeasurements={showMeasurements}
          onMeasurement={handleMeasurement}
        />;
      default:
        return <div className="text-center text-gray-500">Unsupported file type</div>;
    }
  };

  const handleMeasurement = (measurement: Measurement) => {
    setMeasurements(prev => [...prev, measurement]);
    onMeasurement?.(measurement);
  };

  const materials = [
    { id: 'default', name: 'Default', color: '#808080' },
    { id: 'aluminum', name: 'Aluminum', color: '#C0C0C0' },
    { id: 'steel', name: 'Steel', color: '#404040' },
    { id: 'plastic', name: 'Plastic', color: '#4CAF50' },
    { id: 'copper', name: 'Copper', color: '#B87333' },
    { id: 'gold', name: 'Gold', color: '#FFD700' },
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Viewer Controls */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* File Info */}
            <div>
              <h3 className="font-medium text-gray-900">{processingResult.originalFile.name}</h3>
              <p className="text-sm text-gray-500">
                {processingResult.originalFile.format} • {(processingResult.originalFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            
            {/* Processing Status */}
            {processingResult.processing.status !== 'COMPLETED' && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-blue-600">
                  Processing... {processingResult.processing.progress}%
                </span>
              </div>
            )}
          </div>

          {/* Viewer Mode Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {processingResult.viewers.map((viewer) => (
              <button
                key={viewer.type}
                onClick={() => setViewerMode(viewer.type)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewerMode === viewer.type
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {viewer.type} View
              </button>
            ))}
          </div>
        </div>

        {/* Tool Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Wireframe Toggle */}
            {viewerMode === '3D' && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showWireframe}
                  onChange={(e) => setShowWireframe(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Wireframe</span>
              </label>
            )}

            {/* Measurements Toggle */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showMeasurements}
                onChange={(e) => setShowMeasurements(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Measurements</span>
            </label>

            {/* Material Selector */}
            {viewerMode === '3D' && (
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Metadata Display */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {processingResult.metadata.dimensions && (
              <span>
                {processingResult.metadata.dimensions.width.toFixed(1)} × {' '}
                {processingResult.metadata.dimensions.height.toFixed(1)} × {' '}
                {processingResult.metadata.dimensions.depth?.toFixed(1)} {processingResult.metadata.units}
              </span>
            )}
            {processingResult.metadata.triangles && (
              <span>{processingResult.metadata.triangles.toLocaleString()} triangles</span>
            )}
            {processingResult.metadata.layers && (
              <span>{processingResult.metadata.layers} layers</span>
            )}
          </div>
        </div>
      </div>

      {/* Viewer Content */}
      <div className="relative h-96 bg-gray-50">
        {renderViewer()}
        
        {/* Measurements Overlay */}
        {measurements.length > 0 && (
          <div className="absolute top-4 left-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg max-w-xs">
            <h4 className="font-medium text-gray-900 mb-2">Measurements</h4>
            <div className="space-y-1">
              {measurements.map((measurement, index) => (
                <div key={index} className="text-sm text-gray-600">
                  {measurement.type}: {measurement.value.toFixed(2)} {measurement.unit}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 3D Viewer Component (Simplified for testing)
function ThreeDViewer({ 
  processingResult, 
  showWireframe, 
  showMeasurements, 
  selectedMaterial, 
  onMeasurement 
}: {
  processingResult: ProcessingResult;
  showWireframe: boolean;
  showMeasurements: boolean;
  selectedMaterial: string;
  onMeasurement: (measurement: Measurement) => void;
}) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">3D CAD Viewer</h3>
        <p className="text-gray-500 mt-2">
          Advanced 3D model viewer with measurement tools
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Format: {processingResult.originalFile.format} • Material: {selectedMaterial}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Wireframe: {showWireframe ? 'On' : 'Off'} • Measurements: {showMeasurements ? 'On' : 'Off'}
        </p>
      </div>
    </div>
  );
}

// STL Model Component (Removed for testing - Three.js causing startup issues)

// 2D Viewer Component
function TwoDViewer({ 
  processingResult, 
  showMeasurements, 
  onMeasurement 
}: {
  processingResult: ProcessingResult;
  showMeasurements: boolean;
  onMeasurement: (measurement: Measurement) => void;
}) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">2D CAD Viewer</h3>
        <p className="text-gray-500 mt-2">
          2D drawing viewer with layer support and dimensional analysis
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Format: {processingResult.originalFile.format}
        </p>
      </div>
    </div>
  );
}

// PCB Viewer Component
function PCBViewer({ 
  processingResult, 
  showMeasurements, 
  onMeasurement 
}: {
  processingResult: ProcessingResult;
  showMeasurements: boolean;
  onMeasurement: (measurement: Measurement) => void;
}) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-green-900">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white">PCB Viewer</h3>
        <p className="text-green-200 mt-2">
          Circuit board viewer with layer support and component analysis
        </p>
        <p className="text-sm text-green-300 mt-2">
          Format: {processingResult.originalFile.format}
        </p>
      </div>
    </div>
  );
}

// Loading Indicator
function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-500">Loading 3D model...</p>
      </div>
    </div>
  );
} 