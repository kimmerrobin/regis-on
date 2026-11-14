import React, { useState } from 'react';
import { PlusCircle, X, Shield, Calendar, Clock, MapPin, User } from 'lucide-react';

export default function NewTrainingModal({ isOpen, onClose, onAddTraining }) {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [duration, setDuration] = useState('4 horas');
  const [location, setLocation] = useState('Sala de Treinamento 01');
  const [category, setCategory] = useState('Segurança do Trabalho (NR)');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !instructor) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const newTraining = {
      id: `trn-${Date.now()}`,
      title,
      code: code || `TRN-${Math.floor(1000 + Math.random() * 9000)}`,
      instructor,
      date,
      startTime,
      duration,
      location,
      category,
      description,
      status: 'em_andamento',
      attendees: [],
    };

    onAddTraining(newTraining);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-violet-100 text-violet-800 rounded-xl">
              <PlusCircle className="w-5 h-5 text-violet-600" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Cadastrar Nova Turma no RegisON</h3>
              <p className="text-xs text-slate-500">Crie o treinamento para iniciar a coleta de presenças por reconhecimento facial</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Título do Treinamento / Curso *</label>
            <input
              type="text"
              required
              placeholder="Ex: NR-10: Segurança em Instalações e Serviços em Eletricidade"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Código da Turma</label>
              <input
                type="text"
                placeholder="Ex: NR-10-2026-TURMA-A"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instrutor Responsável *</label>
              <input
                type="text"
                required
                placeholder="Ex: Eng. André Vilar (CREA 9921)"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Data da Realização</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Horário de Início</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Carga Horária</label>
              <input
                type="text"
                placeholder="Ex: 8 horas"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Local / Sala</label>
              <input
                type="text"
                placeholder="Ex: Sala de Reunião Bloco B"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Segurança do Trabalho (NR)">Segurança do Trabalho (NR)</option>
              <option value="Operacional & Máquinas">Operacional & Máquinas</option>
              <option value="Integração Institucional">Integração Institucional</option>
              <option value="Qualidade & Meio Ambiente">Qualidade & Meio Ambiente</option>
              <option value="Liderança & RH">Liderança & RH</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-violet-600/30"
            >
              Iniciar Treinamento & Chamada
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
