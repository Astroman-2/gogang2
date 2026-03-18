import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../../hooks/usePatients';
import { Search, Plus, User } from 'lucide-react';
import { formatDate } from '../../utils/constants';

const PatientList = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { data: patients, isLoading } = usePatients({ search, is_active: true });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading patients...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search patients by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients?.map((patient) => (
          <div
            key={patient.id}
            onClick={() => navigate(`/patients/${patient.id}`)}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {patient.full_name}
                </h3>
                <p className="text-sm text-gray-600">{patient.age} years old</p>
                <p className="text-sm text-gray-500 mt-1">{patient.phone}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="badge-blue">{patient.gender}</span>
                  <span className="badge-gray">{patient.city}, {patient.state}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {patients?.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No patients found</p>
        </div>
      )}
    </div>
  );
};

export default PatientList;
