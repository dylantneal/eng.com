'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move3D, 
  Eye, 
  EyeOff, 
  Layers,
  Download,
  Share2,
  Maximize2
} from 'lucide-react';

interface CADViewerProps {
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  width?: string;
  height?: string;
  showControls?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

interface ModelProps {
  url: string;
  fileType: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

function Model({ url, fileType, onLoad, onError }: ModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        let loader: STLLoader | OBJLoader;
        
        switch (fileType.toLowerCase()) {
          case 'stl':
            loader = new STLLoader();
            const stlGeometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
              (loader as STLLoader).load(
                url, 
                (geometry) => resolve(geometry),
                undefined,
                reject
              );
            });
            setGeometry(stlGeometry);
            break;
            
          case 'obj':
            loader = new OBJLoader();
            const objGroup = await new Promise<THREE.Group>((resolve, reject) => {
              (loader as OBJLoader).load(
                url,
                (group) => resolve(group),
                undefined,
                reject
              );
            });
            // Extract geometry from the first mesh in the group
            const firstMesh = objGroup.children.find(child => child instanceof THREE.Mesh) as THREE.Mesh;
            if (firstMesh) {
              setGeometry(firstMesh.geometry);
            }
            break;
            
          default:
            throw new Error(`Unsupported file type: ${fileType}`);
        }
        
        onLoad?.();
      } catch (error) {
        console.error('Error loading model:', error);
        onError?.(error instanceof Error ? error.message : 'Failed to load model');
      }
    };

    if (url) {
      loadModel();
    }
  }, [url, fileType, onLoad, onError]);

  useFrame((state) => {
    if (meshRef.current) {
      // Optional: Add subtle rotation animation
      // meshRef.current.rotation.y += 0.005;
    }
  });

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial 
        color="#6366f1" 
        metalness={0.1} 
        roughness={0.2}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

export default function CADViewer({ 
  fileUrl, 
  fileName, 
  fileType = 'stl',
  width = '100%',
  height = '400px',
  showControls = true,
  onLoad,
  onError 
}: CADViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWireframe, setShowWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = (errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
    onError?.(errorMessage);
  };

  const resetCamera = () => {
    // This would reset the camera position - implementation depends on camera controls
    console.log('Reset camera position');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && canvasRef.current) {
      canvasRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const downloadModel = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'model';
      link.click();
    }
  };

  const shareModel = async () => {
    if (navigator.share && fileUrl) {
      try {
        await navigator.share({
          title: fileName || 'CAD Model',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
        style={{ width, height }}
      >
        <div className="text-center p-6">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Failed to load model</h3>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg border overflow-hidden" style={{ width, height }}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading 3D model...</p>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      {showControls && (
        <div className="absolute top-4 left-4 right-4 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg px-3 py-2 shadow-sm">
              <button
                onClick={resetCamera}
                className="p-1 hover:bg-gray-100 rounded"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowWireframe(!showWireframe)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Toggle Wireframe"
              >
                {showWireframe ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Toggle Grid"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white/90 backdrop-blur rounded-lg px-3 py-2 shadow-sm">
              <button
                onClick={downloadModel}
                className="p-1 hover:bg-gray-100 rounded"
                title="Download Model"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={shareModel}
                className="p-1 hover:bg-gray-100 rounded"
                title="Share Model"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1 hover:bg-gray-100 rounded"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Info */}
      {fileName && (
        <div className="absolute bottom-4 left-4 z-20">
          <div className="bg-white/90 backdrop-blur rounded-lg px-3 py-2 shadow-sm">
            <p className="text-sm font-medium text-gray-900">{fileName}</p>
            <p className="text-xs text-gray-500 uppercase">{fileType} Model</p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <div ref={canvasRef} className="w-full h-full">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
          <pointLight position={[-10, -10, -5]} intensity={0.3} />

          {/* Environment */}
          <Environment preset="studio" />

          {/* Grid */}
          {showGrid && (
            <Grid 
              args={[20, 20]} 
              cellSize={1} 
              cellThickness={0.5} 
              cellColor="#e2e8f0" 
              sectionSize={5} 
              sectionThickness={1} 
              sectionColor="#cbd5e1"
              fadeDistance={25}
              fadeStrength={1}
            />
          )}

          {/* Model */}
          {fileUrl && (
            <Model 
              url={fileUrl} 
              fileType={fileType} 
              onLoad={handleLoad}
              onError={handleError}
            />
          )}

          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            dampingFactor={0.05}
            enableDamping={true}
          />
        </Canvas>
      </div>

      {/* No Model State */}
      {!fileUrl && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No 3D Model</h3>
            <p className="text-sm text-gray-500">Upload a CAD file to view it here</p>
            <p className="text-xs text-gray-400 mt-2">
              Supported formats: STL, OBJ, STEP (coming soon)
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 