'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Plus, Trash2, Edit, Calendar, MapPin, Store, Package, X, AlertTriangle } from 'lucide-react';

interface Event {
  _id: Id<'events'>;
  name: string;
  type: string;
  customType?: string;
  date: string;
  venue: string;
  capacity: number;
}

interface MerchantEventInventory {
  merchantEvent: {
    _id: Id<'merchantEvents'>;
    merchantId: Id<'merchants'>;
    eventId: Id<'events'>;
    boothNumber: string;
    createdAt: number;
    merchant: {
      businessName: string;
      email: string;
      walletAddress: string;
    };
  };
  items: Array<{
    _id: Id<'inventory'>;
    merchantEventId: Id<'merchantEvents'>;
    itemName: string;
    description?: string;
    price: number;
    stock?: number;
    createdAt: number;
    updatedAt: number;
  }>;
}

interface ItemFormData {
  itemName: string;
  description: string;
  price: string;
  stock: string;
}

export default function InventoryManagementPage() {
  const [selectedEventId, setSelectedEventId] = useState<Id<'events'> | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedMerchantEventId, setSelectedMerchantEventId] = useState<Id<'merchantEvents'> | null>(null);
  const [editingItemId, setEditingItemId] = useState<Id<'inventory'> | null>(null);
  const [itemToRemove, setItemToRemove] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<ItemFormData>({
    itemName: '',
    description: '',
    price: '',
    stock: '',
  });

  // Convex queries and mutations
  const events = useQuery(api.events.getEvents, {});
  const inventory = useQuery(
    api.inventory.getEventInventory,
    selectedEventId ? { eventId: selectedEventId } : 'skip'
  );

  const addItem = useMutation(api.inventory.addItem);
  const updateItem = useMutation(api.inventory.updateItem);
  const removeItem = useMutation(api.inventory.removeItem);

  // Get selected event details
  const selectedEvent = events?.find((e: Event) => e._id === selectedEventId);

  // Reset form
  const resetForm = () => {
    setFormData({
      itemName: '',
      description: '',
      price: '',
      stock: '',
    });
    setError(null);
  };

  // Open add item dialog
  const handleAddItemClick = (merchantEventId: Id<'merchantEvents'>) => {
    resetForm();
    setSelectedMerchantEventId(merchantEventId);
    setIsAddDialogOpen(true);
  };

  // Handle add item submission
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedMerchantEventId) {
      setError('Merchant event not selected');
      return;
    }

    if (!formData.itemName.trim()) {
      setError('Item name is required');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    const stockValue = formData.stock === '' ? undefined : parseInt(formData.stock);
    if (stockValue !== undefined && stockValue < 0) {
      setError('Stock cannot be negative');
      return;
    }

    try {
      await addItem({
        merchantEventId: selectedMerchantEventId,
        itemName: formData.itemName.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        stock: stockValue,
      });

      setSuccessMessage('Item added successfully');
      setIsAddDialogOpen(false);
      resetForm();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error adding item:', err);
      setError(err.message || 'Failed to add item');
    }
  };

  // Open edit item dialog
  const handleEditClick = (item: any) => {
    setEditingItemId(item._id);
    setFormData({
      itemName: item.itemName,
      description: item.description || '',
      price: item.price.toString(),
      stock: item.stock === undefined ? '' : item.stock.toString(),
    });
    setIsEditDialogOpen(true);
  };

  // Handle edit item submission
  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!editingItemId) {
      setError('Item not selected');
      return;
    }

    if (!formData.itemName.trim()) {
      setError('Item name is required');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    const stockValue = formData.stock === '' ? undefined : parseInt(formData.stock);
    if (stockValue !== undefined && stockValue < 0) {
      setError('Stock cannot be negative');
      return;
    }

    try {
      await updateItem({
        itemId: editingItemId,
        itemName: formData.itemName.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        stock: stockValue,
      });

      setSuccessMessage('Item updated successfully');
      setIsEditDialogOpen(false);
      setEditingItemId(null);
      resetForm();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating item:', err);
      setError(err.message || 'Failed to update item');
    }
  };

  // Open remove confirmation
  const handleRemoveClick = (item: any) => {
    setItemToRemove(item);
    setIsRemoveDialogOpen(true);
  };

  // Handle remove confirmation
  const handleRemoveConfirm = async () => {
    if (!itemToRemove) return;

    try {
      await removeItem({ itemId: itemToRemove._id });
      setSuccessMessage('Item removed successfully');
      setIsRemoveDialogOpen(false);
      setItemToRemove(null);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error removing item:', err);
      setError(err.message || 'Failed to remove item');
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

  // Check if stock is low
  const isLowStock = (stock?: number) => {
    return stock !== undefined && stock < 10 && stock > 0;
  };

  // Check if stock is out
  const isOutOfStock = (stock?: number) => {
    return stock === 0;
  };

  return (
    <div className="min-h-screen bg-[#101c22] flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-[#1a2f38]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Inventory Configuration</h1>
          <p className="text-[#9db0b9] text-sm mt-1">Configure items that merchants sell at events</p>
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

            {/* Right Panel: Inventory */}
            <div className="lg:col-span-2">
              {!selectedEvent ? (
                <div className="bg-[#1a2f38] rounded-lg p-8 border border-[#1a2f38]">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Select an Event</h3>
                    <p className="text-[#9db0b9]">Choose an event to view and configure inventory</p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1a2f38] rounded-lg p-4 border border-[#1a2f38]">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-white">{selectedEvent.name}</h2>
                    <p className="text-[#9db0b9] text-sm">
                      {formatDate(selectedEvent.date)} • {selectedEvent.venue}
                    </p>
                  </div>

                  {inventory === undefined ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13a4ec]" />
                    </div>
                  ) : inventory === null || inventory.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-2">📦</div>
                      <h3 className="text-lg font-semibold text-white mb-2">No Inventory Configured</h3>
                      <p className="text-[#9db0b9] text-sm">
                        Add merchants to this event first, then configure their items
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inventory.map((merchantInventory: MerchantEventInventory) => (
                        <div
                          key={merchantInventory.merchantEvent._id}
                          className="bg-[#101c22] rounded-lg p-4 border border-[#1a2f38]"
                        >
                          {/* Merchant Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Store className="w-4 h-4 text-[#13a4ec]" />
                              <h3 className="font-semibold text-white">
                                {merchantInventory.merchantEvent.merchant.businessName}
                              </h3>
                              <span className="px-2 py-0.5 bg-[#13a4ec]/20 text-[#13a4ec] rounded text-xs font-medium border border-[#13a4ec]/30">
                                Booth {merchantInventory.merchantEvent.boothNumber}
                              </span>
                            </div>
                            <button
                              onClick={() => handleAddItemClick(merchantInventory.merchantEvent._id)}
                              className="flex items-center gap-1 bg-[#13a4ec] hover:bg-[#0d8ac4] text-white text-sm font-semibold py-1.5 px-3 rounded-lg transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              Add Item
                            </button>
                          </div>

                          {/* Items List */}
                          {merchantInventory.items.length === 0 ? (
                            <div className="text-center py-4 text-[#9db0b9] text-sm">
                              No items configured for this merchant
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {merchantInventory.items.map((item) => (
                                <div
                                  key={item._id}
                                  className={`bg-[#1a2f38] rounded-lg p-3 border ${
                                    isOutOfStock(item.stock)
                                      ? 'border-red-500/50'
                                      : isLowStock(item.stock)
                                        ? 'border-yellow-500/50'
                                        : 'border-[#24404d]'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Package className="w-3 h-3 text-[#13a4ec]" />
                                        <h4 className="font-medium text-white text-sm">{item.itemName}</h4>
                                        {isOutOfStock(item.stock) && (
                                          <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium border border-red-500/30">
                                            Out of Stock
                                          </span>
                                        )}
                                        {isLowStock(item.stock) && (
                                          <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium border border-yellow-500/30 flex items-center gap-1">
                                            <AlertTriangle className="w-2.5 h-2.5" />
                                            Low Stock
                                          </span>
                                        )}
                                      </div>

                                      {item.description && (
                                        <p className="text-[#9db0b9] text-xs mb-2">{item.description}</p>
                                      )}

                                      <div className="flex items-center gap-3 text-xs">
                                        <span className="text-[#13a4ec] font-semibold">{item.price} EVT</span>
                                        <span className="text-[#9db0b9]">
                                          Stock:{' '}
                                          {item.stock === undefined
                                            ? 'Unlimited'
                                            : item.stock === 0
                                              ? '0'
                                              : item.stock}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleEditClick(item)}
                                        className="p-1.5 text-[#9db0b9] hover:text-white hover:bg-[#13a4ec]/20 rounded-lg transition-colors"
                                        title="Edit item"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleRemoveClick(item)}
                                        className="p-1.5 text-[#9db0b9] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Remove item"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
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

      {/* Add Item Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2f38] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Add Item</h2>
                <button
                  onClick={() => setIsAddDialogOpen(false)}
                  className="text-[#9db0b9] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-4">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    placeholder="e.g., Beer, Hot Dog, T-Shirt"
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional item description"
                    rows={2}
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Price (EVT) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="5.00"
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                    required
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Stock (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                  />
                  <p className="text-xs text-[#9db0b9] mt-1">Leave empty for unlimited items</p>
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
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2f38] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Edit Item</h2>
                <button
                  onClick={() => setIsEditDialogOpen(false)}
                  className="text-[#9db0b9] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditItem} className="space-y-4">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    placeholder="e.g., Beer, Hot Dog, T-Shirt"
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional item description"
                    rows={2}
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Price (EVT) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="5.00"
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                    required
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Stock (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                  />
                  <p className="text-xs text-[#9db0b9] mt-1">Leave empty for unlimited items</p>
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
                    onClick={() => setIsEditDialogOpen(false)}
                    className="flex-1 bg-[#1a2f38] hover:bg-[#24404d] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      {isRemoveDialogOpen && itemToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2f38] rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-2">Remove Item</h2>
            <p className="text-[#9db0b9] mb-4">
              Are you sure you want to remove{' '}
              <span className="text-white font-semibold">{itemToRemove.itemName}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsRemoveDialogOpen(false);
                  setItemToRemove(null);
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
