import React, { useState } from 'react';
import { Wrench, CheckCircle, Image as ImageIcon, Send, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';
import InspectionEditor from './InspectionEditor';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import toast from 'react-hot-toast';

// =====================================================
// TYPES & CONSTANTS
// =====================================================

interface RepairTrackerProps {
  bookingId: string;
  currentUser: {
    id?: string;
    uid?: string;
    displayName?: string;
    firstName?: string;
    [key: string]: any;
  };
}

interface RepairStage {
  id: string;
  label: string;
}

const REPAIR_STAGES: RepairStage[] = [
  { id: 'open', label: 'Ticket Open' },
  { id: 'Diagnosing', label: 'Diagnosing Issue' },
  { id: 'PartsOrdered', label: 'Waiting for Parts' },
  { id: 'in_progress', label: 'On The Bench' },
  { id: 'Testing', label: 'Quality Testing' },
  { id: 'Ready', label: 'Ready for Pickup' },
  { id: 'completed', label: 'Completed' }
];

// =====================================================
// COMPONENT
// =====================================================

export default function RepairTracker({ bookingId, currentUser }: RepairTrackerProps): JSX.Element {
  const [newLog, setNewLog] = useState<string>('');
  const [isPrivateLog, setIsPrivateLog] = useState<boolean>(false);
  const [activeInspection, setActiveInspection] = useState<'Pre' | 'Post' | null>(null);
  const { uploadMedia, uploading } = useUpload();
  const [logImage, setLogImage] = useState<File | null>(null);

  // Convex live query for the service request
  const request = useQuery(api.techServices.getServiceRequestById, { requestId: bookingId as any });
  const updateStatusMutation = useMutation(api.techServices.updateServiceRequestStatus);
  const addLogMutation = useMutation(api.techServices.addRepairLog);
  const saveInspectionMutation = useMutation(api.techServices.saveInspection);

  const userId = currentUser?.id || currentUser?.uid || '';
  const isTech = userId && (userId === request?.assignedTechId);
  const isRequester = userId && (userId === request?.requesterId);

  const handleStatusUpdate = async (newStatus: string): Promise<void> => {
    if (!isTech || !request) return;

    try {
      await updateStatusMutation({
        requestId: bookingId as any,
        status: newStatus,
        actorId: userId,
      });

      const stageLabel = REPAIR_STAGES.find(s => s.id === newStatus)?.label || newStatus;
      await addLogMutation({
        requestId: bookingId as any,
        text: `Status updated to: ${stageLabel}`,
        isPrivate: false,
        actorId: userId,
      });

      toast.success(`Status updated to ${stageLabel}`);
    } catch (e: any) {
      console.error('Status update failed:', e);
      toast.error(e?.message || 'Failed to update status');
    }
  };

  const addLogEntry = async (text: string, isPrivate = false, imageUrl?: string): Promise<void> => {
    if (!text.trim() || !userId) return;

    try {
      await addLogMutation({
        requestId: bookingId as any,
        text: text.trim(),
        isPrivate,
        imageUrl,
        actorId: userId,
      });
      setNewLog('');
      setLogImage(null);
      toast.success('Log entry added');
    } catch (e: any) {
      console.error('Failed to add log:', e);
      toast.error(e?.message || 'Failed to add log entry');
    }
  };

  const handleLogSubmit = async (): Promise<void> => {
    if (!newLog.trim()) return;
    let url: string | undefined = undefined;
    if (logImage) {
      const res = await uploadMedia(logImage, `repair_logs/${bookingId}`);
      url = res?.url || undefined;
    }
    await addLogEntry(newLog, isPrivateLog, url);
  };

  const handleSaveInspection = async (data: any): Promise<void> => {
    if (!activeInspection || !userId) return;

    try {
      await saveInspectionMutation({
        requestId: bookingId as any,
        type: activeInspection,
        data,
        actorId: userId,
      });

      const count = data.markers?.length || 0;
      await addLogMutation({
        requestId: bookingId as any,
        text: `${activeInspection}-Inspection completed. ${count} observation marker(s) noted.`,
        isPrivate: false,
        actorId: userId,
      });

      setActiveInspection(null);
      toast.success(`${activeInspection}-Inspection report saved`);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to save inspection: " + (e.message || "Unknown error"));
    }
  };

  if (request === undefined) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
        <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
        <p className="text-sm text-gray-500">Loading repair ticket data...</p>
      </div>
    );
  }

  if (request === null) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
        <AlertCircle className="text-red-500 w-8 h-8" />
        <h4 className="font-bold text-gray-800 dark:text-white">Ticket Not Found</h4>
        <p className="text-xs text-gray-500">The requested service ticket could not be found or has been removed.</p>
      </div>
    );
  }

  const currentStageIndex = Math.max(0, REPAIR_STAGES.findIndex(s => s.id === request.status));
  const progressPercent = (currentStageIndex / (REPAIR_STAGES.length - 1)) * 100;
  const repairLogs = request.repairLogs || [];
  const visibleLogs = repairLogs.filter((l) => isTech || !l.isPrivate);

  if (activeInspection) {
    return (
      <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl h-full">
          <InspectionEditor
            type={activeInspection}
            initialData={activeInspection === 'Pre' ? request.preInspection : request.postInspection}
            onSave={handleSaveInspection}
            onCancel={() => setActiveInspection(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#2c2e36] p-6 rounded-2xl border dark:border-gray-700 shadow-xs">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
              <Wrench className="text-orange-500"/> Repair Ticket #{request._id.slice(-6)}
            </h2>
            <p className="text-sm text-gray-500">
              {request.equipmentBrand ? `${request.equipmentBrand} ${request.equipmentModel || ''}` : request.title} • {request.category}
            </p>
          </div>
          {isRequester && (
            <button
              onClick={async () => {
                await addLogEntry("Customer requested status update from technician.", false);
              }}
              className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-200 transition"
            >
              Request Update
            </button>
          )}
        </div>

        {/* Progress Pipeline */}
        <div className="relative mb-8 px-2">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full absolute top-1/2 -translate-y-1/2 z-0"></div>
          <div
            className="h-2 bg-green-500 rounded-full absolute top-1/2 -translate-y-1/2 z-0 transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
          <div className="flex justify-between relative z-10">
            {REPAIR_STAGES.map((stage, idx) => {
              const isCompleted = idx <= currentStageIndex;
              return (
                <div
                  key={stage.id}
                  className={`flex flex-col items-center group ${isTech ? 'cursor-pointer' : 'cursor-default'}`}
                  onClick={() => isTech && handleStatusUpdate(stage.id)}
                  title={isTech ? `Set status to ${stage.label}` : undefined}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle size={14}/> : <div className="w-2 h-2 rounded-full bg-gray-300"/>}
                  </div>
                  <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider absolute -bottom-6 w-24 text-center ${
                    idx === currentStageIndex
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity'
                  }`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intake & QC Inspection Cards */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className={`p-4 rounded-xl border ${
            request.preInspection
              ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
              : 'bg-white border-dashed border-gray-300 dark:bg-black/20 dark:border-gray-700'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase text-gray-500">Bench Intake Diagnosis</span>
              {request.preInspection && <CheckCircle size={16} className="text-green-500"/>}
            </div>
            {request.preInspection ? (
              <div>
                <div className="font-bold text-sm dark:text-white">Inspection Logged</div>
                <button
                  onClick={() => setActiveInspection('Pre')}
                  className="text-xs text-blue-500 font-bold mt-2 hover:underline"
                >
                  View Interactive Report
                </button>
              </div>
            ) : (
              isTech ? (
                <button
                  onClick={() => setActiveInspection('Pre')}
                  className="w-full py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-200"
                >
                  Start Pre-Inspection
                </button>
              ) : (
                <div className="text-xs text-gray-400 italic">Pending technician review...</div>
              )
            )}
          </div>

          <div className={`p-4 rounded-xl border ${
            request.postInspection
              ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
              : 'bg-white border-dashed border-gray-300 dark:bg-black/20 dark:border-gray-700'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase text-gray-500">Final QC Inspection</span>
              {request.postInspection && <CheckCircle size={16} className="text-green-500"/>}
            </div>
            {request.postInspection ? (
              <div>
                <div className="font-bold text-sm dark:text-white">QC Passed</div>
                <button
                  onClick={() => setActiveInspection('Post')}
                  className="text-xs text-blue-500 font-bold mt-2 hover:underline"
                >
                  View QC Report
                </button>
              </div>
            ) : (
              isTech ? (
                <button
                  onClick={() => setActiveInspection('Post')}
                  className="w-full py-2 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-200"
                >
                  Start Post-Inspection
                </button>
              ) : (
                <div className="text-xs text-gray-400 italic">Pending completion...</div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Real-time Repair Logs */}
      <div className="space-y-4">
        <h3 className="font-bold dark:text-white flex items-center gap-2">
          <FileText size={18} className="text-gray-400"/> Repair Log & Notes ({visibleLogs.length})
        </h3>
        <div className="bg-white dark:bg-[#2c2e36] rounded-2xl border dark:border-gray-700 p-5 max-h-[400px] overflow-y-auto">
          {visibleLogs.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No repair logs recorded yet.</p>
          ) : (
            visibleLogs.map((log, i) => (
              <div key={log.id || i} className={`mb-4 pl-4 border-l-2 ${
                log.isPrivate ? 'border-yellow-500' : 'border-blue-500'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold dark:text-white">{log.authorName}</span>
                    {log.isPrivate && (
                      <span className="text-[10px] bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 px-1.5 py-0.5 rounded font-bold">
                        Internal Note
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">{log.text}</p>
                {log.imageUrl && (
                  <img src={log.imageUrl} className="mt-2 rounded-xl max-h-48 border dark:border-gray-700" alt="Log attachment"/>
                )}
              </div>
            ))
          )}
        </div>

        {/* Technician Log Entry Box */}
        {(isTech || isRequester) && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border dark:border-gray-700">
            <textarea
              className="w-full p-3 bg-white dark:bg-[#1f2128] border dark:border-gray-700 rounded-xl text-xs mb-3 outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
              placeholder="Add status update or bench note..."
              rows={2}
              value={newLog}
              onChange={e => setNewLog(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 cursor-pointer text-gray-500 hover:text-orange-500 transition text-xs">
                  <ImageIcon size={16}/>
                  <span className="font-semibold">{logImage ? logImage.name.slice(0, 15) : 'Add Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && setLogImage(e.target.files[0])}
                  />
                </label>
                {isTech && (
                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-500 hover:text-yellow-500 text-xs">
                    <input
                      type="checkbox"
                      checked={isPrivateLog}
                      onChange={e => setIsPrivateLog(e.target.checked)}
                      className="rounded text-yellow-500"
                    />
                    <span className="font-bold">Internal Note (Tech Only)</span>
                  </label>
                )}
              </div>
              <button
                onClick={handleLogSubmit}
                disabled={uploading || !newLog.trim()}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <><Send size={13}/> Post Update</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
