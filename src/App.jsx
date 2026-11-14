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
    const saved = localStorage.getItem('regison_trainings_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Remove ficticios antigos se houver
        return parsed.map((t) => ({
          ...t,
          attendees: (t.attendees || []).filter((a) => !a.employeeId?.startsWith('emp-')),
        }));
      } catch {
        return initialTrainings;
      }
    }
    return initialTrainings;
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('regison_employees_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Se continha os colaboradores ficticios do mock anterior (emp-1, emp-2, etc.), limpa!
        const cleaned = parsed.filter((e) => !e.id?.startsWith('emp-'));
        return cleaned;
      } catch {
        return [];
      }
    }
    // Remove localStorage antigo se existir
    localStorage.removeItem('presencabio_employees');
    localStorage.removeItem('presencabio_trainings');
    return [];
  });

  const [activeTab, setActiveTab] = useState('employees');
  const [isNewTrainingOpen, setIsNewTrainingOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('regison_trainings_v3', JSON.stringify(trainings));
  }, [trainings]);

  useEffect(() => {
    localStorage.setItem('regison_employees_v3', JSON.stringify(employees));
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

  // Add or update employee
  const handleAddEmployee = (newEmp) => {
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === newEmp.id || (e.matricula && e.matricula === newEmp.matricula));
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...newEmp };
        return updated;
      }
      return [newEmp, ...prev];
    });
  };

  // Delete employee
  const handleDeleteEmployee = (empId) => {
    if (confirm('Deseja excluir este colaborador?')) {
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

      <main className="flex-1 pb-24 md:pb-6">
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
      <footer className="print:hidden border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong>RegisON</strong> • Registro Digital de Presença por Reconhecimento Facial
          </p>
          <p className="text-[11px] text-slate-400">
            Conforme diretrizes das NRs e LGPD
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
