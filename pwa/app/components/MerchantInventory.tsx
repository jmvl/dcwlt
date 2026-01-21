"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, Package } from "lucide-react";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { useMerchantAuth } from "./MerchantAuthProvider";

interface MerchantInventoryProps {
  merchantEventId: Id<"merchantEvents">;
  merchantId: Id<"merchants">;
}

// Default colors for item groups (fallback if not set in schema)
const DEFAULT_GROUP_COLORS: Record<string, string> = {
  Beverages: "#42A5F5", // tech blue
  Beverage: "#42A5F5",
  Food: "#FB8C00", // orange
  Snacks: "#66BB6A", // green
};

export default function MerchantInventory({
  merchantEventId,
}: MerchantInventoryProps) {
  const { merchant } = useMerchantAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const [qrModalState, setQrModalState] = useState<{
    isOpen: boolean;
    merchantAddress: string;
    itemPrice: number;
    itemName: string;
    itemId: string;
  }>({
    isOpen: false,
    merchantAddress: "",
    itemPrice: 0,
    itemName: "",
    itemId: "",
  });

  // Query merchant items with overrides - returns groups with items
  const merchantItems = useQuery(
    api.itemGroups.getMerchantItemsWithOverrides,
    merchantEventId ? { merchantEventId } : "skip",
  );

  // Extract unique categories (group names) from merchant items
  // MUST be called before any conditional returns to maintain consistent hook order
  const categories = useMemo(() => {
    if (!merchantItems || merchantItems.length === 0) return ["All"];
    const uniqueNames = new Set(merchantItems.map((g) => g.group.name));
    return ["All", ...Array.from(uniqueNames).sort()];
  }, [merchantItems]);

  // Flatten all items with their group info for filtering
  // MUST be called before any conditional returns to maintain consistent hook order
  const allItemsWithGroup = useMemo(() => {
    if (!merchantItems) return [];
    return merchantItems.flatMap((groupData) =>
      groupData.items.map((itemData: any) => ({
        ...itemData.groupItem,
        effectivePrice: itemData.effectivePrice,
        effectiveStock: itemData.effectiveStock,
        groupName: groupData.group.name,
        groupColor:
          groupData.group.color ||
          DEFAULT_GROUP_COLORS[groupData.group.name] ||
          "#1a2f38",
      })),
    );
  }, [merchantItems]);

  // Filter items based on selected category
  // MUST be called before any conditional returns to maintain consistent hook order
  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") {
      return allItemsWithGroup;
    }
    return allItemsWithGroup.filter(
      (item) => item.groupName === selectedCategory,
    );
  }, [allItemsWithGroup, selectedCategory]);

  // Handle loading state (after all hooks are declared)
  if (merchantItems === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#13a4ec] animate-spin" />
      </div>
    );
  }

  // Handle empty state - no groups assigned or no items (after all hooks are declared)
  if (merchantItems === null || merchantItems.length === 0) {
    return (
      <div className="bg-[#1a2f38] rounded-lg p-12 border border-[#1a2f38] text-center">
        <Package className="w-12 h-12 text-[#9db0b9] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
          No Item Groups Assigned
        </h2>
        <p className="text-[#9db0b9]">
          You haven't been assigned any item groups for this event yet.
          <br />
          Contact your admin to get access to inventory.
        </p>
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <>
        {/* Category Tabs */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-8 min-w-max">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-4 transition-colors ${
                  selectedCategory === category
                    ? "border-[#13a4ec] text-[#13a4ec]"
                    : "border-transparent text-[#9db0b9]"
                }`}
              >
                <span className="text-sm font-bold leading-normal tracking-wide">
                  {category}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#1a2f38] rounded-lg p-12 border border-[#1a2f38] text-center">
          <Package className="w-12 h-12 text-[#9db0b9] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            No Items Available
          </h2>
          <p className="text-[#9db0b9]">
            No items found in the {selectedCategory} category.
          </p>
        </div>
      </>
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
      {/* Category Tabs */}
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-8 min-w-max">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-4 transition-colors ${
                selectedCategory === category
                  ? "border-[#13a4ec] text-[#13a4ec]"
                  : "border-transparent text-[#9db0b9]"
              }`}
            >
              <span className="text-sm font-bold leading-normal tracking-wide">
                {category}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredItems.map((item: any) => (
          <InventoryItemCard
            key={item._id}
            item={item}
            onGenerateQR={handleGenerateQR}
            color={item.groupColor}
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
  color?: string;
}

function InventoryItemCard({
  item,
  onGenerateQR,
  color = "#1a2f38",
}: InventoryItemCardProps) {
  // effectivePrice and effectiveStock are already on the item from the query
  const effectivePrice = item.effectivePrice ?? item.defaultPrice;
  const effectiveStock = item.effectiveStock ?? item.defaultStock;

  // Get stock display text
  const getStockDisplay = (stock: number | null | undefined) => {
    if (stock === null || stock === undefined || stock > 5) {
      return "In Stock";
    }
    return stock.toString();
  };

  return (
    <button
      onClick={() => onGenerateQR(effectivePrice, item)}
      className="aspect-square rounded-xl border border-[#1a2f38] hover:border-[#13a4ec]/50 active:scale-95 transition-transform p-4 relative text-left w-full overflow-hidden"
      style={{
        background: `linear-gradient(0deg, ${color}00 0%, ${color}99 30%)`,
      }}
    >
      {/* Top content */}
      <div className="z-10 flex flex-col h-full">
        {/* Top: name and description */}
        <div>
          <h3 className="font-extrabold text-white text-lg tracking-tight">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs text-slate-400 font-medium mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Bottom: stock (left) + price (right) */}
        <div className="flex items-end justify-between mt-auto">
          <span
            className={`bg-[#13a4ec]/20 text-[#13a4ec] px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest`}
          >
            {getStockDisplay(effectiveStock)}
          </span>
          <div className="text-base font-bold text-white">
            {Math.round(effectivePrice)}{" "}
            <span className="text-[#13a4ec] text-xs tracking-tighter">EVT</span>
          </div>
        </div>
      </div>
    </button>
  );
}
