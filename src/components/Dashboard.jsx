import React from 'react';
import { Camera, Users, CheckCircle, Clock, Plus, FileSpreadsheet, AlertCircle } from 'lucide-react';

export default function Dashboard({ trainings, employees, setActiveTab, onOpenNewTraining }) {
  const totalEmployees = employees.length;
  const activeTrainings = trainings.filter((t) => t.status === 'em_andamento').length;
  const totalPresences = trainings.reduce((acc, t) => acc + (t.attendees?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Actions (Clean, No Marketing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Painel de Treinamentos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie as turmas, realize a chamada facial e acompanhe as presenças registradas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('scanner')}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-violet-600/20"
          >
            <Camera className="w-4 h-4" />
            <span>Fazer Chamada Facial</span>
          </button>
          <button
            onClick={onOpenNewTraining}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all border border-slate-300 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-violet-600" />
            <span>Nova Turma</span>
          </button>
        </div>
      </div>

      {/* Alert if no employees are registered yet */}
      {totalEmployees === 0 && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">
                Nenhum colaborador cadastrado no sistema
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Para que a IA reconheça os rostos durante o treinamento, cadastre os colaboradores com foto pela câmera.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('employees')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shrink-0 transition-all shadow-xs"
          >
            Cadastrar Colaborador
          </button>
        </div>
      )}

      {/* Real Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Colaboradores Cadastrados</span>
            <span className="p-2 bg-violet-50 text-violet-600 rounded-xl">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900">{totalEmployees}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalEmployees === 0 ? 'Nenhuma face registrada' : 'Faces ativas para verificação'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Turmas Ativas</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900">{activeTrainings}</p>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">Prontas para chamada facial</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Presenças Registradas</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900">{totalPresences}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Validadas com foto biométrica</p>
        </div>
      </div>

      {/* Trainings List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Turmas Cadastradas</h2>
          {trainings.length > 0 && (
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-bold text-violet-600 hover:text-violet-700"
            >
              Ver relatórios emitidos →
            </button>
          )}
        </div>

        {trainings.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Nenhum treinamento cadastrado</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Clique no botão abaixo para criar a primeira turma e iniciar a chamada.
            </p>
            <button
              onClick={onOpenNewTraining}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Criar Treinamento
            </button>
          </div>
        ) : (
          trainings.map((trn) => {
            const attendedCount = trn.attendees?.length || 0;
            const isEmAndamento = trn.status === 'em_andamento';
            const isConcluido = trn.status === 'concluido';

            return (
              <div
                key={trn.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-violet-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isEmAndamento
                          ? 'bg-violet-100 text-violet-800'
                          : isConcluido
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {isEmAndamento ? 'Em Andamento' : isConcluido ? 'Finalizado' : 'Agendado'}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-semibold">{trn.code}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {trn.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    Instrutor: <span className="font-medium text-slate-700">{trn.instructor}</span> • {trn.date} às {trn.startTime} ({trn.duration}) • Local: {trn.location}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900">{attendedCount}</span>
                    <span className="text-xs text-slate-400 block">presentes</span>
                  </div>

                  <button
                    onClick={() => setActiveTab('scanner')}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Fazer Chamada</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs transition-all"
                    title="Ver Lista de Presença em PDF"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="hidden sm:inline">Lista</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
