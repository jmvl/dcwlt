'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Plus, Trash2, Edit, X, Calendar, MapPin, Package, AlertTriangle } from 'lucide-react';
import { TabNavigation } from './components/TabNavigation';
import { GroupCard } from './components/GroupCard';
import { ItemCard } from './components/ItemCard';

interface Event {
  _id: Id<'events'>;
  name: string;
  type: string;
  customType?: string;
  date: string;
  venue: string;
  capacity: number;
}

interface ItemGroup {
  _id: Id<'itemGroups'>;
  name: string;
  description?: string;
  order: number;
  itemCount: number;
}

interface GroupItem {
  _id: Id<'groupItems'>;
  name: string;
  description?: string;
  defaultPrice: number;
  defaultStock?: number;
  order: number;
}

interface MerchantEvent {
  _id: Id<'merchantEvents'>;
  merchantId: Id<'merchants'>;
  eventId: Id<'events'>;
  boothNumber: string;
  merchant: {
    businessName: string;
    email: string;
    walletAddress: string;
  };
}

interface GroupAssignment {
  _id: Id<'merchantGroupAssignments'>;
  merchantEventId: Id<'merchantEvents'>;
  itemGroupId: Id<'itemGroups'>;
  enabled: boolean;
  order: number;
  group?: ItemGroup;
}

type DialogType = 'none' | 'addGroup' | 'editGroup' | 'deleteGroup' | 'addItem' | 'editItem' | 'deleteItem';

