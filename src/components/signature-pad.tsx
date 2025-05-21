
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Eraser, CheckSquare } from 'lucide-react';

interface SignaturePadProps {
  onConfirm: (dataUrl: string) => void;
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
}

export function SignaturePad({
  onConfirm,
  width = 400,
  height = 200,
  penColor = 'black',
  backgroundColor = 'white',
}: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [isEmpty, setIsEmpty] = React.useState(true);

  const getCtx = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = getCtx();
      if (ctx) {
        // Set background color
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        setIsEmpty(true); // Initially empty
      }
    }
  }, [width, height, backgroundColor]);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if ('touches' in event) { // Touch event
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }
    // Mouse event
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(event);
    if (!coords) return;
    const ctx = getCtx();
    if (!ctx) return;

    setIsDrawing(true);
    setIsEmpty(false);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCoordinates(event);
    if (!coords) return;
    const ctx = getCtx();
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = getCtx();
    if (ctx) {
      ctx.closePath();
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    const ctx = getCtx();
    if (ctx) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      setIsEmpty(true);
    }
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (canvas && !isEmpty) {
      const dataUrl = canvas.toDataURL('image/png');
      onConfirm(dataUrl);
    } else if (isEmpty) {
        // Optionally, notify user that signature is empty
        console.log("Signature is empty, cannot confirm.");
    }
  };
  
  // Prevent page scroll on touch devices while drawing
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventScroll = (event: TouchEvent) => {
      if (isDrawing) {
        event.preventDefault();
      }
    };

    canvas.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      canvas.removeEventListener('touchmove', preventScroll);
    };
  }, [isDrawing]);


  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-input rounded-md cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className="flex space-x-2">
        <Button variant="outline" onClick={handleClear} type="button">
          <Eraser className="mr-2 h-4 w-4" /> Clear
        </Button>
        <Button onClick={handleConfirm} type="button" disabled={isEmpty}>
          <CheckSquare className="mr-2 h-4 w-4" /> Confirm Signature
        </Button>
      </div>
    </div>
  );
}

SignaturePad.displayName = "SignaturePad";
