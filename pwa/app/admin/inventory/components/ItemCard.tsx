'use client';

import { Id } from '../../../../convex/_generated/dataModel';
import { Package, Edit, Trash2, AlertTriangle, GripVertical } from 'lucide-react';

interface GroupItem {
  _id: Id<'groupItems'>;
  name: string;
  description?: string;
  defaultPrice: number;
  defaultStock?: number;
  order: number;
}

interface ItemCardProps {
  item: GroupItem;
  onEdit: (item: GroupItem) => void;
  onDelete: (item: GroupItem) => void;
}

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const isLowStock = item.defaultStock !== undefined && item.defaultStock < 10 && item.defaultStock > 0;
  const isOutOfStock = item.defaultStock === 0;

  return (
    <div className={`bg-[#101c22] rounded-lg p-3 border ${
      isOutOfStock
        ? 'border-red-500/50'
        : isLowStock
          ? 'border-yellow-500/50'
          : 'border-[#24404d]'
    } hover:border-[#13a4ec]/50 transition-colors`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <GripVertical className="w-4 h-4 text-[#9db0b9] mt-1 cursor-move" />

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-3 h-3 text-[#13a4ec]" />
              <h4 className="font-medium text-white text-sm">{item.name}</h4>

              {isOutOfStock && (
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium border border-red-500/30">
                  Out of Stock
                </span>
              )}
              {isLowStock && (
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
              <span className="text-[#13a4ec] font-semibold">{item.defaultPrice} EVT</span>
              <span className="text-[#9db0b9]">
                Stock:{' '}
                {item.defaultStock === undefined
                  ? 'Unlimited'
                  : item.defaultStock === 0
                    ? '0'
                    : item.defaultStock}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-[#9db0b9] hover:text-white hover:bg-[#13a4ec]/20 rounded-lg transition-colors"
            title="Edit item"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1.5 text-[#9db0b9] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
