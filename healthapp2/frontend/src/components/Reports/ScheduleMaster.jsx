import React, { useState } from 'react';
import { useScheduleMaster } from '../../hooks/useReports';
import { BarChart3 } from 'lucide-react';

const ScheduleMaster = () => {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const { data: report, isLoading } = useScheduleMaster(startDate, endDate);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Schedule Master Report</h1>

      <div className="card mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {isLoading && <div>Loading report...</div>}

      {report && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Total Providers</p>
              <p className="text-3xl font-bold text-primary-600">
                {report.summary.total_providers}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-3xl font-bold text-blue-600">
                {report.summary.total_appointments}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-3xl font-bold text-green-600">
                {report.summary.total_hours}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Avg Hours/Provider</p>
              <p className="text-3xl font-bold text-purple-600">
                {report.summary.average_hours_per_provider}
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Provider Workload</h2>
            <div className="space-y-4">
              {report.provider_loads.map((provider, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-semibold">{provider.provider_name}</p>
                      <p className="text-sm text-gray-600">{provider.provider_role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600">
                        {provider.total_hours} hours
                      </p>
                      <p className="text-sm text-gray-600">
                        {provider.appointment_count} appointments
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

export default ScheduleMaster;
