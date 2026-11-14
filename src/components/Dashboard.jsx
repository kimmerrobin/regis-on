import React from 'react';
import { Camera, Users, CheckCircle, Clock, ArrowRight, Award, Plus, FileSpreadsheet, ShieldCheck, Sparkles } from 'lucide-react';

export default function Dashboard({ trainings, employees, setActiveTab, onOpenNewTraining }) {
  const totalEmployees = employees.length;
  const activeTrainings = trainings.filter((t) => t.status === 'em_andamento').length;
  const completedTrainings = trainings.filter((t) => t.status === 'concluido').length;
  const totalPresences = trainings.reduce((acc, t) => acc + (t.attendees?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Banner matching Slide 1 of RegisON Presentation */}
      <div className="bg-gradient-to-br from-[#1e1744] via-[#281f5c] to-[#161130] rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-violet-800/40 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold border border-violet-500/30 mb-4 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Proposta de solução para treinamentos com reconhecimento facial</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-600/40 border border-violet-400/30">
              <CheckCircle className="w-7 h-7 text-white stroke-[2.5]" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Regis<span className="text-violet-400">ON</span>
            </h1>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-violet-200 mt-2">
            Sua presença registrada em segundos.
          </h2>


          <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed max-w-2xl">
            Substitui assinaturas manuais, reduz filas, agiliza o processo e organiza os registros digitalmente. Mais rapidez para quem organiza o treinamento e menos tempo de espera para os trabalhadores.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setActiveTab('scanner')}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold px-6 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-violet-600/30 border border-violet-400/30"
            >
              <Camera className="w-5 h-5 text-violet-200" />
              <span>Abrir Totem / Fazer Chamada</span>
            </button>
            <button
              onClick={onOpenNewTraining}
              className="flex items-center gap-2 bg-slate-900/60 hover:bg-slate-900/90 text-white font-bold px-5 py-3.5 rounded-2xl text-sm transition-all border border-violet-700/40 backdrop-blur-md"
            >
              <Plus className="w-4 h-4 text-violet-400" />
              <span>Cadastrar Nova Turma</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-violet-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Turmas Ativas</span>
            <span className="p-2 bg-violet-50 text-violet-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900">{activeTrainings}</p>
          <p className="text-[11px] text-violet-600 font-medium mt-1">Prontas para chamada</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-violet-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Presenças Registradas</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CheckCircle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900">{totalPresences}</p>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">Validadas com foto biométrica</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-violet-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Colaboradores</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900">{totalEmployees}</p>
          <p className="text-[11px] text-purple-600 font-medium mt-1">Biometrias no banco</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-violet-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tempo Economizado</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900">~92%</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Redução de filas e papel</p>
        </div>
      </div>

      {/* Main Grid: Trainings & Presentation Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trainings (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Turmas e Treinamentos</h2>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              <span>Ver relatórios emitidos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {trainings.map((trn) => {
              const attendedCount = trn.attendees?.length || 0;
              const isEmAndamento = trn.status === 'em_andamento';
              const isConcluido = trn.status === 'concluido';

              return (
                <div
                  key={trn.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-violet-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isEmAndamento
                            ? 'bg-violet-100 text-violet-800 animate-pulse'
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
                      Instrutor: <span className="font-medium text-slate-700">{trn.instructor}</span> • {trn.date} às {trn.startTime} ({trn.duration})
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-900">{attendedCount}</span>
                      <span className="text-xs text-slate-400 block">presentes</span>
                    </div>

                    {isEmAndamento ? (
                      <button
                        onClick={() => setActiveTab('scanner')}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Fazer Chamada</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('reports')}
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs transition-all"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Ver Lista</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: RegisON Value Canvas (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gradient-to-br from-[#1e1744] to-[#251b54] rounded-2xl p-5 text-white border border-violet-800/40 shadow-sm">
            <h3 className="font-extrabold text-sm flex items-center gap-2 mb-2 text-violet-200">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              Diferenciais RegisON (Canva)
            </h3>
            <ul className="text-xs text-slate-200 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-violet-400 font-bold">✓</span>
                <span><strong>Solução:</strong> Aplicativo que registra a presença dos trabalhadores em treinamentos por reconhecimento facial.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 font-bold">✓</span>
                <span><strong>Diferencial:</strong> Substitui assinaturas manuais, reduz filas e organiza os registros digitalmente.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 font-bold">✓</span>
                <span><strong>Benefícios:</strong> Mais rapidez para o instrutor e menos tempo de espera para os trabalhadores.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 font-bold">✓</span>
                <span><strong>Conformidade LGPD:</strong> Proteção dos dados biométricos dos trabalhadores.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Base de Colaboradores</h3>
            <p className="text-xs text-slate-500 mb-3">
              Fotos biométricas registradas para conferência automática da IA.
            </p>
            <div className="flex -space-x-2 overflow-hidden py-1 mb-4">
              {employees.slice(0, 5).map((e) => (
                <img
                  key={e.id}
                  src={e.photo}
                  alt={e.name}
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover shadow-xs"
                />
              ))}
            </div>
            <button
              onClick={() => setActiveTab('employees')}
              className="w-full text-center py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-all"
            >
              Gerenciar Colaboradores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
