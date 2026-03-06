'use client';

import { Id } from '../../../../convex/_generated/dataModel';
import { Package, Edit, Trash2, GripVertical } from 'lucide-react';

interface Group {
  _id: Id<'itemGroups'>;
  name: string;
  description?: string;
  order: number;
  itemCount: number;
}

interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
}

export function GroupCard({ group, onEdit, onDelete }: GroupCardProps) {
  return (
    <div className="bg-[#1a2f38] rounded-lg p-4 border border-[#1a2f38] hover:border-[#13a4ec]/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <GripVertical className="w-5 h-5 text-[#9db0b9] mt-1 cursor-move" />

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-[#13a4ec]" />
              <h3 className="font-semibold text-white">{group.name}</h3>
              <span className="px-2 py-0.5 bg-[#13a4ec]/20 text-[#13a4ec] rounded text-xs font-medium border border-[#13a4ec]/30">
                {group.itemCount} {group.itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {group.description && (
              <p className="text-[#9db0b9] text-sm">{group.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(group)}
            className="p-1.5 text-[#9db0b9] hover:text-white hover:bg-[#13a4ec]/20 rounded-lg transition-colors"
            title="Edit group"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(group)}
            className="p-1.5 text-[#9db0b9] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete group"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
