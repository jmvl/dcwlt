'use client';

import { useMerchantAuth } from '../components/MerchantAuthProvider';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Building2,
  Wallet,
  Calendar,
  MapPin,
  Package,
  TrendingUp,
} from 'lucide-react';

export default function MerchantDashboard() {
  const { merchant } = useMerchantAuth();

  // Get merchant's wallet balance
  const wallet = useQuery(
    api.wallets.getWalletByAddress,
    merchant?.walletAddress ? { walletAddress: merchant.walletAddress } : 'skip'
  );

  // Get merchant's event assignments
  const assignments = useQuery(
    api.merchantEvents.getMerchantAssignments,
    merchant?._id ? { merchantId: merchant._id } : 'skip'
  );

  // Calculate total sales (placeholder for now - will be implemented in later phase)
  const totalSales = 0;
  const recentSales: any[] = [];

  // Get upcoming events (events with date in the future)
  const upcomingEvents = assignments?.filter((assignment: any) => {
    if (!assignment.event?.date) return false;
    return new Date(assignment.event.date) > new Date();
  }) || [];

  // Get past events (events with date in the past)
  const pastEvents = assignments?.filter((assignment: any) => {
    if (!assignment.event?.date) return false;
    return new Date(assignment.event.date) <= new Date();
  }) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Merchant Dashboard</h1>
        <p className="text-[#9db0b9] mt-1">
          Welcome back, {merchant?.businessName || 'Merchant'}
        </p>
      </div>

      {/* Business Info Card */}
      <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38]">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-6 h-6 text-[#13a4ec]" />
          <h2 className="text-xl font-bold text-white">Business Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#9db0b9]">Business Name</p>
            <p className="text-lg font-medium text-white">{merchant?.businessName}</p>
          </div>
          <div>
            <p className="text-sm text-[#9db0b9]">Email</p>
            <p className="text-lg font-medium text-white">{merchant?.email}</p>
          </div>
          <div>
            <p className="text-sm text-[#9db0b9]">Wallet Address</p>
            <p className="text-sm font-mono text-[#9db0b9] break-all">
              {merchant?.walletAddress || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#9db0b9]">Status</p>
            <p className="text-lg font-medium text-green-400">
              {merchant?.status === 'approved' ? 'Active' : merchant?.status}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance */}
        <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38]">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-5 h-5 text-[#13a4ec]" />
            <p className="text-sm text-[#9db0b9]">Wallet Balance</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {wallet?.tokenBalance.toLocaleString() || 0} <span className="text-lg">EVT</span>
          </p>
          {wallet?.fiatBalance && (
            <p className="text-sm text-[#9db0b9] mt-1">
              ≈ ${wallet.fiatBalance.toFixed(2)} USD
            </p>
          )}
        </div>

        {/* Total Sales (placeholder) */}
        <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38]">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-[#13a4ec]" />
            <p className="text-sm text-[#9db0b9]">Total Sales</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {totalSales.toLocaleString()} <span className="text-lg">EVT</span>
          </p>
          <p className="text-sm text-[#9db0b9] mt-1">
            Sales tracking coming soon
          </p>
        </div>

        {/* Event Count */}
        <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38]">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-[#13a4ec]" />
            <p className="text-sm text-[#9db0b9]">Upcoming Events</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {upcomingEvents.length}
          </p>
          <p className="text-sm text-[#9db0b9] mt-1">
            {pastEvents.length} past events
          </p>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38]">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-[#13a4ec]" />
            <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
          </div>
          <div className="space-y-3">
            {upcomingEvents.slice(0, 5).map((assignment: any) => (
              <div
                key={assignment._id}
                className="bg-[#101c22] rounded-lg p-4 border border-[#1a2f38]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      {assignment.event?.name || 'Unknown Event'}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[#9db0b9]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {assignment.event?.venue || 'TBD'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Booth {assignment.boothNumber}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#9db0b9]">
                      {new Date(assignment.event?.date || 0).toLocaleDateString()}
                    </p>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-[#243b47] text-[#9db0b9] rounded">
                      {assignment.event?.type || 'Event'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sales (placeholder) */}
      <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38]">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-[#13a4ec]" />
          <h2 className="text-xl font-bold text-white">Recent Sales</h2>
        </div>
        {recentSales.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#9db0b9]">No sales yet</p>
            <p className="text-sm text-[#9db0b9] mt-1">
              Sales tracking will be available once customers start making purchases
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-[#101c22] rounded-lg p-4 border border-[#1a2f38]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{sale.item}</p>
                    <p className="text-sm text-[#9db0b9]">{sale.date}</p>
                  </div>
                  <p className="text-lg font-bold text-white">{sale.amount} EVT</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Events (collapsed if many) */}
      {pastEvents.length > 0 && (
        <div className="bg-[#1a2f38] rounded-lg p-6 border border-[#1a2f38]">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-[#9db0b9]" />
            <h2 className="text-xl font-bold text-white">Past Events</h2>
          </div>
          <div className="space-y-3">
            {pastEvents.slice(0, 3).map((assignment: any) => (
              <div
                key={assignment._id}
                className="bg-[#101c22] rounded-lg p-4 border border-[#1a2f38] opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      {assignment.event?.name || 'Unknown Event'}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[#9db0b9]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {assignment.event?.venue || 'TBD'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Booth {assignment.boothNumber}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#9db0b9]">
                      {new Date(assignment.event?.date || 0).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {pastEvents.length > 3 && (
              <p className="text-sm text-[#9db0b9] text-center">
                +{pastEvents.length - 3} more past events
              </p>
            )}
          </div>
        </div>
      )}

      {/* No Events State */}
      {assignments?.length === 0 && (
        <div className="bg-[#1a2f38] rounded-lg p-12 border border-[#1a2f38] text-center">
          <Calendar className="w-12 h-12 text-[#9db0b9] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Events Yet</h2>
          <p className="text-[#9db0b9]">
            You haven't been assigned to any events yet.
            <br />
            Contact an administrator to get assigned to an event.
          </p>
        </div>
      )}
    </div>
  );
}
