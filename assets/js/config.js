/* ==========================================================================
   REDE DESENVOLVI — CONFIGURAÇÃO DO SITE
   Edite SOMENTE este arquivo para: adicionar cidades, trocar telefones,
   textos de WhatsApp, equipe, depoimentos e parceiros.
   Nenhum telefone ou texto operacional fica "chumbado" no HTML.
   ========================================================================== */
window.REDE_CONFIG = {
  marca: {
    nome: 'Rede DesenvolVi',
    instagram: 'https://www.instagram.com/desenvol.vi/',
    instagramUsuario: '@desenvol.vi',
    consultoriaUrl: 'https://www.instagram.com/stories/highlights/18205305811158664/',
    primeiraInfanciaUrl: 'primeira-infancia.html'
  },

  /* Fotos do site. Coloque os arquivos em assets/img/fotos/ e preencha o caminho em "src".
     Deixe src vazio para manter a ilustração (topo) ou ocultar o espaço (demais). */
  fotos: {
    hero: { src: 'assets/img/fotos/01.jpg', alt: 'Profissional sorrindo e estimulando um bebê deitado de bruços em um tapete de atividades' },
    primeiraInfancia: { src: '', alt: 'Bebê explorando brinquedos sensoriais' }
  },

  /* Vídeos (YouTube). Troque o "id" para trocar o vídeo. */
  videos: {
    primeiraInfancia: { id: 'ttJtRokJJIk', titulo: 'O que é Primeira Infância?', canal: 'Fundação Maria Cecilia Souto Vidigal' }
  },

  /* Mensagens pré-preenchidas do WhatsApp (use {cidade} para inserir a cidade) */
  mensagens: {
    contato: 'Olá, gostaria de saber mais sobre o DesenvolVi!',
    aulaExperimental: 'Olá, gostaria de agendar uma aula experimental no DesenvolVi ({cidade})!',
    parceiro: 'Olá, quero conhecer a Rede DesenvolVi e ser parceiro(a)!'
  },

  /* Contato comercial da rede (seção "Seja parceiro"). Telefone com DDI+DDD, só números. */
  contatoRede: { telefone: '5532991359888' },

  /* Uma linha por unidade ativa. Para abrir uma nova cidade, copie um bloco. */
  cidades: [
    {
      id: 'jf',
      nome: 'Juiz de Fora',
      uf: 'MG',
      local: 'Shopping Alameda',
      telefone: '5532991359888',
      ativa: true
    },
    {
      id: 'sjc',
      nome: 'São José dos Campos',
      uf: 'SP',
      local: 'Boulevard Lugo',
      telefone: '5512992009404',
      ativa: true
    }
  ],

  /* Equipe. Para usar foto, preencha "foto" com o caminho (ex.: 'assets/img/equipe/vivi.jpg'). */
  equipe: [
    {
      nome: 'Drª Viviane Hipólito',
      apelido: 'Tia Vivi',
      cargo: 'Fisioterapeuta e administradora · sócia-fundadora',
      texto: 'Há 15 anos ajuda bebês a se desenvolverem de forma plena, orientando também seus familiares e responsáveis.',
      foto: '',
      iniciais: 'VH'
    },
    {
      nome: 'Drª Amanda Baio',
      apelido: '',
      cargo: 'Fisioterapeuta (UFJF) · responsável pela unidade Juiz de Fora',
      texto: 'Encantada pela fisioterapia pediátrica, direciona seu conhecimento para ajudar bebês e crianças a explorarem todo o seu potencial.',
      foto: '',
      iniciais: 'AB'
    }
  ],

  /* Depoimentos reais. Enquanto a lista estiver vazia, a seção fica oculta.
     Exemplo: { texto: '...', autor: 'Nome', detalhe: 'mãe do João, 8 meses · Juiz de Fora' } */
  depoimentos: [],

  parceiros: [
    { nome: 'Mamãe Dynamo', url: 'https://www.instagram.com/mamae_dynamo/' },
    { nome: 'Nutrikids', url: 'https://www.instagram.com/nutrikidsbr' },
    { nome: 'Casullo Saúde', url: 'https://www.instagram.com/casullo.saude' },
    { nome: 'Amo Vacinas SJC', url: 'https://amovacinassjc.com.br/' },
    { nome: 'Clínica Exclusivitè', url: 'https://www.instagram.com/clinicaexclusivite/' },
    { nome: 'Nana Neném', url: 'https://consultorianananenem.com.br/' },
    { nome: 'Somos Luanda', url: 'https://www.somosluanda.com.br/' }
  ]
};
