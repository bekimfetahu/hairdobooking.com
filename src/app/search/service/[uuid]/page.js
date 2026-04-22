'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

/**
 * Service Detail Page
 * Shows all salons offering a specific service
 * URL: /search/service/{uuid}
 */
export default function ServiceDetailPage() {
  const params = useParams();
  const serviceUuid = params.uuid;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Service Details</h1>
          <p className="text-gray-600 mt-1">UUID: {serviceUuid}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Service Search */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Refinement</h2>
              <p className="text-gray-600 mb-4">Service search interface will be implemented here.</p>
              {/* TODO: Add service search UI */}
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Map View</p>
                <p className="text-sm text-gray-500">Salon locations map will be displayed here</p>
              </div>
            </div>
          </div>
        </div>

        {/* Salons List */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Salons Offering This Service</h2>
          <div className="text-gray-600 text-center py-12">
            <p>Salon list will be loaded here</p>
            <p className="text-sm text-gray-500 mt-2">Loading salons for service: {serviceUuid}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
