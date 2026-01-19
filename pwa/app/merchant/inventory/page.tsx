'use client';

import { useState } from 'react';
import { useMerchantAuth } from '../../components/MerchantAuthProvider';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Loader2, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import MerchantInventory from '../../components/MerchantInventory';

export default function MerchantInventoryPage() {
  const { merchant } = useMerchantAuth();
  const [selectedEventId, setSelectedEventId] = useState<Id<'events'> | null>(null);

  // Query merchant's event assignments
  const assignments = useQuery(
    api.merchantEvents.getMerchantAssignments,
    merchant?._id ? { merchantId: merchant._id } : 'skip'
  );

  // Auto-select first event if available and no event selected
  if (assignments && assignments.length > 0 && !selectedEventId) {
    setSelectedEventId(assignments[0]._id);
  }

  // Handle loading state
  if (assignments === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#13a4ec] animate-spin" />
      </div>
    );
  }

  // Handle empty state - no events assigned
  if (assignments === null || assignments.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-[#1a2f38] rounded-lg p-12 border border-[#1a2f38] text-center">
          <CalendarIcon className="w-12 h-12 text-[#9db0b9] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Events Assigned</h2>
          <p className="text-[#9db0b9]">
            You haven't been assigned to any events yet.
            <br />
            Contact your admin to get assigned to an event.
          </p>
        </div>
      </div>
    );
  }

  // Get selected assignment
  const selectedAssignment = assignments.find((a: any) => a._id === selectedEventId);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Inventory</h1>
        <p className="text-[#9db0b9] mt-1">View your assigned items for each event</p>
      </div>

      {/* Event Selector */}
      {assignments.length > 1 && (
        <div className="bg-[#1a2f38] rounded-lg p-4 border border-[#1a2f38]">
          <label className="block text-sm font-medium text-[#9db0b9] mb-2">
            Select Event
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {assignments.map((assignment: any) => {
              const isSelected = assignment._id === selectedEventId;
              const event = assignment.event;

              return (
                <button
                  key={assignment._id}
                  onClick={() => setSelectedEventId(assignment._id)}
                  className={`text-left p-4 rounded-lg border-2 transition-colors ${
                    isSelected
                      ? 'bg-[#13a4ec]/20 border-[#13a4ec]'
                      : 'bg-[#101c22] border-[#1a2f38] hover:border-[#13a4ec]/50'
                  }`}
                >
                  <div className="font-semibold text-white mb-1">{event?.name || 'Unknown Event'}</div>
                  <div className="flex items-center gap-1 text-xs text-[#9db0b9] mb-1">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{event?.date ? new Date(event.date).toLocaleDateString() : 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#9db0b9]">
                    <MapPin className="w-3 h-3" />
                    <span>{event?.venue || 'TBD'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Inventory Content */}
      {selectedAssignment && (
        <MerchantInventory
          merchantEventId={selectedAssignment._id}
          merchantId={merchant!._id}
        />
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';
