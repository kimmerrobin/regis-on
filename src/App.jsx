import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import FacialScanner from './components/FacialScanner';
import AttendanceReport from './components/AttendanceReport';
import EmployeeManager from './components/EmployeeManager';
import NewTrainingModal from './components/NewTrainingModal';
import { initialTrainings, initialEmployees } from './data/mockData';

export default function App() {
  const [trainings, setTrainings] = useState(() => {
    const saved = localStorage.getItem('presencabio_trainings');
    return saved ? JSON.parse(saved) : initialTrainings;
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('presencabio_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  // Default to 'employees' so user can register their face first!
  const [activeTab, setActiveTab] = useState('employees');
  const [isNewTrainingOpen, setIsNewTrainingOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('presencabio_trainings', JSON.stringify(trainings));
  }, [trainings]);

  useEffect(() => {
    localStorage.setItem('presencabio_employees', JSON.stringify(employees));
  }, [employees]);

  // Register attendance for an employee
  const handleRegisterAttendance = (trainingId, record) => {
    setTrainings((prev) =>
      prev.map((t) => {
        if (t.id === trainingId) {
          const currentAttendees = t.attendees || [];
          const exists = currentAttendees.some((a) => a.employeeId === record.employeeId);
          if (exists) return t;
          return {
            ...t,
            attendees: [record, ...currentAttendees],
          };
        }
        return t;
      })
    );
  };

  // Add training
  const handleAddTraining = (newTrn) => {
    setTrainings((prev) => [newTrn, ...prev]);
    setActiveTab('scanner');
  };

  // Add employee
  const handleAddEmployee = (newEmp) => {
    setEmployees((prev) => [newEmp, ...prev]);
  };

  // Delete employee
  const handleDeleteEmployee = (empId) => {
    if (confirm('Deseja excluir este colaborador da base?')) {
      setEmployees((prev) => prev.filter((e) => e.id !== empId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTraining={() => setIsNewTrainingOpen(true)}
      />

      <main className="flex-1">
        {activeTab === 'employees' && (
          <EmployeeManager
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onNavigateToScanner={() => setActiveTab('scanner')}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            trainings={trainings}
            employees={employees}
            setActiveTab={setActiveTab}
            onOpenNewTraining={() => setIsNewTrainingOpen(true)}
          />
        )}

        {activeTab === 'scanner' && (
          <FacialScanner
            trainings={trainings}
            employees={employees}
            onRegisterAttendance={handleRegisterAttendance}
            onNavigateToEmployees={() => setActiveTab('employees')}
          />
        )}

        {activeTab === 'reports' && <AttendanceReport trainings={trainings} />}
      </main>

      {/* Footer */}
      <footer className="print:hidden border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong>RegisON</strong> • Sua presença registrada em segundos
          </p>

          <p className="text-[11px] text-slate-400">
            Solução Digital para Treinamentos com Reconhecimento Facial • LGPD & NRs
          </p>
        </div>
      </footer>

      {/* Modal */}
      <NewTrainingModal
        isOpen={isNewTrainingOpen}
        onClose={() => setIsNewTrainingOpen(false)}
        onAddTraining={handleAddTraining}
      />
    </div>
  );
}
