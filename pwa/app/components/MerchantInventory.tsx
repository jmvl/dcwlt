'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Loader2, ChevronDown, Package, QrCode } from 'lucide-react';
import { QRCodeGenerator } from './QRCodeGenerator';
import { useMerchantAuth } from './MerchantAuthProvider';

interface MerchantInventoryProps {
  merchantEventId: Id<'merchantEvents'>;
  merchantId: Id<'merchants'>;
}

export default function MerchantInventory({ merchantEventId, merchantId }: MerchantInventoryProps) {
  const { merchant } = useMerchantAuth();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [qrModalState, setQrModalState] = useState<{
    isOpen: boolean;
    merchantAddress: string;
    itemPrice: number;
    itemName: string;
    itemId: string;
  }>({
    isOpen: false,
    merchantAddress: '',
    itemPrice: 0,
    itemName: '',
    itemId: '',
  });

  // Query merchant's assigned groups
  const merchantAssignments = useQuery(
    api.itemGroups.getMerchantGroupAssignments,
    merchantEventId ? { merchantEventId } : 'skip'
  );

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Handle loading state
  if (merchantAssignments === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#13a4ec] animate-spin" />
      </div>
    );
  }

  // Handle empty state - no groups assigned
  if (merchantAssignments === null || merchantAssignments.length === 0) {
    return (
      <div className="bg-[#1a2f38] rounded-lg p-12 border border-[#1a2f38] text-center">
        <Package className="w-12 h-12 text-[#9db0b9] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Item Groups Assigned</h2>
        <p className="text-[#9db0b9]">
          You haven't been assigned any item groups for this event yet.
          <br />
          Contact your admin to get access to inventory.
        </p>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-3">
      {merchantAssignments.map((assignment: any) => {
        const groupId = assignment.group._id.toString();
        const isExpanded = expandedGroups.has(groupId);
        const group = assignment.group;

        return (
          <div key={assignment._id} className="bg-[#1a2f38] rounded-lg border border-[#1a2f38] overflow-hidden">
            {/* Group Header - Clickable to expand/collapse */}
            <button
              onClick={() => toggleGroup(groupId)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#243b47] transition-colors"
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{group.name}</h3>
                  <span className="text-xs text-[#9db0b9] bg-[#101c22] px-2 py-0.5 rounded">
                    {group.itemCount || 0} items
                  </span>
                </div>
                {group.description && (
                  <p className="text-sm text-[#9db0b9] mt-1">{group.description}</p>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-[#9db0b9] transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Expanded Items Section */}
            {isExpanded && (
              <div className="border-t border-[#1a2f38]">
                <ExpandedItems
                  itemGroupId={group._id}
                  merchantGroupAssignmentId={assignment._id}
                  onGenerateQR={(effectivePrice, item) => {
                    if (merchant) {
                      setQrModalState({
                        isOpen: true,
                        merchantAddress: merchant.walletAddress,
                        itemPrice: effectivePrice,
                        itemName: item.name,
                        itemId: item._id.toString(),
                      });
                    }
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* QR Code Generator Modal */}
    {merchant && (
      <QRCodeGenerator
        isOpen={qrModalState.isOpen}
        onClose={() => setQrModalState({ ...qrModalState, isOpen: false })}
        merchantAddress={qrModalState.merchantAddress}
        itemPrice={qrModalState.itemPrice}
        itemName={qrModalState.itemName}
        itemId={qrModalState.itemId}
        merchantId={merchant!._id}
      />
    )}
  </>
  );
}

interface ExpandedItemsProps {
  itemGroupId: Id<'itemGroups'>;
  merchantGroupAssignmentId: Id<'merchantGroupAssignments'>;
  onGenerateQR: (effectivePrice: number, item: any) => void;
}

function ExpandedItems({ itemGroupId, merchantGroupAssignmentId, onGenerateQR }: ExpandedItemsProps) {
  // Query items in this group
  const groupItems = useQuery(
    api.itemGroups.getGroupItems,
    itemGroupId ? { itemGroupId } : 'skip'
  );

  if (groupItems === undefined) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 text-[#13a4ec] animate-spin" />
      </div>
    );
  }

  if (groupItems === null || groupItems.length === 0) {
    return (
      <div className="p-8 text-center text-[#9db0b9] text-sm">
        No items in this group
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {groupItems.map((item: any) => (
        <ItemRow
          key={item._id}
          item={item}
          merchantGroupAssignmentId={merchantGroupAssignmentId}
          onGenerateQR={onGenerateQR}
        />
      ))}
    </div>
  );
}

interface ItemRowProps {
  item: any;
  merchantGroupAssignmentId: Id<'merchantGroupAssignments'>;
  onGenerateQR: (effectivePrice: number, item: any) => void;
}

function ItemRow({ item, merchantGroupAssignmentId, onGenerateQR }: ItemRowProps) {
  // Query merchant overrides for this item
  const override = useQuery(
    api.itemGroups.getMerchantItemOverrides,
    merchantGroupAssignmentId ? { merchantGroupAssignmentId } : 'skip'
  )?.find((o: any) => o.groupItemId === item._id);

  // Determine effective price and stock
  const effectivePrice = override?.priceOverride ?? item.defaultPrice;
  const effectiveStock = override?.stockOverride ?? item.defaultStock;

  // Determine stock badge color
  const getStockBadgeColor = (stock: number | null | undefined) => {
    if (stock === null || stock === undefined || stock > 5) {
      return 'bg-green-100 text-green-800';
    } else if (stock >= 1) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="bg-[#101c22] rounded-lg p-3 border border-[#243b47]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white">{item.name}</h4>
            {override?.priceOverride && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Price override
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-sm text-[#9db0b9] mt-1 line-clamp-1">{item.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-bold text-white">
              {effectivePrice.toFixed(2)} <span className="text-sm">EVT</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded ${getStockBadgeColor(effectiveStock)}`}>
              {effectiveStock === null || effectiveStock === undefined ? 'Unlimited' : effectiveStock.toString()}
            </span>
          </div>
          <button
            onClick={() => onGenerateQR(effectivePrice, item)}
            className="flex items-center gap-1 bg-[#13a4ec] hover:bg-[#0d8ac4] text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
            title="Generate QR code"
          >
            <QrCode className="w-4 h-4" />
            Generate QR
          </button>
        </div>
      </div>
    </div>
  );
}
