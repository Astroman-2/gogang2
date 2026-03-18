import React from 'react';
import { useAppointments } from '../../hooks/useAppointments';
import { Calendar, Clock } from 'lucide-react';
import { formatDateTime, getStatusColor } from '../../utils/constants';

const AppointmentCalendar = () => {
  const { data: appointments, isLoading } = useAppointments();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <button className="btn-primary">Schedule Appointment</button>
      </div>

      <div className="space-y-4">
        {appointments?.map((apt) => (
          <div key={apt.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{apt.patient.name}</h3>
                  <p className="text-sm text-gray-600">Provider: {apt.provider.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDateTime(apt.scheduled_date)}
                    </span>
                    <span>{apt.duration_hours} hour(s)</span>
                    <span className="badge-blue">{apt.appointment_type}</span>
                  </div>
                </div>
              </div>
              <span className={`badge-${getStatusColor(apt.status)}`}>
                {apt.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {appointments?.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No appointments scheduled</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;