export default function InventoryManagementPage() {
  // State
  const [selectedEventId, setSelectedEventId] = useState<Id<'events'> | null>(null);
  const [activeTab, setActiveTab] = useState<'groups' | 'assignments'>('groups');
  const [selectedGroupId, setSelectedGroupId] = useState<Id<'itemGroups'> | null>(null);
  const [selectedMerchantEventId, setSelectedMerchantEventId] = useState<Id<'merchantEvents'> | null>(null);
  const [dialogType, setDialogType] = useState<DialogType>('none');
  const [editingEntity, setEditingEntity] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
  });

  // Queries
  const events = useQuery(api.events.getEvents, {});

  // Item groups queries
  const itemGroups = useQuery(
    api.itemGroups.getEventItemGroups,
    selectedEventId ? { eventId: selectedEventId } : 'skip'
  );

  const groupWithItems = useQuery(
    api.itemGroups.getGroupItems,
    selectedGroupId ? { itemGroupId: selectedGroupId } : 'skip'
  );

  // Merchant assignments queries
  const merchantEvents = useQuery(
    api.merchantEvents.getEventAssignments,
    selectedEventId ? { eventId: selectedEventId } : 'skip'
  );

  const merchantAssignments = useQuery(
    api.itemGroups.getMerchantGroupAssignments,
    selectedMerchantEventId ? { merchantEventId: selectedMerchantEventId } : 'skip'
  );

  // Mutations
  const createGroup = useMutation(api.itemGroups.createGroup);
  const updateGroup = useMutation(api.itemGroups.updateGroup);
  const deleteGroup = useMutation(api.itemGroups.deleteGroup);

  const addItemToGroup = useMutation(api.itemGroups.addItemToGroup);
  const updateItemInGroup = useMutation(api.itemGroups.updateItemInGroup);
  const removeItemFromGroup = useMutation(api.itemGroups.removeItemFromGroup);

  const assignGroupToMerchant = useMutation(api.itemGroups.assignGroupToMerchant);
  const unassignGroupFromMerchant = useMutation(api.itemGroups.unassignGroupFromMerchant);
  const toggleGroupEnabled = useMutation(api.itemGroups.toggleGroupEnabled);

  // Get selected event
  const selectedEvent = events?.find((e: Event) => e._id === selectedEventId);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
    });
    setError(null);
  };

  // Show success message
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Open dialog handlers
  const openAddGroupDialog = () => {
    resetForm();
    setDialogType('addGroup');
  };

  const openEditGroupDialog = (group: ItemGroup) => {
    setEditingEntity(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      price: '',
      stock: '',
    });
    setDialogType('editGroup');
  };

  const openDeleteGroupDialog = (group: ItemGroup) => {
    setEditingEntity(group);
    setDialogType('deleteGroup');
  };

  const openAddItemDialog = () => {
    resetForm();
    setDialogType('addItem');
  };

  const openEditItemDialog = (item: GroupItem) => {
    setEditingEntity(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.defaultPrice.toString(),
      stock: item.defaultStock === undefined ? '' : item.defaultStock.toString(),
    });
    setDialogType('editItem');
  };

  const openDeleteItemDialog = (item: GroupItem) => {
    setEditingEntity(item);
    setDialogType('deleteItem');
  };

  const closeDialog = () => {
    setDialogType('none');
    setEditingEntity(null);
    resetForm();
  };

  // Form submission handlers
  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedEventId) {
      setError('Please select an event first');
      return;
    }

    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      // Get current order
      const currentOrder = itemGroups?.length || 0;

      await createGroup({
        eventId: selectedEventId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        order: currentOrder,
      });

      showSuccess('Item group created successfully');
      closeDialog();
    } catch (err: any) {
      console.error('Error creating group:', err);
      setError(err.message || 'Failed to create item group');
    }
  };

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!editingEntity) {
      setError('No group selected');
      return;
    }

    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      await updateGroup({
        groupId: editingEntity._id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });

      showSuccess('Item group updated successfully');
      closeDialog();
    } catch (err: any) {
      console.error('Error updating group:', err);
      setError(err.message || 'Failed to update item group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!editingEntity) return;

    try {
      await deleteGroup({ itemGroupId: editingEntity._id });
      showSuccess('Item group deleted successfully');
      closeDialog();

      if (selectedGroupId === editingEntity._id) {
        setSelectedGroupId(null);
      }
    } catch (err: any) {
      console.error('Error deleting group:', err);
      setError(err.message || 'Failed to delete item group');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedGroupId) {
      setError('Please select a group first');
      return;
    }

    if (!formData.name.trim()) {
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
      // Get current order
      const currentOrder = groupWithItems?.length || 0;

      await addItemToGroup({
        itemGroupId: selectedGroupId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        defaultPrice: parseFloat(formData.price),
        defaultStock: stockValue,
        order: currentOrder,
      });

      showSuccess('Item added successfully');
      closeDialog();
    } catch (err: any) {
      console.error('Error adding item:', err);
      setError(err.message || 'Failed to add item');
    }
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!editingEntity) {
      setError('No item selected');
      return;
    }

    if (!formData.name.trim()) {
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
      await updateItemInGroup({
        groupItemId: editingEntity._id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        defaultPrice: parseFloat(formData.price),
        defaultStock: stockValue,
      });

      showSuccess('Item updated successfully');
      closeDialog();
    } catch (err: any) {
      console.error('Error updating item:', err);
      setError(err.message || 'Failed to update item');
    }
  };

  const handleDeleteItem = async () => {
    if (!editingEntity) return;

    try {
      await removeItemFromGroup({ groupItemId: editingEntity._id });
      showSuccess('Item deleted successfully');
      closeDialog();
    } catch (err: any) {
      console.error('Error deleting item:', err);
      setError(err.message || 'Failed to delete item');
    }
  };

  // Merchant assignment handlers
  const handleAssignGroup = async (merchantEventId: Id<'merchantEvents'>, itemGroupId: Id<'itemGroups'>) => {
    try {
      await assignGroupToMerchant({
        merchantEventId,
        itemGroupId,
      });
      showSuccess('Group assigned successfully');
    } catch (err: any) {
      console.error('Error assigning group:', err);
      setError(err.message || 'Failed to assign group');
    }
  };

  const handleUnassignGroup = async (merchantEventId: Id<'merchantEvents'>, itemGroupId: Id<'itemGroups'>) => {
    try {
      await unassignGroupFromMerchant({
        merchantEventId,
        itemGroupId,
      });
      showSuccess('Group unassigned successfully');
    } catch (err: any) {
      console.error('Error unassigning group:', err);
      setError(err.message || 'Failed to unassign group');
    }
  };

  const handleToggleGroup = async (assignmentId: Id<'merchantGroupAssignments'>, enabled: boolean) => {
    try {
      await toggleGroupEnabled({
        assignmentId,
        enabled,
      });
      showSuccess(enabled ? 'Group enabled' : 'Group disabled');
    } catch (err: any) {
      console.error('Error toggling group:', err);
      setError(err.message || 'Failed to toggle group');
    }
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDisplayType = (event: Event) => {
    if (event.type === 'Custom' && event.customType) {
      return event.customType;
    }
    return event.type;
  };

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
          <h1 className="text-2xl font-bold text-white">Inventory Configuration</h1>
          <p className="text-[#9db0b9] text-sm mt-1">Manage item groups and merchant assignments</p>
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

            {/* Right Panel: Content */}
            <div className="lg:col-span-2">
              {!selectedEvent ? (
                <div className="bg-[#1a2f38] rounded-lg p-8 border border-[#1a2f38]">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Select an Event</h3>
                    <p className="text-[#9db0b9]">Choose an event to manage inventory</p>
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

                  <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

                  {/* Item Groups Tab */}
                  {activeTab === 'groups' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Item Groups</h3>
                        <button
                          onClick={openAddGroupDialog}
                          className="flex items-center gap-1 bg-[#13a4ec] hover:bg-[#0d8ac4] text-white text-sm font-semibold py-1.5 px-3 rounded-lg transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add Group
                        </button>
                      </div>

                      {itemGroups === undefined ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#13a4ec]" />
                        </div>
                      ) : itemGroups === null || itemGroups.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-4xl mb-2">📦</div>
                          <h3 className="text-lg font-semibold text-white mb-2">No Item Groups</h3>
                          <p className="text-[#9db0b9] text-sm mb-4">
                            Create item groups to organize products for this event
                          </p>
                          <button
                            onClick={openAddGroupDialog}
                            className="flex items-center gap-2 bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-2 px-4 rounded-lg transition-colors mx-auto"
                          >
                            <Plus className="w-4 h-4" />
                            Create First Group
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {itemGroups.map((group: ItemGroup) => (
                            <div key={group._id}>
                              <GroupCard
                                group={group}
                                onEdit={openEditGroupDialog}
                                onDelete={openDeleteGroupDialog}
                              />

                              {/* Show items if group is selected */}
                              {selectedGroupId === group._id && groupWithItems && (
                                <div className="ml-8 mt-2 space-y-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-[#9db0b9]">Items</h4>
                                    <button
                                      onClick={openAddItemDialog}
                                      className="flex items-center gap-1 text-xs bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-1 px-2 rounded transition-colors"
                                    >
                                      <Plus className="w-3 h-3" />
                                      Add Item
                                    </button>
                                  </div>

                                  {groupWithItems.length === 0 ? (
                                    <div className="text-center py-6 text-[#9db0b9] text-sm">
                                      No items in this group yet
                                    </div>
                                  ) : (
                                    groupWithItems.map((item: GroupItem) => (
                                      <ItemCard
                                        key={item._id}
                                        item={item}
                                        onEdit={openEditItemDialog}
                                        onDelete={openDeleteItemDialog}
                                      />
                                    ))
                                  )}
                                </div>
                              )}

                              <button
                                onClick={() => setSelectedGroupId(group._id)}
                                className="ml-8 mt-2 text-xs text-[#13a4ec] hover:underline"
                              >
                                {selectedGroupId === group._id ? 'Hide items' : 'View items'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Merchant Assignments Tab */}
                  {activeTab === 'assignments' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Merchants List */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">Merchants</h3>

                          {merchantEvents === undefined ? (
                            <div className="flex justify-center items-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13a4ec]" />
                            </div>
                          ) : merchantEvents === null || merchantEvents.length === 0 ? (
                            <div className="text-center py-8 text-[#9db0b9] text-sm">
                              No merchants assigned to this event
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                              {merchantEvents.map((me: any) => {
                                const isSelected = me._id === selectedMerchantEventId;
                                return (
                                  <button
                                    key={me._id}
                                    onClick={() => setSelectedMerchantEventId(me._id)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                                      isSelected
                                        ? 'bg-[#13a4ec]/20 border-2 border-[#13a4ec]'
                                        : 'bg-[#101c22] border-2 border-[#1a2f38] hover:border-[#13a4ec]/50'
                                    }`}
                                  >
                                    <div className="font-semibold text-white text-sm">
                                      {me.merchant.businessName}
                                    </div>
                                    <div className="text-xs text-[#9db0b9]">Booth {me.boothNumber}</div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Group Assignments */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">
                            {selectedMerchantEventId ? 'Assigned Groups' : 'Select a Merchant'}
                          </h3>

                          {!selectedMerchantEventId ? (
                            <div className="text-center py-8 text-[#9db0b9] text-sm">
                              Select a merchant to view their assigned groups
                            </div>
                          ) : merchantAssignments === undefined ? (
                            <div className="flex justify-center items-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13a4ec]" />
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                              {/* Show unassigned groups */}
                              {itemGroups && itemGroups.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="text-xs font-medium text-[#9db0b9] mb-2">Available Groups</h4>
                                  {itemGroups
                                    .filter((g) => !merchantAssignments?.some((a: any) => a.itemGroupId === g._id))
                                    .map((group: ItemGroup) => (
                                      <div
                                        key={group._id}
                                        className="bg-[#101c22] rounded-lg p-3 border border-[#24404d] mb-2"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <div className="font-medium text-white text-sm">{group.name}</div>
                                            <div className="text-xs text-[#9db0b9]">{group.itemCount} items</div>
                                          </div>
                                          <button
                                            onClick={() => selectedMerchantEventId && handleAssignGroup(selectedMerchantEventId, group._id)}
                                            className="flex items-center gap-1 bg-[#13a4ec] hover:bg-[#0d8ac4] text-white text-xs font-semibold py-1 px-2 rounded transition-colors"
                                          >
                                            <Plus className="w-3 h-3" />
                                            Assign
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}

                              {/* Show assigned groups */}
                              {merchantAssignments && merchantAssignments.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-medium text-[#9db0b9] mb-2">Assigned Groups</h4>
                                  {merchantAssignments.map((assignment: any) => (
                                    <div
                                      key={assignment._id}
                                      className={`bg-[#101c22] rounded-lg p-3 border mb-2 ${
                                        assignment.enabled ? 'border-[#24404d]' : 'border-red-500/50 opacity-60'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-white text-sm">
                                            {assignment.group?.name || 'Unknown Group'}
                                          </div>
                                          <div className="text-xs text-[#9db0b9]">
                                            {assignment.group?.itemCount || 0} items
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => handleToggleGroup(assignment._id, !assignment.enabled)}
                                            className={`text-xs font-medium py-1 px-2 rounded transition-colors ${
                                              assignment.enabled
                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                            }`}
                                          >
                                            {assignment.enabled ? 'Enabled' : 'Disabled'}
                                          </button>
                                          <button
                                            onClick={() => selectedMerchantEventId && handleUnassignGroup(selectedMerchantEventId, assignment.itemGroupId)}
                                            className="text-[#9db0b9] hover:text-red-400 p-1 rounded transition-colors"
                                            title="Unassign"
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
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      {/* Add/Edit Group Dialog */}
      {(dialogType === 'addGroup' || dialogType === 'editGroup') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2f38] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  {dialogType === 'addGroup' ? 'Create Item Group' : 'Edit Item Group'}
                </h2>
                <button
                  onClick={closeDialog}
                  className="text-[#9db0b9] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={dialogType === 'addGroup' ? handleAddGroup : handleEditGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Beverages, Food, Merchandise"
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional group description"
                    rows={2}
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="flex-1 bg-[#1a2f38] hover:bg-[#24404d] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {dialogType === 'addGroup' ? 'Create' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Item Dialog */}
      {(dialogType === 'addItem' || dialogType === 'editItem') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2f38] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  {dialogType === 'addItem' ? 'Add Item' : 'Edit Item'}
                </h2>
                <button
                  onClick={closeDialog}
                  className="text-[#9db0b9] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={dialogType === 'addItem' ? handleAddItem : handleEditItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Beer, Hot Dog, T-Shirt"
                    className="w-full bg-[#101c22] border border-[#1a2f38] rounded-lg px-4 py-2 text-white placeholder-[#9db0b9] focus:outline-none focus:border-[#13a4ec]"
                    required
                  />
                </div>

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

                <div>
                  <label className="block text-sm font-medium text-[#9db0b9] mb-2">
                    Default Stock (optional)
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

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="flex-1 bg-[#1a2f38] hover:bg-[#24404d] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#13a4ec] hover:bg-[#0d8ac4] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {dialogType === 'addItem' ? 'Add' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {dialogType === 'deleteGroup' && editingEntity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2f38] rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-2">Delete Item Group</h2>
            <p className="text-[#9db0b9] mb-4">
              Are you sure you want to delete{' '}
              <span className="text-white font-semibold">{editingEntity.name}</span>? This will also
              delete all items within this group.
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeDialog}
                className="flex-1 bg-[#1a2f38] hover:bg-[#24404d] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGroup}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {dialogType === 'deleteItem' && editingEntity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2f38] rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-2">Delete Item</h2>
            <p className="text-[#9db0b9] mb-4">
              Are you sure you want to delete{' '}
              <span className="text-white font-semibold">{editingEntity.name}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeDialog}
                className="flex-1 bg-[#1a2f38] hover:bg-[#24404d] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
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
