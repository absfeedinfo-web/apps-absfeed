import React, { useState } from 'react';
import { RawMaterial } from '../types';
import { Plus, Edit, Trash2, Search, Printer } from 'lucide-react';

interface RawMaterialsListProps {
  rawMaterials: RawMaterial[];
  setRawMaterials: React.Dispatch<React.SetStateAction<RawMaterial[]>>;
  userRole: string;
}

export default function RawMaterialsList({ rawMaterials, setRawMaterials, userRole }: RawMaterialsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  const [formData, setFormData] = useState<Partial<RawMaterial>>({
    id: '',
    name: '',
    unit: 'KG',
    pricePerKg: 0,
    stock: 0,
    totalValue: 0
  });

  const handleOpenModal = (material?: RawMaterial) => {
    if (material) {
      setEditingMaterial(material);
      setFormData(material);
    } else {
      setEditingMaterial(null);
      setFormData({
        id: `RM-${Date.now().toString().slice(-4)}`,
        name: '',
        unit: 'KG',
        pricePerKg: 0,
        stock: 0,
        totalValue: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMaterial(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: name === 'name' || name === 'unit' || name === 'id' ? value : Number(value) };
      if (name === 'pricePerKg' || name === 'stock') {
        const price = name === 'pricePerKg' ? Number(value) : (prev.pricePerKg || 0);
        const stock = name === 'stock' ? Number(value) : (prev.stock || 0);
        updated.totalValue = price * stock;
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'VISITOR') {
      alert("Saving is not allowed in Visitor mode.");
      return;
    }
    if (editingMaterial) {
      setRawMaterials(prev => prev.map(rm => rm.id === editingMaterial.id ? formData as RawMaterial : rm));
    } else {
      setRawMaterials(prev => [...prev, formData as RawMaterial]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (userRole === 'VISITOR') {
      alert("Deleting is not allowed in Visitor mode.");
      return;
    }
    if (confirm('Are you sure you want to delete this raw material?')) {
      setRawMaterials(prev => prev.filter(rm => rm.id !== id));
    }
  };

  const filteredMaterials = rawMaterials.filter(rm => 
    rm.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    rm.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStockValue = rawMaterials.reduce((sum, rm) => sum + (rm.totalValue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search raw materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#722f37] outline-none transition-all"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm flex-1 sm:flex-none"
          >
            <Printer size={18} />
            Print
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#722f37] text-white rounded-xl hover:bg-[#5a252c] transition-colors font-bold text-sm flex-1 sm:flex-none shadow-lg shadow-rose-900/20"
          >
            <Plus size={18} />
            Add Material
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">Raw Materials Inventory</h2>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Stock Value</p>
            <p className="text-xl font-black text-[#722f37]">৳{totalStockValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Code</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Stock (KG)</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Price/KG</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Total Value</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map((rm) => (
                <tr key={rm.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-700">{rm.id}</td>
                  <td className="p-4 font-bold text-slate-900">{rm.name}</td>
                  <td className="p-4 font-bold text-slate-700">{rm.stock || 0} {rm.unit}</td>
                  <td className="p-4 font-bold text-emerald-600">৳{rm.pricePerKg || 0}</td>
                  <td className="p-4 font-black text-[#722f37]">৳{(rm.totalValue || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(rm)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(rm.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                    No raw materials found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wider">
                {editingMaterial ? 'Edit Material' : 'Add New Material'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Material Code</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#722f37] outline-none font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Material Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#722f37] outline-none font-bold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Stock (KG)</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#722f37] outline-none font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Price/KG (৳)</label>
                  <input
                    type="number"
                    name="pricePerKg"
                    value={formData.pricePerKg}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#722f37] outline-none font-bold text-slate-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Total Value (৳)</label>
                <input
                  type="number"
                  value={formData.totalValue}
                  readOnly
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl outline-none font-black text-[#722f37]"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#722f37] text-white rounded-xl hover:bg-[#5a252c] transition-colors font-bold text-sm uppercase tracking-wider shadow-lg shadow-rose-900/20"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
