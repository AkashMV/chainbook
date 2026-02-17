"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Wallet {
  id: number;
  label: string;
  address: string;
  chain: string;
  risk_level: string;
  notes?: string;
}

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState("All");

  const [formData, setFormData] = useState({
    label: "",
    address: "",
    chain: "Ethereum",
    risk_level: "Low",
    notes: "",
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchWallets();
  }, [user]);

  const fetchWallets = async () => {
    try {
      const res = await api.get("/wallets/");
      setWallets(res.data);
    } catch (err) {
      console.error("Failed to fetch wallets");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/wallets/", formData);
      setIsModalOpen(false);
      fetchWallets();
      setFormData({
        label: "",
        address: "",
        chain: "Ethereum",
        risk_level: "Low",
        notes: "",
      });
    } catch (err) {
      alert("Error creating wallet");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this wallet?")) return;
    await api.delete(`/wallets/${id}`);
    fetchWallets();
  };

  const filteredWallets = useMemo(() => {
    return wallets.filter((wallet) => {
      const matchesSearch =
        wallet.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wallet.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk =
        filterRisk === "All" || wallet.risk_level === filterRisk;
      return matchesSearch && matchesRisk;
    });
  }, [wallets, searchQuery, filterRisk]);

  if (loading || !user)
    return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-500">
            ChainBook Dashboard
          </h1>
          <p className="text-gray-400">Welcome, {user.email}</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
        <div className="flex gap-4 flex-1">
          <input
            placeholder="Search wallets..."
            className="p-2 bg-gray-800 border border-gray-700 rounded w-full md:w-64 focus:border-green-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="p-2 bg-gray-800 border border-gray-700 rounded focus:border-green-500 outline-none"
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
          >
            <option value="All">All Risks</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-green-600 rounded hover:bg-green-700 font-bold whitespace-nowrap"
        >
          + Add New Wallet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWallets.map((wallet) => (
          <div
            key={wallet.id}
            className="p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-green-500 transition-colors relative group"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{wallet.label}</h3>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  wallet.risk_level === "High"
                    ? "bg-red-900 text-red-200"
                    : wallet.risk_level === "Medium"
                      ? "bg-yellow-900 text-yellow-200"
                      : "bg-green-900 text-green-200"
                }`}
              >
                {wallet.risk_level} Risk
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-300">
              <p>
                <span className="text-gray-500">Chain:</span> {wallet.chain}
              </p>
              <p className="break-all font-mono text-xs text-gray-400 bg-gray-900 p-1 rounded">
                {wallet.address}
              </p>
              {wallet.notes && (
                <p className="italic text-gray-400 mt-2">"{wallet.notes}"</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => handleDelete(wallet.id)}
                className="text-red-400 hover:text-red-300 text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {filteredWallets.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">
            No wallets found matching your filters.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-lg border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Track New Wallet</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                placeholder="Label (e.g. Justin Sun)"
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                required
              />
              <input
                placeholder="Address (0x...)"
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none"
                  value={formData.chain}
                  onChange={(e) =>
                    setFormData({ ...formData, chain: e.target.value })
                  }
                >
                  <option>Ethereum</option>
                  <option>Solana</option>
                  <option>Bitcoin</option>
                  <option>Arbitrum</option>
                </select>
                <select
                  className="p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none"
                  value={formData.risk_level}
                  onChange={(e) =>
                    setFormData({ ...formData, risk_level: e.target.value })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <textarea
                placeholder="Notes..."
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 focus:border-green-500 outline-none"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-gray-600 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-green-600 rounded font-bold hover:bg-green-700"
                >
                  Save Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
