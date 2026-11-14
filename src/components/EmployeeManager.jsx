import React, { useState, useRef, useEffect } from 'react';
import { Users, UserPlus, Camera, Trash2, CheckCircle, ShieldCheck, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

export default function EmployeeManager({ employees, onAddEmployee, onDeleteEmployee, onNavigateToScanner }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [matricula, setMatricula] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUsingCam, setIsUsingCam] = useState(true); // Open camera by default on modal!
  const [camError, setCamError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startModalCamera = async () => {
    setCamError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsUsingCam(true);
    } catch (err) {
      console.error('Camera error:', err);
      setCamError('Câmera indisponível. Verifique as permissões.');
      setIsUsingCam(false);
    }
  };

  const stopModalCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (showModal && isUsingCam) {
      startModalCamera();
    } else {
      stopModalCamera();
    }
    return () => {
      stopModalCamera();
    };
  }, [showModal, isUsingCam]);

  const takeSelfieSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Corta e centraliza o quadrado da foto
    const v = videoRef.current;
    const minDim = Math.min(v.videoWidth || 400, v.videoHeight || 400);
    const startX = ((v.videoWidth || 400) - minDim) / 2;
    const startY = ((v.videoHeight || 400) - minDim) / 2;

    ctx.drawImage(v, startX, startY, minDim, minDim, 0, 0, 400, 400);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoUrl(dataUrl);
    stopModalCamera();
    setIsUsingCam(false);
  };

  const handleOpenModal = () => {
    setName('');
    setCpf('');
    setRole('');
    setDepartment('');
    setMatricula(`COLAB-${Math.floor(1000 + Math.random() * 9000)}`);
    setPhotoUrl('');
    setIsUsingCam(true);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !matricula) {
      alert('Preencha os campos obrigatórios (Nome e Matrícula).');
      return;
    }

    if (!photoUrl) {
      alert('Por favor, tire uma foto do rosto para registrar a biometria facial.');
      return;
    }

    const newEmp = {
      id: `emp-${Date.now()}`,
      name,
      cpf: cpf || '000.000.000-00',
      role: role || 'Operador / Colaborador',
      department: department || 'Operação',
      matricula,
      photo: photoUrl,
      registeredAt: new Date().toISOString(),
    };

    onAddEmployee(newEmp);
    setShowModal(false);
    stopModalCamera();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-violet-100 text-violet-800 rounded-lg">
              <Users className="w-5 h-5 text-violet-600" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Banco de Colaboradores RegisON</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre os colaboradores com foto biométrica para identificação automática pela câmera.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-violet-600/30"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Colaborador (com Câmera)</span>
          </button>
        </div>
      </div>

      {/* Guide Banner */}
      <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border border-violet-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-600 text-white rounded-xl font-bold text-xs">PASSO 1</div>
          <p className="text-xs text-violet-950">
            <strong>Cadastre seu próprio rosto primeiro!</strong> Clique no botão acima, capture sua selfie pela câmera e digite seu nome. Depois, vá para o Totem e teste o reconhecimento automático!
          </p>
        </div>
        <button
          onClick={onNavigateToScanner}
          className="flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-800 shrink-0 self-end sm:self-center"
        >
          <span>Ir para a Chamada</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 text-base">Nenhum funcionário cadastrado</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Cadastre o primeiro colaborador tirando uma foto com a câmera para começar os testes biométricos.
            </p>
            <button
              onClick={handleOpenModal}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-600/30"
            >
              Cadastrar Agora
            </button>
          </div>
        ) : (
          employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-violet-300 transition-all flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={emp.photo}
                    alt={emp.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-violet-500 shadow-sm"
                  />
                  <div
                    className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-full p-1 shadow-md shadow-violet-600/30"
                    title="Biometria Ativa"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {emp.matricula}
                    </span>
                    <span className="text-[10px] text-violet-700 font-bold bg-violet-50 border border-violet-200/60 px-2 py-0.5 rounded-full">
                      Face Ativa
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-1 truncate">{emp.name}</h3>
                  <p className="text-xs text-slate-600 truncate">{emp.role}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {emp.department} • CPF: {emp.cpf}
                  </p>
                </div>
              </div>

              {onDeleteEmployee && (
                <button
                  onClick={() => onDeleteEmployee(emp.id)}
                  className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg transition-all"
                  title="Excluir Colaborador"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Employee Modal with Live Camera */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Cadastrar Colaborador & Biometria</h3>
            <p className="text-xs text-slate-500 mb-4">
              Posicione o rosto na câmera para registrar a foto de referência no RegisON.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Camera Box */}
              <div className="flex flex-col items-center">
                {isUsingCam ? (
                  <div className="relative w-56 h-56 bg-slate-950 rounded-3xl overflow-hidden border-2 border-violet-500 shadow-xl">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                    {/* Face Reticle */}
                    <div className="absolute inset-4 border-2 border-dashed border-violet-400/80 rounded-full pointer-events-none flex items-center justify-center">
                      <span className="text-[10px] text-violet-200 font-bold bg-black/60 px-2 py-0.5 rounded-full border border-violet-500/30">
                        Centralize o rosto
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={takeSelfieSnapshot}
                      className="absolute bottom-3 left-4 right-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-violet-600/30 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capturar Biometria</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="relative inline-block">
                      <img
                        src={photoUrl}
                        alt="Foto Capturada"
                        className="w-36 h-36 rounded-2xl object-cover border-2 border-violet-500 shadow-md mx-auto mb-2"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-full p-1 shadow-md shadow-violet-600/30">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={startModalCamera}
                        className="flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3.5 py-1.5 rounded-xl transition-all mx-auto border border-violet-200"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Tirar Nova Foto</span>
                      </button>
                    </div>
                  </div>
                )}
                {camError && <p className="text-xs text-rose-500 mt-2">{camError}</p>}
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Robin Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Matrícula *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: MAT-101"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CPF</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cargo / Função</label>
                    <input
                      type="text"
                      placeholder="Ex: Eletricista"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Setor / Área</label>
                    <input
                      type="text"
                      placeholder="Ex: Manutenção"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    stopModalCamera();
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-violet-600/30"
                >
                  Salvar Colaborador & Face
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

