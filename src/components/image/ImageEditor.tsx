'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Separator } from '@/components/ui/Separator';
import { Card } from '@/components/ui/Card';
import { 
  Crop, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Maximize,
  Minimize,
  SunMedium,
  Contrast,
  Palette,
  Sliders,
  Type,
  Square,
  Circle,
  MousePointer,
  Undo,
  Redo,
  Download,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditorToolbar } from './EditorToolbar';

// Types
interface ImageDetails {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
  format: string;
}

interface ImageEditorProps {
  image: ImageDetails;
  onSave: (editedImageData: Blob) => void;
  onDownload: (editedImageData: Blob) => void;
}

type EditorTool = 
  | 'select'
  | 'crop'
  | 'rotate'
  | 'flip'
  | 'resize'
  | 'text'
  | 'shape'
  | 'draw';

type AdjustmentType = 
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'blur'
  | 'sharpen';

export function ImageEditor({ image, onSave, onDownload }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [selectedTool, setSelectedTool] = useState<EditorTool>('select');
  const [activeTab, setActiveTab] = useState('transform');
  const [canvasReady, setCanvasReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Image state
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [flippedX, setFlippedX] = useState(false);
  const [flippedY, setFlippedY] = useState(false);
  
  // Crop state
  const [cropMode, setCropMode] = useState(false);
  const [cropStart, setCropStart] = useState<{x: number, y: number} | null>(null);
  const [cropEnd, setCropEnd] = useState<{x: number, y: number} | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  
  // Resize state
  const [resizeMode, setResizeMode] = useState(false);
  const [resizeWidth, setResizeWidth] = useState(0);
  const [resizeHeight, setResizeHeight] = useState(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const originalAspectRatio = useRef(0);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#ff0000'); // Default: red
  const [brushSize, setBrushSize] = useState(5);
  const lastPos = useRef<{x: number, y: number} | null>(null);
  
  // Text state
  const [textMode, setTextMode] = useState(false);
  const [textToAdd, setTextToAdd] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textSize, setTextSize] = useState(24);
  const [textFont, setTextFont] = useState('Arial');
  const [textPosition, setTextPosition] = useState<{x: number, y: number} | null>(null);
  
  // History for undo/redo
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Shape state
  const [shapeType, setShapeType] = useState<'rectangle' | 'circle' | 'line'>('rectangle');
  const [shapeColor, setShapeColor] = useState('#ff0000');
  const [shapeLineWidth, setShapeLineWidth] = useState(2);
  const [shapeFill, setShapeFill] = useState(false);
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStart, setShapeStart] = useState<{x: number, y: number} | null>(null);
  const [shapeEnd, setShapeEnd] = useState<{x: number, y: number} | null>(null);
  
  // Setup canvas and load image with error handling
  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setError(null);
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      
      if (!canvas || !ctx || !image.url) {
        setError("Canvas initialization failed");
        setIsLoading(false);
        return;
      }
      
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Enable CORS
        img.src = image.url;
        
        img.onload = () => {
          imgRef.current = img;
          
          // Set canvas dimensions to match image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Set initial resize values
          setResizeWidth(img.width);
          setResizeHeight(img.height);
          originalAspectRatio.current = img.width / img.height;
          setCanvasSize({ width: img.width, height: img.height });
          
          // Initial render
          renderCanvas();
          
          // Add to history
          saveToHistory();
          
          setCanvasReady(true);
          setIsLoading(false);
        };
        
        img.onerror = () => {
          setError("Failed to load image. The image may be inaccessible or in an unsupported format.");
          setIsLoading(false);
        };
      } catch (err) {
        console.error("Image loading error:", err);
        setError("An unexpected error occurred while loading the image.");
        setIsLoading(false);
      }
    };
    
    loadImage();
  }, [image.url]);
  
  // Canvas responsive sizing with window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current || !imgRef.current) return;
      
      // Adjust visualization of canvas within container while preserving actual canvas dimensions
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const canvas = canvasRef.current;
      
      const originalWidth = canvas.width;
      const originalHeight = canvas.height;
      
      // Calculate scaling to fit container while maintaining aspect ratio
      const scaleWidth = containerWidth / originalWidth;
      const scaleHeight = containerHeight / originalHeight;
      const scale = Math.min(scaleWidth, scaleHeight, 1); // Don't scale up beyond 100%
      
      // Apply CSS scaling to display element without changing the actual canvas size
      if (canvas.style) {
        canvas.style.transformOrigin = 'top left';
        canvas.style.transform = `scale(${scale})`;
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [canvasSize]);
  
  // Effect to update tool-related state
  useEffect(() => {
    // Reset tool-specific modes when switching tools
    setCropMode(selectedTool === 'crop');
    setResizeMode(selectedTool === 'resize');
    
    if (selectedTool === 'crop') {
      setCropStart(null);
      setCropEnd(null);
    }
  }, [selectedTool]);
  
  // Render canvas with current adjustments
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imgRef.current;
    
    if (!canvas || !ctx || !img) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set the origin to the center of the canvas
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Apply flipping
    ctx.scale(flippedX ? -1 : 1, flippedY ? -1 : 1);
    
    // Apply scale
    ctx.scale(scale, scale);
    
    // Draw image centered
    ctx.drawImage(
      img,
      -img.width / 2,
      -img.height / 2,
      img.width,
      img.height
    );
    
    // Apply filters
    if (brightness !== 100 || contrast !== 100 || saturation !== 100) {
      const imageData = ctx.getImageData(
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );
      
      const data = imageData.data;
      
      // Apply filters pixel by pixel
      for (let i = 0; i < data.length; i += 4) {
        // Apply brightness
        const brightnessValue = brightness / 100;
        data[i] = Math.min(255, data[i] * brightnessValue);     // R
        data[i + 1] = Math.min(255, data[i + 1] * brightnessValue); // G
        data[i + 2] = Math.min(255, data[i + 2] * brightnessValue); // B
        
        // Apply contrast
        const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        data[i] = Math.min(255, Math.max(0, contrastFactor * (data[i] - 128) + 128));
        data[i + 1] = Math.min(255, Math.max(0, contrastFactor * (data[i + 1] - 128) + 128));
        data[i + 2] = Math.min(255, Math.max(0, contrastFactor * (data[i + 2] - 128) + 128));
        
        // Saturation would be more complex, simplified here
      }
      
      ctx.putImageData(imageData, -img.width / 2, -img.height / 2);
    }
    
    ctx.restore();
  };
  
  // Save current state to history
  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL();
    
    // If we're not at the end of the history, truncate it
    if (historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1));
    }
    
    setHistory(prev => [...prev, dataURL]);
    setHistoryIndex(prev => prev + 1);
  };
  
  // Handle undo
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    
    setHistoryIndex(prev => prev - 1);
    loadFromHistory(historyIndex - 1);
  };
  
  // Handle redo
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    
    setHistoryIndex(prev => prev + 1);
    loadFromHistory(historyIndex + 1);
  };
  
  // Load from history
  const loadFromHistory = (index: number) => {
    if (index < 0 || index >= history.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx) return;
    
    const img = new Image();
    img.src = history[index];
    
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };
  
  // Transformation handlers
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
    renderCanvas();
    saveToHistory();
  };
  
  const handleFlipHorizontal = () => {
    setFlippedX(prev => !prev);
    renderCanvas();
    saveToHistory();
  };
  
  const handleFlipVertical = () => {
    setFlippedY(prev => !prev);
    renderCanvas();
    saveToHistory();
  };
  
  const handleResetTransform = () => {
    setRotation(0);
    setScale(1);
    setFlippedX(false);
    setFlippedY(false);
    renderCanvas();
    saveToHistory();
  };
  
  // Adjustment handlers
  const handleBrightnessChange = (value: number[]) => {
    setBrightness(value[0]);
    renderCanvas();
  };
  
  const handleBrightnessChangeEnd = () => {
    saveToHistory();
  };
  
  const handleContrastChange = (value: number[]) => {
    setContrast(value[0]);
    renderCanvas();
  };
  
  const handleContrastChangeEnd = () => {
    saveToHistory();
  };
  
  const handleSaturationChange = (value: number[]) => {
    setSaturation(value[0]);
    renderCanvas();
  };
  
  const handleSaturationChangeEnd = () => {
    saveToHistory();
  };
  
  const handleResetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    renderCanvas();
    saveToHistory();
  };
  
  // Handle save and download
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (blob) onSave(blob);
    });
  };
  
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (blob) onDownload(blob);
    });
  };
  
  // Drawing handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== 'draw') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    lastPos.current = { x, y };
    
    // Start a new path
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = brushSize;
      ctx.stroke();
    }
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== 'draw' || !isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (lastPos.current) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(x, y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = brushSize;
        ctx.stroke();
      }
    }
    
    lastPos.current = { x, y };
  };
  
  const handleCanvasMouseUp = () => {
    if (selectedTool !== 'draw' || !isDrawing) return;
    
    setIsDrawing(false);
    lastPos.current = null;
    saveToHistory();
  };
  
  const handleCanvasMouseLeave = () => {
    if (selectedTool !== 'draw' || !isDrawing) return;
    
    setIsDrawing(false);
    lastPos.current = null;
    saveToHistory();
  };
  
  // Text handlers
  useEffect(() => {
    if (selectedTool === 'text') {
      setTextMode(true);
    } else {
      setTextMode(false);
    }
  }, [selectedTool]);
  
  const handleTextClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!textMode || !textToAdd.trim()) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `${textSize}px ${textFont}`;
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'middle';
      ctx.fillText(textToAdd, x, y);
      
      // Reset text mode after adding text
      setTextPosition(null);
      saveToHistory();
    }
  };
  
  const handleAddText = () => {
    if (!textToAdd.trim() || !textPosition) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `${textSize}px ${textFont}`;
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'middle';
      ctx.fillText(textToAdd, textPosition.x, textPosition.y);
      
      // Reset text mode after adding text
      setTextToAdd('');
      setTextPosition(null);
      saveToHistory();
    }
  };
  
  // Crop handlers
  const handleCropMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropStart({ x, y });
    setCropEnd({ x, y });
    setIsCropping(true);
  };
  
  const handleCropMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropMode || !isCropping || !cropStart) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(canvas.height, e.clientY - rect.top));
    
    setCropEnd({ x, y });
    drawCropOverlay();
  };
  
  const handleCropMouseUp = () => {
    if (!cropMode) return;
    
    setIsCropping(false);
  };
  
  const drawCropOverlay = () => {
    if (!cropStart || !cropEnd) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx) return;
    
    // Clear canvas and redraw image
    renderCanvas();
    
    // Calculate crop rectangle
    const x = Math.min(cropStart.x, cropEnd.x);
    const y = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);
    
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear the crop area
    ctx.clearRect(x, y, width, height);
    
    // Draw crop border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  };
  
  const handleApplyCrop = () => {
    if (!cropStart || !cropEnd) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx) return;
    
    // Calculate crop rectangle
    const x = Math.min(cropStart.x, cropEnd.x);
    const y = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);
    
    // Create temporary canvas for cropped image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;
    
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // Copy the cropped area to the temp canvas
    tempCtx.drawImage(
      canvas,
      x, y, width, height,
      0, 0, width, height
    );
    
    // Resize the main canvas
    canvas.width = width;
    canvas.height = height;
    
    // Draw the cropped image back to the main canvas
    ctx.drawImage(tempCanvas, 0, 0);
    
    // Update resize values
    setResizeWidth(width);
    setResizeHeight(height);
    originalAspectRatio.current = width / height;
    
    // Reset crop state
    setCropStart(null);
    setCropEnd(null);
    setCropMode(false);
    setSelectedTool('select');
    setActiveTab('transform');
    
    // Save to history
    saveToHistory();
  };
  
  const handleCancelCrop = () => {
    setCropStart(null);
    setCropEnd(null);
    renderCanvas();
    setCropMode(false);
    setSelectedTool('select');
    setActiveTab('transform');
  };
  
  // Resize handlers
  const handleApplyResize = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx || !imgRef.current) return;
    
    // Create temporary canvas with the new dimensions
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;
    
    tempCanvas.width = resizeWidth;
    tempCanvas.height = resizeHeight;
    
    // Copy the current canvas to the temp canvas, resizing in the process
    tempCtx.drawImage(
      canvas,
      0, 0, canvas.width, canvas.height,
      0, 0, resizeWidth, resizeHeight
    );
    
    // Resize the main canvas
    canvas.width = resizeWidth;
    canvas.height = resizeHeight;
    
    // Draw the resized image back to the main canvas
    ctx.drawImage(tempCanvas, 0, 0);
    
    // Reset resize state and update original aspect ratio
    setResizeMode(false);
    setSelectedTool('select');
    setActiveTab('transform');
    originalAspectRatio.current = resizeWidth / resizeHeight;
    
    // Save to history
    saveToHistory();
  };
  
  const handleResizeWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value) || 1;
    setResizeWidth(width);
    
    if (maintainAspectRatio && originalAspectRatio.current > 0) {
      setResizeHeight(Math.round(width / originalAspectRatio.current));
    }
  };
  
  const handleResizeHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const height = parseInt(e.target.value) || 1;
    setResizeHeight(height);
    
    if (maintainAspectRatio && originalAspectRatio.current > 0) {
      setResizeWidth(Math.round(height * originalAspectRatio.current));
    }
  };
  
  // Shape handlers
  const handleShapeMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== 'shape') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setShapeStart({ x, y });
    setShapeEnd({ x, y });
    setIsDrawingShape(true);
  };
  
  const handleShapeMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== 'shape' || !isDrawingShape || !shapeStart) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(canvas.height, e.clientY - rect.top));
    
    setShapeEnd({ x, y });
    drawShapePreview();
  };
  
  const handleShapeMouseUp = () => {
    if (selectedTool !== 'shape' || !isDrawingShape || !shapeStart || !shapeEnd) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx) return;
    
    // Final draw of the shape
    drawShape(ctx, shapeStart, shapeEnd, shapeType, shapeColor, shapeLineWidth, shapeFill);
    
    // Reset shape drawing state
    setIsDrawingShape(false);
    setShapeStart(null);
    setShapeEnd(null);
    
    // Save to history
    saveToHistory();
  };
  
  const drawShapePreview = () => {
    if (!shapeStart || !shapeEnd) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx) return;
    
    // Clear canvas and redraw image
    renderCanvas();
    
    // Draw the shape preview
    drawShape(ctx, shapeStart, shapeEnd, shapeType, shapeColor, shapeLineWidth, shapeFill);
  };
  
  const drawShape = (
    ctx: CanvasRenderingContext2D,
    start: {x: number, y: number},
    end: {x: number, y: number},
    type: 'rectangle' | 'circle' | 'line',
    color: string,
    lineWidth: number,
    fill: boolean
  ) => {
    // Set up style
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    
    // Draw based on shape type
    if (type === 'rectangle') {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      
      if (fill) {
        ctx.fillRect(x, y, width, height);
      }
      ctx.strokeRect(x, y, width, height);
    } else if (type === 'circle') {
      const centerX = (start.x + end.x) / 2;
      const centerY = (start.y + end.y) / 2;
      const radius = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      ) / 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      if (fill) {
        ctx.fill();
      }
      ctx.stroke();
    } else if (type === 'line') {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  };
  
  // Combined handlers for all mouse events
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'draw') {
      handleCanvasMouseDown(e);
    } else if (selectedTool === 'text') {
      handleTextClick(e);
    } else if (selectedTool === 'shape') {
      handleShapeMouseDown(e);
    }
  };
  
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'draw') {
      // Drawing handler
      if (selectedTool !== 'draw') return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setIsDrawing(true);
      lastPos.current = { x, y };
      
      // Start a new path
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = brushSize;
        ctx.stroke();
      }
    } else if (selectedTool === 'crop') {
      // Crop handler
      handleCropMouseDown(e);
    } else if (selectedTool === 'shape') {
      // Shape handler
      handleShapeMouseDown(e);
    }
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'draw' && isDrawing) {
      // Drawing handler
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      if (lastPos.current) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.beginPath();
          ctx.moveTo(lastPos.current.x, lastPos.current.y);
          ctx.lineTo(x, y);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = drawColor;
          ctx.lineWidth = brushSize;
          ctx.stroke();
        }
      }
      
      lastPos.current = { x, y };
    } else if (selectedTool === 'crop' && isCropping) {
      // Crop handler
      handleCropMouseMove(e);
    } else if (selectedTool === 'shape' && isDrawingShape) {
      // Shape handler
      handleShapeMouseMove(e);
    }
  };
  
  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'draw' && isDrawing) {
      setIsDrawing(false);
      lastPos.current = null;
      saveToHistory();
    } else if (selectedTool === 'crop') {
      handleCropMouseUp();
    } else if (selectedTool === 'shape') {
      handleShapeMouseUp();
    }
  };
  
  const handleCanvasMouseLeave = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'draw' && isDrawing) {
      setIsDrawing(false);
      lastPos.current = null;
      saveToHistory();
    } else if (selectedTool === 'shape' && isDrawingShape) {
      handleShapeMouseUp();
    }
  };
  
  // Error handling and recovery
  const handleRetryLoad = () => {
    if (imgRef.current) {
      imgRef.current = null;
    }
    setError(null);
    setIsLoading(true);
    
    // Force reload of the image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image.url + '?retry=' + new Date().getTime(); // Cache busting
    
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      
      if (!canvas || !ctx) {
        setError("Canvas initialization failed on retry");
        setIsLoading(false);
        return;
      }
      
      imgRef.current = img;
      
      // Reset canvas
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Reset state
      setScale(1);
      setRotation(0);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setFlippedX(false);
      setFlippedY(false);
      
      // Clear history
      setHistory([]);
      setHistoryIndex(-1);
      
      // Redraw and save initial state
      renderCanvas();
      saveToHistory();
      
      setCanvasReady(true);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError("Failed to load image after retry. Please check if the image exists and is accessible.");
      setIsLoading(false);
    };
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <EditorToolbar 
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Side panel / adjustments */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full mb-4">
              <TabsTrigger value="transform" className="flex-1">Transform</TabsTrigger>
              <TabsTrigger value="adjust" className="flex-1">Adjust</TabsTrigger>
              {selectedTool === 'draw' && (
                <TabsTrigger value="draw" className="flex-1">Draw</TabsTrigger>
              )}
              {selectedTool === 'text' && (
                <TabsTrigger value="text" className="flex-1">Text</TabsTrigger>
              )}
              {selectedTool === 'shape' && (
                <TabsTrigger value="shape" className="flex-1">Shape</TabsTrigger>
              )}
              {selectedTool === 'resize' && (
                <TabsTrigger value="resize" className="flex-1">Resize</TabsTrigger>
              )}
              {selectedTool === 'crop' && cropStart && cropEnd && (
                <TabsTrigger value="crop" className="flex-1">Crop</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="transform" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Transform</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRotate}
                    className="w-full"
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    Rotate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleFlipHorizontal}
                    className={cn("w-full", flippedX && "bg-gray-100 dark:bg-gray-800")}
                  >
                    <FlipHorizontal className="h-4 w-4 mr-2" />
                    Flip H
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleFlipVertical}
                    className={cn("w-full", flippedY && "bg-gray-100 dark:bg-gray-800")}
                  >
                    <FlipVertical className="h-4 w-4 mr-2" />
                    Flip V
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedTool('crop')}
                    className={cn("w-full", selectedTool === 'crop' && "bg-gray-100 dark:bg-gray-800")}
                  >
                    <Crop className="h-4 w-4 mr-2" />
                    Crop
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Scale</p>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setScale(s => Math.max(0.1, s - 0.1))}
                    disabled={scale <= 0.1}
                  >
                    <Minimize className="h-4 w-4" />
                  </Button>
                  <Slider
                    value={[scale * 100]}
                    min={10}
                    max={200}
                    step={5}
                    onValueChange={(value) => {
                      setScale(value[0] / 100);
                      renderCanvas();
                    }}
                    onValueCommit={() => saveToHistory()}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setScale(s => Math.min(2, s + 0.1))}
                    disabled={scale >= 2}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  {Math.round(scale * 100)}%
                </p>
              </div>
              
              <Separator />
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResetTransform}
                className="w-full"
              >
                Reset Transforms
              </Button>
            </TabsContent>
            
            <TabsContent value="adjust" className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Brightness</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{brightness}%</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <SunMedium className="h-4 w-4 text-gray-500" />
                    <Slider
                      value={[brightness]}
                      min={0}
                      max={200}
                      step={5}
                      onValueChange={handleBrightnessChange}
                      onValueCommit={handleBrightnessChangeEnd}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Contrast</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{contrast}%</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Contrast className="h-4 w-4 text-gray-500" />
                    <Slider
                      value={[contrast]}
                      min={0}
                      max={200}
                      step={5}
                      onValueChange={handleContrastChange}
                      onValueCommit={handleContrastChangeEnd}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Saturation</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{saturation}%</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Palette className="h-4 w-4 text-gray-500" />
                    <Slider
                      value={[saturation]}
                      min={0}
                      max={200}
                      step={5}
                      onValueChange={handleSaturationChange}
                      onValueCommit={handleSaturationChangeEnd}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResetAdjustments}
                className="w-full"
              >
                Reset Adjustments
              </Button>
            </TabsContent>
            
            <TabsContent value="draw" className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Brush Color</p>
                  <div className="grid grid-cols-4 gap-2">
                    {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff'].map(
                      (color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            drawColor === color ? 'border-gray-800 dark:border-gray-200' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setDrawColor(color)}
                          aria-label={`Color ${color}`}
                        />
                      )
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Brush Size</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{brushSize}px</p>
                  </div>
                  <Slider
                    value={[brushSize]}
                    min={1}
                    max={30}
                    step={1}
                    onValueChange={(value) => setBrushSize(value[0])}
                    className="flex-1"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Text Content</p>
                  <div className="flex">
                    <input
                      type="text"
                      value={textToAdd}
                      onChange={(e) => setTextToAdd(e.target.value)}
                      placeholder="Enter text..."
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Font Size</p>
                  <Slider
                    value={[textSize]}
                    min={12}
                    max={72}
                    step={1}
                    onValueChange={(value) => setTextSize(value[0])}
                    className="flex-1"
                  />
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    {textSize}px
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Text Color</p>
                  <div className="grid grid-cols-4 gap-2">
                    {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map(
                      (color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            textColor === color ? 'border-gray-800 dark:border-gray-200' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setTextColor(color)}
                          aria-label={`Color ${color}`}
                        />
                      )
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Font</p>
                  <select
                    value={textFont}
                    onChange={(e) => setTextFont(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Impact">Impact</option>
                  </select>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Click on the canvas to add text
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="shape" className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Shape Type</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={shapeType === 'rectangle' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShapeType('rectangle')}
                      className="w-full"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Rectangle
                    </Button>
                    <Button
                      variant={shapeType === 'circle' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShapeType('circle')}
                      className="w-full"
                    >
                      <Circle className="h-4 w-4 mr-2" />
                      Circle
                    </Button>
                    <Button
                      variant={shapeType === 'line' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShapeType('line')}
                      className="w-full"
                    >
                      <span className="i-lucide-minus h-4 w-4 mr-2" />
                      Line
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Shape Color</p>
                  <div className="grid grid-cols-4 gap-2">
                    {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map(
                      (color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            shapeColor === color ? 'border-gray-800 dark:border-gray-200' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setShapeColor(color)}
                          aria-label={`Color ${color}`}
                        />
                      )
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Line Width</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{shapeLineWidth}px</p>
                  </div>
                  <Slider
                    value={[shapeLineWidth]}
                    min={1}
                    max={20}
                    step={1}
                    onValueChange={(value) => setShapeLineWidth(value[0])}
                    className="flex-1"
                  />
                </div>
                
                {shapeType !== 'line' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="shape-fill"
                      checked={shapeFill}
                      onChange={(e) => setShapeFill(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-700"
                    />
                    <label htmlFor="shape-fill" className="text-sm">
                      Fill shape
                    </label>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  Draw on the canvas to add your shape
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="resize" className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm font-medium">Image Dimensions</p>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Width (px)</label>
                  <input
                    type="number"
                    value={resizeWidth}
                    onChange={handleResizeWidthChange}
                    min="1"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Height (px)</label>
                  <input
                    type="number"
                    value={resizeHeight}
                    onChange={handleResizeHeightChange}
                    min="1"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="aspect-ratio"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-700"
                  />
                  <label htmlFor="aspect-ratio" className="text-sm">
                    Maintain aspect ratio
                  </label>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTool('select');
                      setActiveTab('transform');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApplyResize}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="crop" className="space-y-4">
              <div className="space-y-3">
                {cropStart && cropEnd && (
                  <>
                    <p className="text-sm font-medium">Crop Selection</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Width: {Math.abs(cropEnd.x - cropStart.x)}px
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Height: {Math.abs(cropEnd.y - cropStart.y)}px
                    </p>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelCrop}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleApplyCrop}
                        className="flex-1"
                      >
                        Crop
                      </Button>
                    </div>
                  </>
                )}
                
                {(!cropStart || !cropEnd) && (
                  <p className="text-sm text-center py-4">
                    Drag on the image to select the crop area
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 space-y-2">
            <Button 
              size="sm"
              onClick={handleSave}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        
        {/* Canvas area */}
        <div 
          ref={containerRef} 
          className="flex-1 relative overflow-auto flex items-center justify-center bg-[#f0f0f0] dark:bg-gray-800 bg-grid p-4"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Loading image...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-black/90 backdrop-blur-sm z-10">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Error</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {error}
                </p>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={handleRetryLoad} className="mr-2">
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="relative">
            <canvas 
              ref={canvasRef}
              className="shadow-md"
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseLeave}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 