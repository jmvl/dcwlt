'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Users,
  Calendar,
  Link as LinkIcon,
  Package,
  Plus,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  // Queries for metrics
  const allMerchants = useQuery(api.merchants.getAllMerchants, {});
  const pendingMerchants = useQuery(api.merchants.getMerchantsByStatus, { status: 'pending' });
  const approvedMerchants = useQuery(api.merchants.getMerchantsByStatus, { status: 'approved' });
  const rejectedMerchants = useQuery(api.merchants.getMerchantsByStatus, { status: 'rejected' });
  const events = useQuery(api.events.getEvents, {});

  // Calculate metrics
  const totalMerchants = allMerchants?.length || 0;
  const pendingCount = pendingMerchants?.length || 0;
  const approvedCount = approvedMerchants?.length || 0;
  const rejectedCount = rejectedMerchants?.length || 0;

  // Get upcoming events (filter events after today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events?.filter((event: any) => {
    const eventDate = new Date(event.date);
    return eventDate >= today;
  }) || [];
  const activeEventsCount = upcomingEvents.length;

  // Calculate total assignments and inventory (these would require additional queries)
  // For now, we'll show placeholder values
  const totalAssignments = 0; // TODO: Add query to count all merchantEvent assignments
  const totalInventory = 0; // TODO: Add query to count all inventory items

  // Get recent merchant registrations (last 5)
  const recentMerchants = allMerchants?.slice(0, 5) || [];

  // Get next upcoming event
  const nextEvent = upcomingEvents[0];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-2 text-[#9db0b9]">Overview of your merchant management system</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Merchants */}
        <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38] hover:border-[#13a4ec]/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-[#13a4ec]" />
            <span className="text-xs text-[#9db0b9]">Total</span>
          </div>
          <div className="text-3xl font-bold text-white">{totalMerchants}</div>
          <div className="text-xs text-[#9db0b9] mt-2">
            {approvedCount} approved, {pendingCount} pending, {rejectedCount} rejected
          </div>
        </div>

        {/* Active Events */}
        <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38] hover:border-[#13a4ec]/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-[#13a4ec]" />
            <span className="text-xs text-[#9db0b9]">Active</span>
          </div>
          <div className="text-3xl font-bold text-white">{activeEventsCount}</div>
          <div className="text-xs text-[#9db0b9] mt-2">
            {nextEvent ? `Next: ${nextEvent.name}` : 'No upcoming events'}
          </div>
        </div>

        {/* Total Assignments */}
        <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38] hover:border-[#13a4ec]/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <LinkIcon className="w-5 h-5 text-[#13a4ec]" />
            <span className="text-xs text-[#9db0b9]">Total</span>
          </div>
          <div className="text-3xl font-bold text-white">{totalAssignments}</div>
          <div className="text-xs text-[#9db0b9] mt-2">
            Across {activeEventsCount} events
          </div>
        </div>

        {/* Total Inventory */}
        <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38] hover:border-[#13a4ec]/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-[#13a4ec]" />
            <span className="text-xs text-[#9db0b9]">Items</span>
          </div>
          <div className="text-3xl font-bold text-white">{totalInventory}</div>
          <div className="text-xs text-[#9db0b9] mt-2">
            Across {approvedCount} merchants
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="bg-[#1a2f38] rounded-lg border border-[#1a2f38]">
          <div className="p-4 border-b border-[#1a2f38] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Registrations</h2>
            <Link
              href="/admin"
              className="text-sm text-[#13a4ec] hover:text-[#0d8ac4]"
            >
              View All
            </Link>
          </div>
          <div className="p-4">
            {recentMerchants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#9db0b9]">No merchant registrations yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMerchants.map((merchant: any) => (
                  <div
                    key={merchant._id}
                    className="flex items-center justify-between p-3 bg-[#101c22] rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{merchant.businessName}</p>
                      <p className="text-xs text-[#9db0b9]">
                        {new Date(merchant.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        merchant.status === 'approved'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : merchant.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {merchant.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-[#1a2f38] rounded-lg border border-[#1a2f38]">
          <div className="p-4 border-b border-[#1a2f38] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
            <Link
              href="/admin/events"
              className="text-sm text-[#13a4ec] hover:text-[#0d8ac4]"
            >
              View All
            </Link>
          </div>
          <div className="p-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#9db0b9]">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map((event: any) => (
                  <div
                    key={event._id}
                    className="flex items-center justify-between p-3 bg-[#101c22] rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{event.name}</p>
                      <p className="text-xs text-[#9db0b9]">
                        {new Date(event.date).toLocaleDateString()} • {event.venue}
                      </p>
                    </div>
                    <span className="text-xs text-[#9db0b9]">{event.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#1a2f38] rounded-lg border border-[#1a2f38] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/events"
            className="flex items-center gap-3 p-4 bg-[#13a4ec] hover:bg-[#0d8ac4] rounded-lg transition-colors group"
          >
            <Plus className="w-5 h-5 text-white" />
            <div>
              <p className="text-sm font-medium text-white">Create New Event</p>
              <p className="text-xs text-white/70">Add a new event to the system</p>
            </div>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-3 p-4 bg-[#1a2f38] hover:bg-[#243b47] rounded-lg transition-colors border border-[#13a4ec]/50"
          >
            <Users className="w-5 h-5 text-[#13a4ec]" />
            <div>
              <p className="text-sm font-medium text-white">Review Pending Merchants</p>
              <p className="text-xs text-[#9db0b9]">
                {pendingCount} merchant{pendingCount !== 1 ? 's' : ''} awaiting approval
              </p>
            </div>
          </Link>

          <Link
            href="/admin/inventory"
            className="flex items-center gap-3 p-4 bg-[#1a2f38] hover:bg-[#243b47] rounded-lg transition-colors border border-[#13a4ec]/50"
          >
            <Package className="w-5 h-5 text-[#13a4ec]" />
            <div>
              <p className="text-sm font-medium text-white">Configure Inventory</p>
              <p className="text-xs text-[#9db0b9]">Manage products and pricing</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">Pending Review Required</p>
            <p className="text-xs text-[#9db0b9]">
              You have {pendingCount} merchant{pendingCount !== 1 ? 's' : ''} awaiting approval
            </p>
          </div>
          <Link
            href="/admin"
            className="ml-auto px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Review Now
          </Link>
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';
