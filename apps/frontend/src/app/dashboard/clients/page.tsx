'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, getToken } from '@/app/lib/api';

interface ReachedAgent {
  id: number;
  name: string;
  email: string;
  phone: string;
  listingCount: number;
  source: 'saved' | 'appointment';
}

interface DiscoverAgent {
  id: number;
  name: string;
  email: string;
  phone: string;
  listing_count: number;
}

const UserClients: React.FC = () => {
  const router = useRouter();
  const [reachedAgents, setReachedAgents] = useState<ReachedAgent[]>([]);
  const [discoverAgents, setDiscoverAgents] = useState<DiscoverAgent[]>([]);
  const [loadingReached, setLoadingReached] = useState(true);
  const [loadingDiscover, setLoadingDiscover] = useState(true);
  const [activeTab, setActiveTab] = useState<'reached' | 'discover'>('reached');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login?next=/dashboard/clients');
      return;
    }
    const loadReached = async () => {
      setLoadingReached(true);
      const [savedRes, appRes] = await Promise.all([
        apiFetch<{ results?: { listing: { agent: number; agent_name: string; agent_email?: string; agent_phone?: string } }[] }>('listings/saved/?page_size=100'),
        apiFetch<{ results?: { agent: number; agent_name: string }[] }>('appointments/?page_size=100'),
      ]);
      if (savedRes.status === 401 || appRes.status === 401) {
        router.replace('/login?next=/dashboard/clients');
        return;
      }
      const byId = new Map<number, ReachedAgent>();
      if (savedRes.ok && savedRes.data?.results) {
        savedRes.data.results.forEach((s) => {
          const listing = s.listing;
          const id = listing.agent;
          if (id && !byId.has(id)) {
            byId.set(id, {
              id,
              name: listing.agent_name || 'Agent',
              email: listing.agent_email || '',
              phone: listing.agent_phone || '',
              listingCount: 0,
              source: 'saved',
            });
          }
          if (id) {
            const a = byId.get(id)!;
            a.listingCount = (a.listingCount || 0) + 1;
          }
        });
      }
      if (appRes.ok && appRes.data?.results) {
        appRes.data.results.forEach((a) => {
          const id = a.agent;
          if (id && !byId.has(id)) {
            byId.set(id, {
              id,
              name: a.agent_name || 'Agent',
              email: '',
              phone: '',
              listingCount: 0,
              source: 'appointment',
            });
          }
        });
      }
      setReachedAgents(Array.from(byId.values()));
      setLoadingReached(false);
    };
    loadReached();
  }, [router]);

  useEffect(() => {
    const loadDiscover = async () => {
      setLoadingDiscover(true);
      const res = await apiFetch<{ results?: DiscoverAgent[] }>('auth/agents/');
      if (res.ok && res.data?.results) setDiscoverAgents(res.data.results);
      setLoadingDiscover(false);
    };
    loadDiscover();
  }, []);

  const renderAgentCard = (agent: { id: number; name: string; email: string; phone: string; listingCount?: number; listing_count?: number }, options?: { showViewListings?: boolean }) => {
    const listingCount = agent.listingCount ?? agent.listing_count ?? 0;
    const initials = agent.name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AG';
    return (
      <div key={agent.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">{initials}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
              <p className="text-sm text-gray-600">{listingCount} listing{listingCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          {agent.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href={`mailto:${agent.email}`} className="text-blue-600 hover:underline truncate">{agent.email}</a>
            </div>
          )}
          {agent.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href={`tel:${agent.phone}`} className="text-blue-600 hover:underline">{agent.phone}</a>
            </div>
          )}
          {!agent.email && !agent.phone && (
            <p className="text-sm text-gray-500">Contact via their listings.</p>
          )}
        </div>
        <div className="flex gap-2">
          {agent.email && (
            <a href={`mailto:${agent.email}`} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center text-sm">
              Contact
            </a>
          )}
          {options?.showViewListings !== false && (
            <Link href="/dashboard/listings" className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center text-sm">
              View Listings
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Agents</h1>
        <p className="mt-2 text-gray-600">Agents you’ve reached through saved listings or appointments, and discover more agents.</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('reached')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'reached' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Agents you’ve reached
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'discover' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Discover agents
        </button>
      </div>

      {activeTab === 'reached' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">From your saved listings and appointments</h2>
          {loadingReached ? (
            <p className="text-gray-500">Loading...</p>
          ) : reachedAgents.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-600">You haven’t reached any agents yet.</p>
              <p className="text-sm text-gray-500 mt-2">Save listings or book appointments to see agents here.</p>
              <Link href="/dashboard/listings" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Browse listings</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reachedAgents.map((a) => renderAgentCard({ ...a, listingCount: a.listingCount }))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'discover' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All agents on Keja</h2>
          {loadingDiscover ? (
            <p className="text-gray-500">Loading...</p>
          ) : discoverAgents.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No agents to show yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discoverAgents.map((a) => renderAgentCard({ ...a, listingCount: a.listing_count }, { showViewListings: true }))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserClients;
