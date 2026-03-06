'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Plus, Pencil, Trash2, Calendar, MapPin, Users } from 'lucide-react';

// Event type options with color mapping
const EVENT_TYPES = ['Concert', 'Sports', 'Festival'] as const;
const TYPE_COLORS: Record<string, string> = {
  Concert: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Sports: 'bg-green-500/20 text-green-400 border-green-500/30',
  Festival: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Custom: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

interface EventFormData {
  name: string;
  type: string;
  customType: string;
  date: string;
  venue: string;
  capacity: string;
}

interface Event {
  _id: Id<'events'>;
  name: string;
  type: string;
  customType?: string;
  date: string;
  venue: string;
  capacity: number;
  createdAt: number;
  updatedAt: number;
}

export default function EventManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    type: 'Concert',
    customType: '',
    date: '',
    venue: '',
    capacity: '',
  });

  // Convex mutations and queries
  const createEvent = useMutation(api.events.createEvent);
  const updateEvent = useMutation(api.events.updateEvent);
  const deleteEvent = useMutation(api.events.deleteEvent);
  const events = useQuery(api.events.getEvents, {});

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Concert',
      customType: '',
      date: '',
      venue: '',
      capacity: '',
    });
    setEditingEvent(null);
    setError(null);
  };

  // Open create dialog
  const handleCreateClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Open edit dialog
  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      type: event.type,
      customType: event.customType || '',
      date: event.date,
      venue: event.venue,
      capacity: event.capacity.toString(),
    });
    setError(null);
    setIsDialogOpen(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!formData.name.trim()) {
      setError('Event name is required');
      return;
    }
    if (!formData.date) {
      setError('Event date is required');
      return;
    }
    if (!formData.venue.trim()) {
      setError('Venue is required');
      return;
    }
    if (!formData.capacity || parseInt(formData.capacity) <= 0) {
      setError('Capacity must be greater than 0');
      return;
    }
    if (formData.type === 'Custom' && !formData.customType.trim()) {
      setError('Custom type name is required');
      return;
    }

    try {
      if (editingEvent) {
        // Update existing event
        await updateEvent({
          eventId: editingEvent._id,
          name: formData.name.trim(),
          type: formData.type,
          customType: formData.type === 'Custom' ? formData.customType.trim() : undefined,
          date: formData.date,
          venue: formData.venue.trim(),
          capacity: parseInt(formData.capacity),
        });
        setSuccessMessage('Event updated successfully');
      } else {
        // Create new event
        await createEvent({
          name: formData.name.trim(),
          type: formData.type,
          customType: formData.type === 'Custom' ? formData.customType.trim() : undefined,
          date: formData.date,
          venue: formData.venue.trim(),
          capacity: parseInt(formData.capacity),
        });
        setSuccessMessage('Event created successfully');
      }

      setIsDialogOpen(false);
      resetForm();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving event:', err);
      setError(err.message || 'Failed to save event');
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    try {
      await deleteEvent({ eventId: eventToDelete._id });
      setSuccessMessage('Event deleted successfully');
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error deleting event:', err);
      setError(err.message || 'Failed to delete event');
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

  // Get display type
  const getDisplayType = (event: Event) => {
    if (event.type === 'Custom' && event.customType) {
      return event.customType;
    }
    return event.type;
  };

  return (
    <div className="min-h-screen bg-[#101c22] flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-[#1a2f38]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Event Management</h1>
            <p className="text-[#9db0b9] text-sm mt-1">Create and manage events</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500 rounded-lg">
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Events List */}
          {events === undefined ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13a4ec]" />
            </div>
          ) : events === null || events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Events Yet</h3>
              <p className="text-[#9db0b9] mb-6">Create your first event to get started</p>
              <button
                onClick={handleCreateClick}
                className="bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Create Event
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event: any) => (
                <div
                  key={event._id}
                  className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38] hover:border-[#13a4ec]/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-white">{event.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            TYPE_COLORS[event.type] || TYPE_COLORS.Custom
                          }`}
                        >
                          {getDisplayType(event)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-[#9db0b9]">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#9db0b9]">
                          <MapPin className="w-4 h-4" />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#9db0b9]">
                          <Users className="w-4 h-4" />
                          <span>{event.capacity.toLocaleString()} attendees</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditClick(event)}
                        className="p-2 text-[#9db0b9] hover:text-[#13a4ec] hover:bg-[#13a4ec]/10 rounded-lg transition-colors"
                        title="Edit event"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(event)}
                        className="p-2 text-[#9db0b9] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2f38] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingEvent ? 'Edit Event' : 'Create Event'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Event Name */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Summer Music Festival 2026"
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                  />
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Event Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#13a4ec]"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {/* Custom Type (conditional) */}
                {formData.type === 'Custom' && (
                  <div>
                    <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                      Custom Type *
                    </label>
                    <input
                      type="text"
                      value={formData.customType}
                      onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                      placeholder="e.g., Conference, Workshop"
                      className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                    />
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#13a4ec]"
                  />
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Venue *
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g., Madison Square Garden"
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g., 50000"
                    min="1"
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
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
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 bg-[#1a2f38] hover:bg-[#24404d] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingEvent ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && eventToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2f38] rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-2">Delete Event</h2>
            <p className="text-[#9db0b9] mb-4">
              Are you sure you want to delete <span className="text-white font-semibold">{eventToDelete.name}</span>?
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setEventToDelete(null);
                }}
                className="flex-1 bg-[#1a2f38] hover:bg-[#24404d] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Delete
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
