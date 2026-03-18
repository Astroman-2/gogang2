import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '../../hooks/usePatients';
import { ArrowLeft, Mail, Phone, MapPin, Heart, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/constants';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: patient, isLoading } = usePatient(id);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!patient) {
    return <div className="text-center py-12">Patient not found</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Patients
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{patient.full_name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demographics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Demographics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">{formatDate(patient.date_of_birth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-medium">{patient.age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium">{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blood Type</p>
                <p className="font-medium">{patient.blood_type || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>{patient.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{patient.address}, {patient.city}, {patient.state} {patient.zip_code}</span>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Medical History</h2>
            {patient.medical_history ? (
              <p className="text-gray-700">{patient.medical_history}</p>
            ) : (
              <p className="text-gray-500 italic">No medical history recorded</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Allergies */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold">Allergies</h3>
            </div>
            {patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, i) => (
                  <span key={i} className="badge-red">{allergy}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No known allergies</p>
            )}
          </div>

          {/* Chronic Conditions */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Chronic Conditions</h3>
            </div>
            {patient.chronic_conditions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.chronic_conditions.map((condition, i) => (
                  <span key={i} className="badge-blue">{condition}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">None recorded</p>
            )}
          </div>

          {/* Medications */}
          <div className="card">
            <h3 className="font-semibold mb-3">Current Medications</h3>
            {patient.current_medications.length > 0 ? (
              <ul className="space-y-2">
                {patient.current_medications.map((med, i) => (
                  <li key={i} className="text-sm text-gray-700">• {med}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No medications</p>
            )}
          </div>

          {/* Insurance */}
          <div className="card">
            <h3 className="font-semibold mb-3">Insurance</h3>
            {patient.insurance_provider ? (
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Provider</p>
                  <p className="text-sm font-medium">{patient.insurance_provider}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Policy Number</p>
                  <p className="text-sm font-medium">{patient.insurance_policy_number}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No insurance on file</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
