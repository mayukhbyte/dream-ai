import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  RotateCcw,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { submitOrderComplaint } from '@/lib/api';

interface CameraComplaintModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplaintSubmitted?: () => void;
}

export const CameraComplaintModal: React.FC<CameraComplaintModalProps> = ({
  orderId,
  isOpen,
  onClose,
  onComplaintSubmitted
}) => {
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [complaintText, setComplaintText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<{ helpline: string; supportSite: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } else {
        setErrorMsg('Camera access is not supported by your browser. Please upload a photo file.');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setErrorMsg('Camera access was denied or is unavailable. Please upload a photo from your device.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoData(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!complaintText.trim()) {
      setErrorMsg('Please describe the issue with your food.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await submitOrderComplaint(orderId, {
        customerMessage: complaintText.trim(),
        photoUrl: photoData || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
      });

      setSuccessInfo({
        helpline: res.helpline || '1800-200-3732',
        supportSite: res.supportSite || 'https://help.dreamfood.ai/support'
      });
      onComplaintSubmitted?.();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    stopCamera();
    setPhotoData(null);
    setSuccessInfo(null);
    setErrorMsg(null);
    setComplaintText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-lg w-full rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-950/80 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Report Bad Food to Chef
              </h3>
              <p className="text-xs text-zinc-400">Order #{orderId.slice(-6)} • Direct Camera Upload</p>
            </div>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {successInfo ? (
            <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-white">Complaint & Evidence Received!</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Your photograph and feedback have been dispatched immediately to the <strong>Chef Dashboard</strong> and Kitchen Inspection Terminal for corrective action and priority refund.
              </p>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs text-left">
                <span className="font-bold text-white block">Official Care Assistance:</span>
                <p className="text-zinc-300 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-orange-400" />
                  Toll-Free Customer Care: <strong>{successInfo.helpline}</strong>
                </p>
                <p className="text-zinc-300">
                  Help Desk Ticket: <a href={successInfo.supportSite} target="_blank" rel="noreferrer" className="text-orange-400 underline">{successInfo.supportSite}</a>
                </p>
              </div>

              <button
                onClick={() => { handleReset(); onClose(); }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Camera Viewport or Captured Image */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-300 block">
                  Food Evidence Photo (Camera / Upload)
                </label>

                {isCameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-zinc-700 aspect-video flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <button
                      onClick={capturePhoto}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/40"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                  </div>
                ) : photoData ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-zinc-700 aspect-video">
                    <img src={photoData} alt="Captured food evidence" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotoData(null)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retake
                    </button>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/40 text-center space-y-3">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={startCamera}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
                      >
                        <Camera className="w-4 h-4" />
                        Use Device Camera
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-2 border border-zinc-700 transition"
                      >
                        <Upload className="w-4 h-4" />
                        Upload File
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Snap an image of burnt, spilled, cold, or incorrect food items.
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Complaint Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">
                  Describe What Was Wrong With the Food
                </label>
                <textarea
                  rows={3}
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="e.g., Food arrived cold (below 65°C), sauce spilled in package, or flavor was spoiled..."
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Submit Action */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !complaintText.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Uploading to Chef Terminal...' : 'Submit to Chef Dashboard'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
