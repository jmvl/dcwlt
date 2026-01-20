'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Loader2, Package, QrCode } from 'lucide-react';
import { QRCodeGenerator } from './QRCodeGenerator';
import { useMerchantAuth } from './MerchantAuthProvider';

interface MerchantInventoryProps {
  merchantEventId: Id<'merchantEvents'>;
  merchantId: Id<'merchants'>;
}

export default function MerchantInventory({ merchantEventId, merchantId }: MerchantInventoryProps) {
  const { merchant } = useMerchantAuth();
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

  // Query merchant items with overrides - returns groups with items
  const merchantItems = useQuery(
    api.itemGroups.getMerchantItemsWithOverrides,
    merchantEventId ? { merchantEventId } : 'skip'
  );

  // Handle loading state
  if (merchantItems === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#13a4ec] animate-spin" />
      </div>
    );
  }

  // Handle empty state - no groups assigned or no items
  if (merchantItems === null || merchantItems.length === 0) {
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

  // Flatten all items from all groups into a single array
  const allItems = merchantItems.flatMap((groupData) =>
    groupData.items.map((itemData: any) => ({
      ...itemData.groupItem,
      effectivePrice: itemData.effectivePrice,
      effectiveStock: itemData.effectiveStock,
    }))
  );

  if (allItems.length === 0) {
    return (
      <div className="bg-[#1a2f38] rounded-lg p-12 border border-[#1a2f38] text-center">
        <Package className="w-12 h-12 text-[#9db0b9] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Items Available</h2>
        <p className="text-[#9db0b9]">
          No items found in your assigned groups.
        </p>
      </div>
    );
  }

  const handleGenerateQR = (effectivePrice: number, item: any) => {
    if (merchant) {
      setQrModalState({
        isOpen: true,
        merchantAddress: merchant.walletAddress,
        itemPrice: effectivePrice,
        itemName: item.name,
        itemId: item._id.toString(),
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {allItems.map((item: any) => (
          <InventoryItemCard
            key={item._id}
            item={item}
            onGenerateQR={handleGenerateQR}
          />
        ))}
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

interface InventoryItemCardProps {
  item: any;
  onGenerateQR: (effectivePrice: number, item: any) => void;
}

function InventoryItemCard({ item, onGenerateQR }: InventoryItemCardProps) {
  // effectivePrice and effectiveStock are already on the item from the query
  const effectivePrice = item.effectivePrice ?? item.defaultPrice;
  const effectiveStock = item.effectiveStock ?? item.defaultStock;

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

  // Get stock display text
  const getStockDisplay = (stock: number | null | undefined) => {
    if (stock === null || stock === undefined) {
      return 'In Stock';
    }
    return stock.toString();
  };

  return (
    <div className="custom-gradient aspect-square rounded-lg border border-[#1a2f38] hover:border-[#13a4ec]/50 active:scale-95 transition-all p-4 relative">
      {/* Top row: name (left) + stock (right) */}
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-white text-lg leading-tight">{item.name}</h3>
        <span className={`text-xs px-2 py-1 rounded ${getStockBadgeColor(effectiveStock)} shrink-0`}>
          {getStockDisplay(effectiveStock)}
        </span>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-[#9db0b9] mt-2 line-clamp-2">{item.description}</p>
      )}

      {/* Bottom: price + QR button */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        <div className="text-lg font-bold text-white">
          {effectivePrice.toFixed(2)} <span className="text-sm">EVT</span>
        </div>
        <button
          onClick={() => onGenerateQR(effectivePrice, item)}
          className="bg-[#13a4ec] hover:bg-[#0d8ac4] p-2 rounded-lg transition-colors"
          title="Generate QR code"
        >
          <QrCode className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
