import React from 'react';
import { useFinanceMaster } from '../../hooks/useReports';
import { formatCurrency } from '../../utils/constants';

const FinanceMaster = () => {
  const { data: report, isLoading } = useFinanceMaster();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Finance Master Report</h1>

      {report && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(report.revenue_summary.total_revenue)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(report.revenue_summary.total_paid)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(report.revenue_summary.total_pending)}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Collection Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {report.revenue_summary.collection_rate}%
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Overdue Buckets</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-700 mb-1">30 Days Overdue</p>
                <p className="text-xl font-bold text-yellow-700">
                  {formatCurrency(report.overdue_buckets['30_days'].total_amount)}
                </p>
                <p className="text-sm text-gray-600">
                  {report.overdue_buckets['30_days'].count} invoices
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-700 mb-1">60 Days Overdue</p>
                <p className="text-xl font-bold text-orange-700">
                  {formatCurrency(report.overdue_buckets['60_days'].total_amount)}
                </p>
                <p className="text-sm text-gray-600">
                  {report.overdue_buckets['60_days'].count} invoices
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-gray-700 mb-1">90+ Days Overdue</p>
                <p className="text-xl font-bold text-red-700">
                  {formatCurrency(report.overdue_buckets['90_plus_days'].total_amount)}
                </p>
                <p className="text-sm text-gray-600">
                  {report.overdue_buckets['90_plus_days'].count} invoices
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceMaster;
