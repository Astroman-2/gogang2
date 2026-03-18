import React from 'react';
import { useAuthMaster } from '../../hooks/useReports';
import { AlertCircle } from 'lucide-react';

const AuthMaster = () => {
  const { data: report, isLoading } = useAuthMaster();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Authorization Master Report</h1>

      {report && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600">Total Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {report.summary.total_pending}
              </p>
            </div>
            <div className="card border-red-200">
              <p className="text-sm text-gray-600">High Urgency</p>
              <p className="text-3xl font-bold text-red-600">
                {report.summary.high_urgency}
              </p>
            </div>
            <div className="card border-orange-200">
              <p className="text-sm text-gray-600">Medium Urgency</p>
              <p className="text-3xl font-bold text-orange-600">
                {report.summary.medium_urgency}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Avg Days Pending</p>
              <p className="text-3xl font-bold text-purple-600">
                {report.summary.average_days_pending}
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Pending Authorizations</h2>
            <div className="space-y-3">
              {report.pending_authorizations.map((auth, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 mt-1 ${
                    auth.urgency === 'High' ? 'text-red-500' : 
                    auth.urgency === 'Medium' ? 'text-orange-500' : 
                    'text-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{auth.patient.name}</p>
                        <p className="text-sm text-gray-600">Provider: {auth.provider.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          {auth.days_pending} days pending
                        </p>
                        <span className={`badge-${
                          auth.urgency === 'High' ? 'red' : 
                          auth.urgency === 'Medium' ? 'yellow' : 
                          'gray'
                        }`}>
                          {auth.urgency} Urgency
                        </span>
                      </div>
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

export default AuthMaster;
