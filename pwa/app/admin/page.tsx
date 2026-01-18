"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { usePrivyAuth } from "@/app/hooks/usePrivyAuth";

type MerchantStatus = "pending" | "approved" | "rejected";

interface Merchant {
  _id: Id<"merchants">;
  name: string;
  email: string;
  businessName: string;
  businessType: string;
  description: string;
  website?: string;
  status: MerchantStatus;
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  notes?: string;
}

export default function AdminDashboard() {
  const { ready, user } = usePrivyAuth();
  const [selectedStatus, setSelectedStatus] = useState<MerchantStatus | "all">("all");
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  // Queries
  const allMerchants = useQuery(api.merchants.getAllMerchants, {});
  const pendingMerchants = useQuery(api.merchants.getMerchantsByStatus, { status: "pending" });
  const approvedMerchants = useQuery(api.merchants.getMerchantsByStatus, { status: "approved" });
  const rejectedMerchants = useQuery(api.merchants.getMerchantsByStatus, { status: "rejected" });

  // Mutations
  const approveMerchant = useMutation(api.merchants.approveMerchant);
  const rejectMerchant = useMutation(api.merchants.rejectMerchant);

  // Filter merchants based on selected status
  const filteredMerchants = (() => {
    if (!allMerchants) return [];
    if (selectedStatus === "all") return allMerchants;
    return allMerchants.filter((m: Merchant) => m.status === selectedStatus);
  })();

  // Check if user is admin (you can customize this logic)
  const userEmail = user?.email as string | undefined;
  const isAdmin = userEmail?.endsWith("@dcwlt.com") || false;

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const handleApprove = async (merchantId: Id<"merchants">, notes?: string) => {
    await approveMerchant({ merchantId, adminNotes: notes });
    setSelectedMerchant(null);
  };

  const handleReject = async (merchantId: Id<"merchants">, reason?: string) => {
    await rejectMerchant({ merchantId, rejectionReason: reason });
    setSelectedMerchant(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Merchant Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Review and manage merchant applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Merchants</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{allMerchants?.length || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Pending Review</div>
            <div className="mt-2 text-3xl font-bold text-yellow-600">{pendingMerchants?.length || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Approved</div>
            <div className="mt-2 text-3xl font-bold text-green-600">{approvedMerchants?.length || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Rejected</div>
            <div className="mt-2 text-3xl font-bold text-red-600">{rejectedMerchants?.length || 0}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status as MerchantStatus | "all")}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    selectedStatus === status
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== "all" && (
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100">
                      {
                        (status === "pending" ? pendingMerchants :
                         status === "approved" ? approvedMerchants :
                         status === "rejected" ? rejectedMerchants : allMerchants
                        )?.length || 0
                      }
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Merchant List */}
        <div className="bg-white rounded-lg shadow">
          {filteredMerchants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No merchants found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Merchant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMerchants.map((merchant: Merchant) => (
                    <tr key={merchant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{merchant.name}</div>
                          <div className="text-sm text-gray-500">{merchant.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{merchant.businessName}</div>
                        {merchant.website && (
                          <a
                            href={merchant.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Website
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {merchant.businessType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          merchant.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : merchant.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {merchant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(merchant.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {merchant.status === "pending" && (
                          <>
                            <button
                              onClick={() => setSelectedMerchant(merchant)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Review
                            </button>
                          </>
                        )}
                        {merchant.status !== "pending" && (
                          <button
                            onClick={() => setSelectedMerchant(merchant)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Merchant Detail Modal */}
        {selectedMerchant && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Merchant Details</h3>
                  <button
                    onClick={() => setSelectedMerchant(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMerchant.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMerchant.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMerchant.businessName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMerchant.businessType}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedMerchant.description}</p>
                  </div>

                  {selectedMerchant.website && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Website</label>
                      <a
                        href={selectedMerchant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-sm text-blue-600 hover:underline"
                      >
                        {selectedMerchant.website}
                      </a>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedMerchant.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : selectedMerchant.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {selectedMerchant.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Applied On</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedMerchant.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {selectedMerchant.reviewedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reviewed On</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedMerchant.reviewedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {selectedMerchant.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedMerchant.notes}</p>
                    </div>
                  )}

                  {selectedMerchant.status === "pending" && (
                    <div className="pt-4 border-t">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Decision
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(selectedMerchant._id)}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Enter rejection reason:");
                            if (reason) {
                              handleReject(selectedMerchant._id, reason);
                            }
                          }}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
