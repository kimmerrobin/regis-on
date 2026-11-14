export const initialEmployees = [
  {
    id: 'emp-1',
    name: 'Carlos Eduardo Santos',
    cpf: '123.456.789-01',
    role: 'Operador de Empilhadeira',
    department: 'Logística',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    matricula: 'LOG-4091'
  },
  {
    id: 'emp-2',
    name: 'Mariana Ribeiro Alves',
    cpf: '234.567.890-12',
    role: 'Técnica Eletricista',
    department: 'Manutenção',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    matricula: 'MAN-2104'
  },
  {
    id: 'emp-3',
    name: 'João Pedro de Oliveira',
    cpf: '345.678.901-23',
    role: 'Montador Industrial',
    department: 'Produção',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    matricula: 'PRO-8812'
  },
  {
    id: 'emp-4',
    name: 'Fernanda Costa Lima',
    cpf: '456.789.012-34',
    role: 'Auxiliar de Almoxarifado',
    department: 'Suprimentos',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    matricula: 'SUP-1190'
  },
  {
    id: 'emp-5',
    name: 'Roberto Silveira Mendes',
    cpf: '567.890.123-45',
    role: 'Soldador Especialista',
    department: 'Produção',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    matricula: 'PRO-5541'
  }
];

export const initialTrainings = [
  {
    id: 'trn-1',
    title: 'NR-35: Trabalho em Altura e Prevenção de Quedas',
    code: 'NR-35-2026',
    instructor: 'Eng. Lucas Miranda (CREA 48291)',
    date: '2026-10-08',
    startTime: '08:00',
    duration: '8 horas',
    location: 'Centro de Treinamento - Sala 02',
    category: 'Segurança do Trabalho (Obrigatório)',
    description: 'Capacitação teórica e prática para execução de atividades com risco de queda acima de 2 metros de altura.',
    status: 'em_andamento', // 'em_andamento', 'concluido', 'agendado'
    attendees: [
      {
        employeeId: 'emp-1',
        name: 'Carlos Eduardo Santos',
        cpf: '123.456.789-01',
        matricula: 'LOG-4091',
        registeredAt: '2026-10-08T08:05:12',
        method: 'Reconhecimento Facial',
        confidence: '99.2%',
        capturedPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
      },
      {
        employeeId: 'emp-2',
        name: 'Mariana Ribeiro Alves',
        cpf: '234.567.890-12',
        matricula: 'MAN-2104',
        registeredAt: '2026-10-08T08:12:45',
        method: 'Reconhecimento Facial',
        confidence: '98.7%',
        capturedPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
      }
    ]
  },
  {
    id: 'trn-2',
    title: 'NR-06: Uso, Higienização e Guarda de EPIs',
    code: 'NR-06-2026',
    instructor: 'Téc. Beatriz Neves (MTE 001924)',
    date: '2026-10-09',
    startTime: '14:00',
    duration: '4 horas',
    location: 'Auditório Principal',
    category: 'EPI e Higiene Ocupacional',
    description: 'Orientação técnica e responsabilidades sobre equipamentos de proteção individual.',
    status: 'agendado',
    attendees: []
  },
  {
    id: 'trn-3',
    title: 'Integração de Segurança para Novos Colaboradores',
    code: 'INT-SEC-26',
    instructor: 'Coord. Rafael Fontes',
    date: '2026-10-05',
    startTime: '09:00',
    duration: '6 horas',
    location: 'Sala Multimídia A',
    category: 'Integração Institucional',
    description: 'Normas gerais da fábrica, rotas de fuga, brigada de incêndio e política de zero acidentes.',
    status: 'concluido',
    attendees: [
      {
        employeeId: 'emp-3',
        name: 'João Pedro de Oliveira',
        cpf: '345.678.901-23',
        matricula: 'PRO-8812',
        registeredAt: '2026-10-05T09:04:10',
        method: 'Reconhecimento Facial',
        confidence: '97.9%',
        capturedPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
      },
      {
        employeeId: 'emp-4',
        name: 'Fernanda Costa Lima',
        cpf: '456.789.012-34',
        matricula: 'SUP-1190',
        registeredAt: '2026-10-05T09:07:33',
        method: 'Reconhecimento Facial',
        confidence: '99.1%',
        capturedPhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80'
      },
      {
        employeeId: 'emp-5',
        name: 'Roberto Silveira Mendes',
        cpf: '567.890.123-45',
        matricula: 'PRO-5541',
        registeredAt: '2026-10-05T09:11:02',
        method: 'Manual (Matrícula)',
        confidence: 'Validado por Instrutor',
        capturedPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80'
      }
    ]
  }
];
