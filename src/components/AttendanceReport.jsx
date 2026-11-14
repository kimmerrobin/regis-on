import React, { useState } from 'react';
import { Printer, Download, CheckCircle, FileCheck, Shield, Calendar, Clock, MapPin, User, Building } from 'lucide-react';

export default function AttendanceReport({ trainings }) {
  const [selectedTrainingId, setSelectedTrainingId] = useState(trainings[0]?.id || '');

  const training = trainings.find((t) => t.id === selectedTrainingId) || trainings[0];
  const attendees = training?.attendees || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Selector & Actions Bar (hidden when printing) */}
      <div className="print:hidden bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Selecione o Treinamento para emissão:
          </label>
          <select
            value={selectedTrainingId}
            onChange={(e) => setSelectedTrainingId(e.target.value)}
            className="w-full sm:w-96 bg-slate-50 border border-slate-300 font-medium text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {trainings.map((trn) => (
              <option key={trn.id} value={trn.id}>
                {trn.title} - ({trn.attendees?.length || 0} participantes)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar em PDF</span>
          </button>
        </div>
      </div>

      {/* Official Document Sheet */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-slate-200 print:border-none print:shadow-none print:p-0 print:rounded-none">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-violet-700 font-black text-xs tracking-wider uppercase mb-1">
                <Shield className="w-4 h-4 text-violet-600" />
                <span>RegisON • Registro Digital de Treinamento</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                LISTA OFICIAL DE PRESENÇA • BIOMETRIA FACIAL
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Sua presença registrada em segundos • Conforme diretrizes das Normas Regulamentadoras (MTE / eSocial) e LGPD
              </p>

            </div>

            <div className="text-right border-l-2 border-slate-200 pl-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Código da Turma</span>
              <span className="text-lg font-mono font-bold text-slate-900">{training?.code || 'TRN-2026'}</span>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800 border border-violet-200">
                REGISON CERTIFIED
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mb-0.5">
                <FileCheck className="w-3.5 h-3.5 text-slate-400" /> Treinamento:
              </span>
              <p className="text-xs font-bold text-slate-900">{training?.title}</p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mb-0.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Instrutor Responsável:
              </span>
              <p className="text-xs font-bold text-slate-900">{training?.instructor}</p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mb-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Data e Horário:
              </span>
              <p className="text-xs font-bold text-slate-900">
                {training?.date} às {training?.startTime} ({training?.duration})
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mb-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Local:
              </span>
              <p className="text-xs font-bold text-slate-900">{training?.location}</p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mb-0.5">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Categoria:
              </span>
              <p className="text-xs font-bold text-slate-900">{training?.category}</p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mb-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-violet-600" /> Total Presentes:
              </span>
              <p className="text-xs font-bold text-violet-700">{attendees.length} colaboradores registrados</p>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Comprovante</th>
                <th className="py-2.5 px-3">Colaborador</th>
                <th className="py-2.5 px-3">CPF</th>
                <th className="py-2.5 px-3">Matrícula</th>
                <th className="py-2.5 px-3">Horário</th>
                <th className="py-2.5 px-3">Validação Biométrica</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {attendees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhum colaborador registrado nesta turma ainda.
                  </td>
                </tr>
              ) : (
                attendees.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <img
                        src={item.capturedPhoto}
                        alt={item.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-300 shadow-2xs"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{item.cpf}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{item.matricula}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                      {new Date(item.registeredAt).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-medium text-violet-700 bg-violet-50 border border-violet-200/60 px-2 py-0.5 rounded text-[11px]">
                        <CheckCircle className="w-3 h-3 text-violet-600" />
                        {item.method} ({item.confidence})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold text-violet-700 uppercase text-[10px] tracking-wider">
                        Confirmado
                      </span>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* Footer & Signature Declarations */}
        <div className="mt-12 pt-8 border-t border-slate-300">
          <p className="text-[11px] text-slate-500 mb-8 leading-relaxed">
            Declaro para os devidos fins legais que os trabalhadores relacionados acima participaram integralmente do treinamento especificado, com presença autenticada de forma eletrônica por biometria facial inviolável e conferência de identidade em conformidade com as exigências regulatórias.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center">
            <div className="border-t border-slate-400 pt-3">
              <p className="font-bold text-xs text-slate-900">{training?.instructor}</p>
              <p className="text-[11px] text-slate-500">Instrutor Responsável / Especialista</p>
            </div>
            <div className="border-t border-slate-400 pt-3">
              <p className="font-bold text-xs text-slate-900">Coordenação de Segurança do Trabalho / RH</p>
              <p className="text-[11px] text-slate-500">Responsável Legal da Empresa</p>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400 font-mono">
            Documento emitido digitalmente via PresençaBio em {new Date().toLocaleDateString('pt-BR')} às{' '}
            {new Date().toLocaleTimeString('pt-BR')} • Autenticação Criptográfica SHA-256
          </div>
        </div>
      </div>
    </div>
  );
}
