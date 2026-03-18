import React from 'react';
import { useProviderPerformance } from '../../hooks/useReports';
import { formatCurrency } from '../../utils/constants';

const ProviderPerformance = () => {
  const { data: report, isLoading } = useProviderPerformance();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Provider Performance Report</h1>

      {report && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Role Comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(report.role_comparison).map(([role, stats]) => (
                <div key={role} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">{role}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Providers:</span>
                      <span className="font-medium">{stats.provider_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Visits:</span>
                      <span className="font-medium">{stats.avg_visits_per_provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Revenue:</span>
                      <span className="font-medium">{formatCurrency(stats.avg_revenue_per_provider)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Individual Performance</h2>
            <div className="space-y-3">
              {report.individual_providers.map((provider, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{provider.provider_name}</p>
                      <p className="text-sm text-gray-600">{provider.provider_role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(provider.total_revenue)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {provider.visit_count} visits
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderPerformance;
