'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Plus, Trash2, Calendar, MapPin, Store, X } from 'lucide-react';

interface Event {
  _id: Id<'events'>;
  name: string;
  type: string;
  customType?: string;
  date: string;
  venue: string;
  capacity: number;
}

interface Merchant {
  _id: Id<'merchants'>;
  email: string;
  businessName: string;
  walletAddress: string;
  status: string;
}

interface MerchantEvent {
  _id: Id<'merchantEvents'>;
  merchantId: Id<'merchants'>;
  eventId: Id<'events'>;
  boothNumber: string;
  createdAt: number;
  merchant: {
    businessName: string;
    email: string;
    walletAddress: string;
    status: string;
  } | null;
}

export default function AssignmentManagementPage() {
  const [selectedEventId, setSelectedEventId] = useState<Id<'events'> | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [assignmentToRemove, setAssignmentToRemove] = useState<MerchantEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add merchant form state
  const [selectedMerchantId, setSelectedMerchantId] = useState<Id<'merchants'> | null>(null);
  const [boothNumber, setBoothNumber] = useState('');

  // Convex queries and mutations
  const events = useQuery(api.events.getEvents, {});
  const approvedMerchants = useQuery(api.merchants.getMerchantsByStatus, { status: 'approved' });
  const assignments = useQuery(
    api.merchantEvents.getEventAssignments,
    selectedEventId ? { eventId: selectedEventId } : 'skip'
  );

  const assignMerchant = useMutation(api.merchantEvents.assignMerchantToEvent);
  const removeMerchant = useMutation(api.merchantEvents.removeMerchantFromEvent);

  // Get selected event details
  const selectedEvent = events?.find((e: Event) => e._id === selectedEventId);

  // Reset form
  const resetForm = () => {
    setSelectedMerchantId(null);
    setBoothNumber('');
    setError(null);
  };

  // Open add merchant dialog
  const handleAddMerchantClick = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  // Handle add merchant submission
  const handleAddMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedEventId) {
      setError('Please select an event first');
      return;
    }

    if (!selectedMerchantId) {
      setError('Please select a merchant');
      return;
    }

    if (!boothNumber.trim()) {
      setError('Booth number is required');
      return;
    }

    try {
      await assignMerchant({
        merchantId: selectedMerchantId,
        eventId: selectedEventId,
        boothNumber: boothNumber.trim(),
      });

      setSuccessMessage('Merchant assigned successfully');
      setIsAddDialogOpen(false);
      resetForm();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error assigning merchant:', err);
      setError(err.message || 'Failed to assign merchant');
    }
  };

  // Open remove confirmation
  const handleRemoveClick = (assignment: MerchantEvent) => {
    setAssignmentToRemove(assignment);
    setIsRemoveDialogOpen(true);
  };

  // Handle remove confirmation
  const handleRemoveConfirm = async () => {
    if (!assignmentToRemove) return;

    try {
      await removeMerchant({ merchantEventId: assignmentToRemove._id });
      setSuccessMessage('Merchant removed successfully');
      setIsRemoveDialogOpen(false);
      setAssignmentToRemove(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error removing merchant:', err);
      setError(err.message || 'Failed to remove merchant');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Truncate wallet address
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  // Get display type
  const getDisplayType = (event: Event) => {
    if (event.type === 'Custom' && event.customType) {
      return event.customType;
    }
    return event.type;
  };

  // Get type color
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Concert: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Sports: 'bg-green-500/20 text-green-400 border-green-500/30',
      Festival: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      Custom: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[type] || colors.Custom;
  };

  return (
    <div className="min-h-screen bg-[#101c22] flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-[#1a2f38]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Merchant Assignments</h1>
          <p className="text-[#9db0b9] text-sm mt-1">Assign merchants to events with booth locations</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500 rounded-lg">
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel: Event List */}
            <div className="lg:col-span-1">
              <div className="bg-[#1a2f38] rounded-lg p-4 border border-[#1a2f38]">
                <h2 className="text-lg font-semibold text-white mb-4">Events</h2>

                {events === undefined ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13a4ec]" />
                  </div>
                ) : events === null || events.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-[#9db0b9] text-sm">No events available</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {events.map((event: Event) => {
                      const isSelected = event._id === selectedEventId;
                      return (
                        <button
                          key={event._id}
                          onClick={() => setSelectedEventId(event._id)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-[#13a4ec]/20 border-2 border-[#13a4ec]'
                              : 'bg-[#101c22] border-2 border-[#1a2f38] hover:border-[#13a4ec]/50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-white text-sm">{event.name}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                getTypeColor(event.type)
                              }`}
                            >
                              {getDisplayType(event)}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs text-[#9db0b9]">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{event.venue}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Assignments */}
            <div className="lg:col-span-2">
              {!selectedEvent ? (
                <div className="bg-[#1a2f38] rounded-lg p-8 border border-[#1a2f38]">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Select an Event</h3>
                    <p className="text-[#9db0b9]">Choose an event from the list to view and manage merchant assignments</p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1a2f38] rounded-lg p-4 border border-[#1a2f38]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{selectedEvent.name}</h2>
                      <p className="text-[#9db0b9] text-sm">
                        {formatDate(selectedEvent.date)} • {selectedEvent.venue}
                      </p>
                    </div>
                    <button
                      onClick={handleAddMerchantClick}
                      className="flex items-center gap-2 bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Merchant
                    </button>
                  </div>

                  {assignments === undefined ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13a4ec]" />
                    </div>
                  ) : assignments === null || assignments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-2">🏪</div>
                      <h3 className="text-lg font-semibold text-white mb-2">No Merchants Assigned</h3>
                      <p className="text-[#9db0b9] text-sm mb-4">Add merchants to this event to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assignments.map((assignment: MerchantEvent) => (
                        <div
                          key={assignment._id}
                          className="bg-[#101c22] rounded-lg p-4 border border-[#1a2f38]"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Store className="w-4 h-4 text-[#13a4ec]" />
                                <h3 className="font-semibold text-white">
                                  {assignment.merchant?.businessName || 'Unknown'}
                                </h3>
                                <span className="px-2 py-0.5 bg-[#13a4ec]/20 text-[#13a4ec] rounded text-xs font-medium border border-[#13a4ec]/30">
                                  Booth {assignment.boothNumber}
                                </span>
                              </div>

                              <div className="space-y-1 text-xs text-[#9db0b9]">
                                <div>Email: {assignment.merchant?.email || 'N/A'}</div>
                                <div>Wallet: {truncateAddress(assignment.merchant?.walletAddress || '')}</div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveClick(assignment)}
                              className="p-2 text-[#9db0b9] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Remove merchant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Merchant Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2f38] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Add Merchant to Event</h2>
                <button
                  onClick={() => setIsAddDialogOpen(false)}
                  className="text-[#9db0b9] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMerchant} className="space-y-4">
                {/* Event Info */}
                {selectedEvent && (
                  <div className="p-3 bg-[#101c22] rounded-lg border border-[#1a2f38]">
                    <p className="text-xs text-[#9db0b9] mb-1">Adding to event:</p>
                    <p className="text-sm font-semibold text-white">{selectedEvent.name}</p>
                  </div>
                )}

                {/* Merchant Selection */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Select Merchant *
                  </label>
                  <select
                    value={selectedMerchantId?.toString() || ''}
                    onChange={(e) => setSelectedMerchantId(e.target.value as any)}
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#13a4ec]"
                    required
                  >
                    <option value="">Choose a merchant...</option>
                    {approvedMerchants?.map((merchant: Merchant) => (
                      <option key={merchant._id} value={merchant._id.toString()}>
                        {merchant.businessName} ({merchant.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Booth Number */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Booth Number *
                  </label>
                  <input
                    type="text"
                    value={boothNumber}
                    onChange={(e) => setBoothNumber(e.target.value)}
                    placeholder="e.g., A1, B12, Food Court 3"
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                    required
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1 bg-[#1a2f38] hover:bg-[#24404d] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Add Merchant
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      {isRemoveDialogOpen && assignmentToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2f38] rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-2">Remove Merchant</h2>
            <p className="text-[#9db0b9] mb-4">
              Are you sure you want to remove{' '}
              <span className="text-white font-semibold">
                {assignmentToRemove.merchant?.businessName || 'this merchant'}
              </span>{' '}
              from booth {assignmentToRemove.boothNumber}?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsRemoveDialogOpen(false);
                  setAssignmentToRemove(null);
                }}
                className="flex-1 bg-[#1a2f38] hover:bg-[#24404d] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
