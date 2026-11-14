import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle2, AlertCircle, RefreshCw, Sparkles, UserCheck, ShieldAlert, SwitchCamera, Search, UserX, UserPlus, SlidersHorizontal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { findBestMatch, compareFaces, validateFaceStructure } from '../utils/faceComparison';

export default function FacialScanner({ trainings, employees, onRegisterAttendance, onNavigateToEmployees }) {
  const [selectedTrainingId, setSelectedTrainingId] = useState(trainings[0]?.id || '');
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null); // { type: 'SUCCESS' | 'NOT_FOUND' | 'ALREADY_PRESENT', data: ... }
  const [errorMsg, setErrorMsg] = useState(null);
  const [scanMode, setScanMode] = useState('auto'); // 'auto' (IA busca no banco) or 'targeted' (escolhe a pessoa e checa)
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [fallbackSearch, setFallbackSearch] = useState('');
  const [activeTabMode, setActiveTabMode] = useState('camera'); // 'camera' or 'fallback'

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const currentTraining = trainings.find((t) => t.id === selectedTrainingId) || trainings[0];
  const alreadyAttended = currentTraining?.attendees || [];

  // Web Audio feedback
  const playSound = (isSuccess) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = isSuccess ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(isSuccess ? 880 : 220, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + (isSuccess ? 0.25 : 0.4));
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + (isSuccess ? 0.25 : 0.4));
    } catch {
      // AudioContext unavailable
    }
  };

  // Start Camera
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMsg('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTabMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [facingMode, activeTabMode]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture frame normalizado central focado na face (400x400)
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const vW = video.videoWidth || 640;
    const vH = video.videoHeight || 480;
    const minDim = Math.min(vW, vH);
    const startX = (vW - minDim) / 2;
    const startY = (vH - minDim) / 2;

    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 400, 400);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  // Perform Face Scan and Matching against database
  const handleScanFace = async () => {
    if (scanning || !cameraActive) return;
    setScanning(true);
    setLastResult(null);

    const livePhoto = captureFrame();
    if (!livePhoto) {
      setScanning(false);
      return;
    }

    if (employees.length === 0) {
      setTimeout(() => {
        setLastResult({
          type: 'EMPTY_DATABASE',
          message: 'Nenhum colaborador cadastrado na base de dados ainda.',
        });
        playSound(false);
        setScanning(false);
      }, 700);
      return;
    }

    // Modo 1: Reconhecimento Automático (IA procura quem é no banco)
    if (scanMode === 'auto') {
      const matchResult = await findBestMatch(livePhoto, employees, 70);

      setTimeout(() => {
        if (matchResult.status === 'NO_FACE') {
          setLastResult({
            type: 'NO_FACE',
            message: matchResult.message,
            capturedPhoto: livePhoto,
          });
          playSound(false);
        } else if (matchResult.status === 'RECOGNIZED' && matchResult.match) {
          const matchedEmp = matchResult.match;
          const isAlreadyPresent = alreadyAttended.some((a) => a.employeeId === matchedEmp.id);

          if (isAlreadyPresent) {
            setLastResult({
              type: 'ALREADY_PRESENT',
              employee: matchedEmp,
              confidence: matchResult.confidence,
            });
            playSound(false);
          } else {
            const attendanceRecord = {
              employeeId: matchedEmp.id,
              name: matchedEmp.name,
              cpf: matchedEmp.cpf,
              matricula: matchedEmp.matricula,
              registeredAt: new Date().toISOString(),
              method: 'Reconhecimento Facial (IA RegisON)',
              confidence: matchResult.confidence,
              capturedPhoto: livePhoto,
            };

            onRegisterAttendance(selectedTrainingId, attendanceRecord);
            setLastResult({
              type: 'SUCCESS',
              record: attendanceRecord,
            });
            playSound(true);
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
          }
        } else {
          setLastResult({
            type: 'NOT_FOUND',
            confidence: matchResult.confidence,
            capturedPhoto: livePhoto,
          });
          playSound(false);
        }
        setScanning(false);
      }, 900);
    } else {
      // Modo 2: Verificação Nominal (Confere se a pessoa na câmera é quem foi selecionado)
      const targetEmp = employees.find((e) => e.id === targetEmployeeId);
      if (!targetEmp) {
        setScanning(false);
        alert('Selecione um colaborador para verificação individual.');
        return;
      }

      // Validação anti-fraude antes de comparar
      const faceCheck = await validateFaceStructure(livePhoto);
      if (!faceCheck.valid) {
        setTimeout(() => {
          setLastResult({
            type: 'NO_FACE',
            message: faceCheck.reason,
            capturedPhoto: livePhoto,
          });
          playSound(false);
          setScanning(false);
        }, 500);
        return;
      }

      const score = await compareFaces(targetEmp.photo, livePhoto);
      const scoreFormatted = `${score.toFixed(1)}%`;

      setTimeout(() => {
        if (score >= 70) {
          const isAlreadyPresent = alreadyAttended.some((a) => a.employeeId === targetEmp.id);

          if (isAlreadyPresent) {
            setLastResult({
              type: 'ALREADY_PRESENT',
              employee: targetEmp,
              confidence: scoreFormatted,
            });
            playSound(false);
          } else {
            const attendanceRecord = {
              employeeId: targetEmp.id,
              name: targetEmp.name,
              cpf: targetEmp.cpf,
              matricula: targetEmp.matricula,
              registeredAt: new Date().toISOString(),
              method: 'Validação Facial Nominal (RegisON)',
              confidence: scoreFormatted,
              capturedPhoto: livePhoto,
            };

            onRegisterAttendance(selectedTrainingId, attendanceRecord);
            setLastResult({
              type: 'SUCCESS',
              record: attendanceRecord,
            });
            playSound(true);
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
          }
        } else {
          setLastResult({
            type: 'MISMATCH',
            expected: targetEmp,
            confidence: scoreFormatted,
            capturedPhoto: livePhoto,
          });
          playSound(false);
        }
        setScanning(false);
      }, 900);
    }
  };

  // Fallback registration
  const handleFallbackRegister = (employee) => {
    const attendanceRecord = {
      employeeId: employee.id,
      name: employee.name,
      cpf: employee.cpf,
      matricula: employee.matricula,
      registeredAt: new Date().toISOString(),
      method: 'Manual (Instrutor/Matrícula)',
      confidence: 'Validado por Instrutor',
      capturedPhoto: employee.photo,
    };

    onRegisterAttendance(selectedTrainingId, attendanceRecord);
    setLastResult({
      type: 'SUCCESS',
      record: attendanceRecord,
    });
    playSound(true);
  };

  const filteredEmployeesForFallback = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(fallbackSearch.toLowerCase()) ||
      e.matricula.toLowerCase().includes(fallbackSearch.toLowerCase()) ||
      e.cpf.includes(fallbackSearch)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header & Training Selector */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-violet-100 text-violet-800 rounded-lg">
                <Camera className="w-5 h-5 text-violet-600" />
              </span>
              <h2 className="text-xl font-bold text-slate-900">Totem RegisON • Presença Facial</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sua presença registrada em segundos: escaneie o rosto do colaborador para validação instantânea.
            </p>

          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-auto">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Turma / Treinamento Ativo:
              </label>
              <select
                value={selectedTrainingId}
                onChange={(e) => setSelectedTrainingId(e.target.value)}
                className="w-full sm:w-80 bg-slate-50 border border-slate-300 text-slate-800 font-medium rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {trainings.map((trn) => (
                  <option key={trn.id} value={trn.id}>
                    {trn.title} ({trn.attendees?.length || 0} presentes)
                  </option>
                ))}
              </select>
            </div>

            {/* Mode switch */}
            <div className="flex bg-slate-100 p-1 rounded-xl self-end">
              <button
                onClick={() => setActiveTabMode('camera')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTabMode === 'camera'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Câmera Facial
              </button>
              <button
                onClick={() => setActiveTabMode('fallback')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTabMode === 'fallback'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Chamada Manual
              </button>
            </div>
          </div>
        </div>

        {/* Scan Mode Toggle (Automatic Match vs Targeted Verification) */}
        {activeTabMode === 'camera' && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Modo RegisON:</span>
              <button
                onClick={() => setScanMode('auto')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  scanMode === 'auto'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🔍 Automático (Busca no Banco)
              </button>
              <button
                onClick={() => {
                  setScanMode('targeted');
                  if (!targetEmployeeId && employees.length > 0) {
                    setTargetEmployeeId(employees[0].id);
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  scanMode === 'targeted'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                👤 Validação Nominal
              </button>
            </div>

            {scanMode === 'targeted' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Conferir presença de:</span>
                <select
                  value={targetEmployeeId}
                  onChange={(e) => setTargetEmployeeId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1.5"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.matricula})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Camera / Scanner (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {activeTabMode === 'camera' ? (
            <div className="bg-[#120e26] rounded-3xl p-4 sm:p-6 shadow-xl border border-violet-900/50 relative overflow-hidden">
              {/* Camera Container */}
              <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-violet-900/40 shadow-inner">
                {errorMsg ? (
                  <div className="p-6 text-center text-rose-300 max-w-sm">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                    <p className="text-sm font-semibold">{errorMsg}</p>
                    <button
                      onClick={startCamera}
                      className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                      style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                    />

                    {/* Biometric HUD Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
                      <div className="flex justify-between items-center text-[11px] font-mono tracking-wider text-violet-400">
                        <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-violet-500/30">
                          <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                          {scanMode === 'auto' ? 'REGISON IA MATCH' : 'VALIDAÇÃO NOMINAL'}
                        </span>
                        <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700 text-slate-300">
                          {employees.length} faces no banco
                        </span>
                      </div>

                      {/* Center Biometric Target Reticle */}
                      <div className="relative self-center w-52 h-64 sm:w-60 sm:h-72 border-2 border-dashed border-violet-400/60 rounded-[45px] flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.25)]">
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-violet-400 rounded-tl-xl" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-violet-400 rounded-tr-xl" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-violet-400 rounded-bl-xl" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-violet-400 rounded-br-xl" />

                        {/* Animated Laser Scanning Line */}
                        <div
                          className={`absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_15px_#a855f7] transition-all duration-700 ${
                            scanning ? 'animate-pulse' : ''
                          }`}
                          style={{
                            top: scanning ? '50%' : '20%',
                            transition: 'top 1.2s ease-in-out infinite alternate',
                          }}
                        />

                        <div className="text-center px-4 bg-black/60 backdrop-blur-xs rounded-xl py-2 border border-violet-500/20">
                          <p className="text-[12px] font-medium text-violet-200">
                            {scanning
                              ? 'Comparando biometria no banco RegisON...'
                              : 'Posicione o rosto dentro da moldura'}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-violet-900/40">
                        <span>REGISON BIOMETRIC ENGINE</span>
                        <span className="text-violet-400 font-bold">LGPD COMPLIANT</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFacingMode}
                    className="p-2.5 bg-violet-950/80 hover:bg-violet-900 text-violet-200 rounded-xl transition-all border border-violet-800/40"
                    title="Alternar Câmera Frontal / Traseira"
                  >
                    <SwitchCamera className="w-5 h-5" />
                  </button>
                  <button
                    onClick={startCamera}
                    className="p-2.5 bg-violet-950/80 hover:bg-violet-900 text-violet-200 rounded-xl transition-all border border-violet-800/40"
                    title="Recarregar Câmera"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                <button
                  disabled={scanning || !cameraActive}
                  onClick={handleScanFace}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xl ${
                    scanning
                      ? 'bg-amber-500 text-slate-950 animate-pulse'
                      : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30 border border-violet-400/30'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{scanning ? 'Verificando no RegisON...' : 'Escanear & Confirmar Presença'}</span>
                </button>
              </div>
            </div>
          ) : (

            /* Fallback Manual Registration */
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900">Registro Manual por Matrícula ou CPF</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Utilize este modo em caso de baixa iluminação ou uso de máscara.
              </p>

              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por nome, matrícula ou CPF..."
                  value={fallbackSearch}
                  onChange={(e) => setFallbackSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {filteredEmployeesForFallback.map((emp) => {
                  const isAttending = alreadyAttended.some((a) => a.employeeId === emp.id);
                  return (
                    <div key={emp.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={emp.photo} alt={emp.name} className="w-10 h-10 rounded-full object-cover border" />
                        <div>
                          <p className="font-bold text-sm text-slate-900">{emp.name}</p>
                          <p className="text-xs text-slate-500">
                            Matrícula: {emp.matricula} • CPF: {emp.cpf}
                          </p>
                        </div>
                      </div>

                      {isAttending ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmado
                        </span>
                      ) : (
                        <button
                          onClick={() => handleFallbackRegister(emp)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                        >
                          Confirmar Presença
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scan Results Display */}
          {lastResult && (
            <div>
              {/* SUCCESS */}
              {lastResult.type === 'SUCCESS' && (
                <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-2 border-violet-400 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in duration-300 shadow-lg shadow-violet-500/10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={lastResult.record.capturedPhoto}
                        alt={lastResult.record.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-violet-500 shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-full p-1 shadow-md shadow-violet-600/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-base">{lastResult.record.name}</h4>
                        <span className="text-[10px] font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                          Match {lastResult.record.confidence}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Matrícula: <span className="font-semibold">{lastResult.record.matricula}</span> • Horário:{' '}
                        <span className="font-semibold">
                          {new Date(lastResult.record.registeredAt).toLocaleTimeString('pt-BR')}
                        </span>
                      </p>
                      <p className="text-[11px] text-violet-700 font-medium">
                        ✓ Presença confirmada e registrada com sucesso no RegisON!
                      </p>
                    </div>
                  </div>
                </div>
              )}


              {/* ALREADY PRESENT */}
              {lastResult.type === 'ALREADY_PRESENT' && (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
                  <CheckCircle2 className="w-8 h-8 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Colaborador já confirmado anteriormente!
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      <strong>{lastResult.employee.name}</strong> já está com a presença registrada nesta turma.
                    </p>
                  </div>
                </div>
              )}

              {/* NOT RECOGNIZED IN DATABASE */}
              {lastResult.type === 'NOT_FOUND' && (
                <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                      <UserX className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-rose-900 text-sm">
                        Nenhum funcionário reconhecido!
                      </h4>
                      <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                        Este rosto não confere com nenhum colaborador cadastrado no banco de dados (Similaridade máx: {lastResult.confidence}).
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Cadastre o colaborador previamente com foto para que ele seja identificado automaticamente.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onNavigateToEmployees}
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs self-end sm:self-center shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Cadastrar Colaborador Agora</span>
                  </button>
                </div>
              )}

              {/* EMPTY DATABASE */}
              {lastResult.type === 'EMPTY_DATABASE' && (
                <div className="bg-blue-50 border-2 border-blue-400 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3">
                    <UserX className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-blue-900 text-sm">Banco de Colaboradores Vazio!</h4>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Cadastre pelo menos 1 funcionário com foto para que a IA possa fazer a comparação facial.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onNavigateToEmployees}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shrink-0"
                  >
                    Cadastrar Funcionário
                  </button>
                </div>
              )}

              {/* MISMATCH IN TARGETED MODE */}
              {lastResult.type === 'MISMATCH' && (
                <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
                  <UserX className="w-8 h-8 text-rose-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-rose-900 text-sm">
                      Rosto não confere com {lastResult.expected.name}!
                    </h4>
                    <p className="text-xs text-rose-700 mt-0.5">
                      A biometria na câmera não corresponde ao cadastro selecionado (Similaridade: {lastResult.confidence}).
                    </p>
                  </div>
                </div>
              )}

              {/* NO_FACE / ANTI-FRAUDE */}
              {lastResult.type === 'NO_FACE' && (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-amber-900 text-sm">
                      Validação Anti-Fraude: Rosto Não Detectado!
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                      {lastResult.message || 'Posicione o rosto inteiro dentro da moldura circular com olhos e nariz visíveis.'}
                    </p>
                    <p className="text-[11px] text-amber-700 font-medium mt-1">
                      O sistema rejeita imagens apontadas para o teto, paredes ou apenas parte da cabeça para evitar fraudes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Attendance List for Current Session (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col h-full">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Participantes Confirmados</h3>
              <p className="text-xs text-slate-500">{currentTraining?.title}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-violet-600">{alreadyAttended.length}</span>
              <span className="text-xs text-slate-400 font-medium">/{employees.length}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (alreadyAttended.length / (employees.length || 1)) * 100)}%`,
              }}
            />
          </div>

          {/* Attendees List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[500px]">
            {alreadyAttended.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <UserCheck className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
                <p className="text-sm font-medium">Nenhuma presença confirmada ainda.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Aproxime o rosto da câmera e clique em "Escanear & Confirmar Presença".
                </p>
              </div>
            ) : (
              alreadyAttended.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-150 hover:bg-slate-100/70 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={record.capturedPhoto}
                      alt={record.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-slate-900">{record.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{record.matricula}</span>
                        <span>•</span>
                        <span className="text-violet-600 font-semibold">{record.method}</span>
                      </div>
                    </div>
                  </div>


                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-2xs">
                      {new Date(record.registeredAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
