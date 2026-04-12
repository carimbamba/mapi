/**
 * Biblioteca de Guias de Manejo — MAPI
 *
 * Orientações práticas para professores de alunos neurodivergentes.
 * Textos na linguagem do professor, não do clínico.
 * Baseados em: DSM-5, diretrizes CFP, SBNp e literatura de educação inclusiva.
 *
 * IMPORTANTE: estes guias são ferramentas de apoio docente.
 * NÃO substituem avaliação profissional especializada.
 *
 * Uso:
 *   import { getGuide, getAllGuides, getSeatingRecommendationsForClass } from "@/lib/accessibility/condition-guides";
 *   const teaGuide = getGuide("TEA");
 */

// ─── JSDoc Types ─────────────────────────────────────────────────────────────

/**
 * @typedef {import('@/types').DiagnosisType} DiagnosisType
 */

/**
 * @typedef {Object} ConditionGuide
 * @property {DiagnosisType} id
 * @property {string} name
 * @property {string} shortDescription — 1 linha, para tooltip
 * @property {string} color — cor do badge
 * @property {string} icon — nome do ícone Lucide
 * @property {string[]} seatingRecommendations — posicionamento ideal em sala
 * @property {string[]} doList — o que fazer em sala
 * @property {string[]} dontList — erros comuns a evitar
 * @property {string[]} crisisProtocol — passos em situação de crise
 * @property {string[]} communicationTips — como comunicar com a família
 * @property {string} disclaimer
 */

/**
 * @typedef {import('@/types').Student} Student
 */

// ─── Guías ───────────────────────────────────────────────────────────────────

/**
 * @type {Record<DiagnosisType, ConditionGuide>}
 */
export const conditionGuides = {
  // ═══════════════════════════════════════════════════════════════════════════
  // TEA — Transtorno do Espectro Autista
  // ═══════════════════════════════════════════════════════════════════════════

  TEA: {
    id: "TEA",
    name: "TEA — Transtorno do Espectro Autista",
    shortDescription:
      "Diferenças na comunicação social, interesses focados e processamento sensorial diferenciado.",
    color: "indigo",
    icon: "Brain",
    seatingRecommendations: [
      "Posicione em local previsível — evite mudar o lugar do aluno sem aviso prévio.",
      "Prefira posições nas laterais ou cantos da sala, longe do fluxo de corredor (menos estímulo visual e sonoro).",
      "Evite assentos próximos a portas, janelas abertas ou equipamentos barulhentos (ventilador, projetor).",
    ],
    doList: [
      "Antecipe mudanças na rotina: avise com antecedência se a sala vai mudar de lugar ou se haverá atividade diferente.",
      "Use instruções claras, curtas e diretas. Evite linguagem figurada, ironia ou duplo sentido sem explicar.",
      "Ofereça apoio visual: agenda do dia no quadro, cartões de transição ('agora X, depois Y').",
      "Respeite o tempo de processamento do aluno — espere 5–10 segundos antes de repetir uma pergunta.",
      "Permita uso de fones de ouvido ou 'cantinho da calma' se o aluno demonstrar sobrecarga sensorial (tapar ouvidos, balançar).",
      "Identifique os interesses focais do aluno e use como ponte para engajar em atividades.",
    ],
    dontList: [
      "Não force contato visual direto — muitos alunos autistas processam melhor a informação olhando para o lado.",
      "Não ignore sinais de sobrecarga sensorial: tapar ouvidos, cobrir os olhos, balançar o corpo são pedidos de ajuda, não 'manha'.",
      "Não use tom de voz elevado ou surpreendente perto do aluno — mudanças bruscas de som podem desencadear crise.",
      "Não isole o aluno socialmente como estratégia de 'proteção' — inclusão significa participação, não segregação.",
      "Não projete o mapa de sala com ícones de diagnóstico visíveis para a turma — isso expõe o aluno.",
    ],
    crisisProtocol: [
      "1. Garanta a segurança: afaste colegas, remova objetos perigosos, não segure o aluno a menos que haja risco iminente.",
      "2. Reduza estímulos: apague luzes fortes, desligue projetor/som, peça silêncio à turma com naturalidade ('vamos fazer um momento de silêncio').",
      "3. Não fale muito durante a crise — use frases curtas e calmantes: 'Estou aqui. Você está seguro. Vai passar.'",
      "4. Após a crise: ofereça água, espaço e tempo. Não questione 'o que aconteceu?' imediatamente. Registre no Diário de Bordo.",
    ],
    communicationTips: [
      "Descreva comportamentos observados sem julgamento: 'notei que João cobriu os ouvidos quando o projetor ligou' em vez de 'João teve uma crise'.",
      "Pergunte se os mesmos padrões ocorrem em casa — isso ajuda a identificar gatilhos ambientais.",
      "Compartilhe progressos, não apenas dificuldades: 'Hoje João participou da atividade em grupo por 10 minutos' é tão importante quanto relatar desafios.",
    ],
    disclaimer:
      "Este guia é ferramenta de apoio docente e NÃO substitui avaliação especializada por profissional de saúde (psicólogo, neuropsicólogo ou psiquiatra). Cada aluno é único — use estas orientações como ponto de partida e observe o que funciona na sua realidade.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TDAH — Transtorno do Déficit de Atenção e Hiperatividade
  // ═══════════════════════════════════════════════════════════════════════════

  TDAH: {
    id: "TDAH",
    name: "TDAH — Déficit de Atenção com Hiperatividade",
    shortDescription:
      "Dificuldade em filtrar estímulos, impulsividade e inquietação psicomotora.",
    color: "amber",
    icon: "Zap",
    seatingRecommendations: [
      "Posicione próximo ao professor — a proximidade física ajuda na regulação atencional.",
      "Evite assentos perto de janelas, portas, murais coloridos ou qualquer fonte de distração visual.",
      "Prefira posições onde o aluno possa se movimentar discretamente (levantar para entregar material, ir ao quadro).",
    ],
    doList: [
      "Divida tarefas longas em etapas menores com checkpoints: 'Primeiro faça as 3 primeiras questões. Quando terminar, me chama.'",
      "Ofereça feedback imediato e frequente — alunos com TDAH respondem melhor a reforços curtos e constantes.",
      "Use timers visuais (ampulheta, timer no celular) para transições de atividade. A contagem visual ajuda na percepção do tempo.",
      "Permita movimentação discreta: assentos ativos, bola de exercício, ou a permissão de ficar em pé no fundo da sala.",
      "Combine sinais discretos com o aluno para redirecionar a atenção sem expor: um toque na mesa, um olhar, um gesto combinado.",
      "Valorize a energia e a criatividade do aluno — muitos são excelentes em brainstorm, resolução de problemas e pensamento lateral.",
    ],
    dontList: [
      "Não puna a inquietação como 'mau comportamento' — é um sintoma neurológico, não desobediência.",
      "Não dê instruções múltiplas de uma vez — em vez de 'abra o livro, vá para a página 20 e faça os exercícios', dê uma instrução por vez.",
      "Não coloque o aluno em filas longas ou esperas prolongadas — a falta de estímulo é mais prejudicial que o excesso.",
      "Não use vermelho para identificar o aluno no mapa projetado — isso expõe e estigmatiza.",
      "Não assuma que o aluno 'não está prestando atenção' porque está olhando para o lado — muitos com TDAH ouvem e processam enquanto se movem.",
    ],
    crisisProtocol: [
      "1. Garanta a segurança: afaste colegas se necessário e remova objetos perigosos do alcance.",
      "2. Redirecione a energia: peça uma tarefa física (apagar o quadro, distribuir material). Isso canaliza a impulsividade de forma produtiva.",
      "3. Se houver comportamento impulsivo agressivo: separe o aluno da situação com calma. 'Vamos conversar lá fora por um minuto' — não discuta na frente da turma.",
      "4. Após o episódio: valide o sentimento ('eu entendo que você ficou frustrado') e redirecione. Registre no Diário de Bordo: contexto, gatilho, duração e resolução.",
    ],
    communicationTips: [
      "Relate episódios específicos com contexto: 'durante a prova de matemática, Pedro levantou 5 vezes e conversou com colegas' em vez de 'Pedro não para quieto'.",
      "Evite rótulos como 'preguiçoso', 'desinteressado' ou 'bagunceiro' — eles reforçam estigma e não ajudam.",
      "Sugira estratégias que funcionam na escola para uso em casa: 'Pedro consegue focar melhor quando faz pausas a cada 15 minutos. Que tal tentar nos deveres de casa?'",
    ],
    disclaimer:
      "Este guia é ferramenta de apoio docente e NÃO substitui avaliação especializada por profissional de saúde. Estimativas da Conitec indicam que ~7,6% das crianças em idade escolar têm TDAH — seu aluno não está sozinho.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TOD — Transtorno Opositivo Desafiador
  // ═══════════════════════════════════════════════════════════════════════════

  TOD: {
    id: "TOD",
    name: "TOD — Transtorno Opositivo Desafiador",
    shortDescription:
      "Padrão persistente de comportamento desafiador, irritável e argumentativo.",
    color: "orange",
    icon: "ShieldAlert",
    seatingRecommendations: [
      "Evite proximidade com alunos com histórico de conflito mútuo — a dinâmica pode escalar rapidamente.",
      "Garanta 'saída de honra': posicione o aluno de forma que possa se retirar da situação sem passar pela frente da turma.",
      "Prefira posições que permitam ao professor abordar de forma discreta (lateral, não frontal).",
    ],
    doList: [
      "Ofereça escolhas limitadas para dar sensação de controle: 'Você prefere começar pela questão 1 ou pela 3?' — isso reduz a resistência.",
      "Use linguagem calma e neutra, evite confrontação direta. Em vez de 'faça agora', experimente 'quando você puder, comece a atividade'.",
      "Reforce comportamentos positivos imediatamente — alunos com TOD recebem muito mais feedback negativo que positivo. Inverta essa balança.",
      "Estabeleça regras claras e consistentes com consequências previsíveis. O aluno precisa saber o que esperar.",
      "Identifique os gatilhos: cansaço, fome, frustração com conteúdo difícil? Antecipar previne a escalada.",
      "Construa vínculo fora do momento de conflito: um cumprimento na porta, interesse genuíno em algo que o aluno gosta.",
    ],
    dontList: [
      "Não entre em debates prolongados com o aluno — TOD é alimentado pela atenção, mesmo negativa. 'Conversamos depois' e siga em frente.",
      "Não use tom de voz autoritário ou ameaçador — isso escala o conflito em vez de resolver.",
      "Não exponha o aluno à humilhação pública — 'fique de pé na frente da turma' ou 'você sempre faz isso' são gatilhos poderosos.",
      "Não ignore comportamentos disruptivos iniciais — intervenha cedo, antes que escale.",
      "Não leve para o pessoal. O comportamento desafiador não é sobre você — é sobre dificuldade de regulação emocional.",
    ],
    crisisProtocol: [
      "1. Não confronte no auge da crise. Dê espaço: 'Percebi que você está chateado. Vou te dar um minuto e depois conversamos.'",
      "2. Se o aluno se recusar a seguir regras de segurança: não force fisicamente. Chame o coordenador ou especialista.",
      "3. Após a crise: reconecte antes de corrigir. 'Eu me importo com você. O que aconteceu não está OK, mas eu quero te ajudar.'",
      "4. Documente: data, horário, contexto, duração, resolução. Padrões ajudam a identificar prevenção e acionar apoio especializado.",
    ],
    communicationTips: [
      "Descreva o padrão, não o episódio isolado: 'nas últimas 2 semanas, houve 4 situações de recusa em iniciar atividades' em vez de 'hoje ele não fez nada'.",
      "Enfatize que TOD é um transtorno do neurodesenvolvimento, não 'falha de criação' ou 'má educação'.",
      "Sugira abordagem consistente entre escola e casa: 'Quando Pedro se recusa, nós oferecemos duas opções. Tem funcionado aqui — que tal tentar em casa?'",
    ],
    disclaimer:
      "Este guia é ferramenta de apoio docente e NÃO substitui avaliação especializada. O TOD frequentemente coexiste com TDAH — fique atento a sinais de ambas as condições.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DISLEXIA
  // ═══════════════════════════════════════════════════════════════════════════

  DISLEXIA: {
    id: "DISLEXIA",
    name: "Dislexia",
    shortDescription:
      "Dificuldade específica em leitura, escrita e soletração com inteligência preservada.",
    color: "teal",
    icon: "BookOpen",
    seatingRecommendations: [
      "Posicione de forma que facilite a visualização do quadro e do material projetado — o aluno precisa ver claramente para compensar a dificuldade de leitura.",
      "Prefira assentos com boa iluminação e sem reflexo — muitos disléxicos têm sensibilidade visual (estresse de Irlen).",
      "Permita acesso fácil a materiais de apoio (dicionário, tabuada, calculadora) sem precisar pedir — a autonomia reduz a ansiedade.",
    ],
    doList: [
      "Use fontes sem serifa (Arial, Verdana, OpenDyslexic) em tamanho 12+ nos materiais escritos. Evite texto justificado.",
      "Permita tempo extra para atividades de leitura e prova — a dislexia não afeta a compreensão, apenas a velocidade de decodificação.",
      "Ofereça material em áudio ou digital quando possível. Livros falados e leitura por pares são estratégias valiosas.",
      "Corrija o conteúdo, não a forma: se a resposta de matemática está certa mas a escrita tem erros, valorize o raciocínio.",
      "Use avaliações orais ou práticas como alternativa à escrita — o aluno pode demonstrar conhecimento sem a barreira da decodificação.",
      "Ensine estratégias de compensação: mapas mentais, gravação de aulas, uso de tecnologia assistiva (leitores de tela, ditado por voz).",
    ],
    dontList: [
      "Não peça para o aluno ler em voz alta sem aviso prévio — isso gera ansiedade extrema e reforço negativo.",
      "Não corrija erros de soletração de forma pública ou com caneta vermelha — cada erro exposto é uma ferida na autoestima.",
      "Não assuma que dificuldade de leitura = falta de esforço — o aluno disléxico se esforça mais que qualquer colega para decodificar.",
      "Não use textos longos e densos sem apoio visual — divida em blocos, use imagens, diagramas e esquemas.",
      "Não compare com colegas: 'seu irmão lia com 5 anos' é destrutivo e cientificamente irrelevante.",
    ],
    crisisProtocol: [
      "1. Garanta a segurança emocional: não force a leitura. Remova a pressão imediata e ofereça alternativa.",
      "2. Se o aluno se recusa a ler ou escrever: ofereça alternativa imediata: 'Você pode me explicar oralmente o que entendeu?'",
      "3. Se há sinais de ansiedade extrema (choro, tremor, fuga): acolha. 'Eu sei que ler é difícil para você. Isso não significa que você não é inteligente.'",
      "4. Após o episódio: reconecte o aluno com suas fortalezas. Registre no Diário de Bordo para acompanhar padrões.",
    ],
    communicationTips: [
      "Informe sobre recursos disponíveis: livros em áudio, tecnologia assistiva, direitos de adaptação curricular.",
      "Compartilhe estratégias visuais que funcionam em sala para uso em casa: 'Maria aprendeu o conteúdo com mapas mentais. Que tal tentar nos estudos?'",
      "Reforce que dislexia é comum e não define inteligência: mencione exemplos de profissionais bem-sucedidos com dislexia (Einstein, Spielberg).",
    ],
    disclaimer:
      "Este guia é ferramenta de apoio docente e NÃO substitui avaliação especializada por psicopedagogo ou fonoaudiólogo. A dislexia afeta 5–17% da população escolar — seu aluno não está sozinho.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DISCALCULIA
  // ═══════════════════════════════════════════════════════════════════════════

  DISCALCULIA: {
    id: "DISCALCULIA",
    name: "Discalculia",
    shortDescription:
      "Dificuldade específica em raciocínio matemático, compreensão numérica e cálculo.",
    color: "rose",
    icon: "Calculator",
    seatingRecommendations: [
      "Posicione próximo a colegas que possam apoiar em atividades práticas — o trabalho em pares é uma estratégia poderosa.",
      "Garanta acesso fácil a materiais concretos (ábaco, material dourado, réguas, calculadora).",
      "Prefira assentos com espaço na mesa para materiais de apoio visuais e manipuláveis.",
    ],
    doList: [
      "Permita uso de calculadora e tabelas de multiplicação em todas as atividades — a discalculia afeta o cálculo, não o raciocínio.",
      "Use materiais concretos e visuais para conceitos matemáticos: blocos, gráficos, cores diferentes para cada operação.",
      "Forneça instruções passo a passo escritas para resolução de problemas — muitos alunos com discalculia têm dificuldade com memória de trabalho numérica.",
      "Adapte provas: reduza quantidade de questões, permita consulta a fórmulas, avalie o processo e não apenas o resultado.",
      "Conecte matemática ao cotidiano: preços, medidas, receitas culinárias. Contextualizar torna o abstrato mais acessível.",
      "Valorize o raciocínio: se o aluno chegou ao resultado por um caminho alternativo, reconheça a lógica mesmo que o método não seja o convencional.",
    ],
    dontList: [
      "Não aplique provas cronometradas sem adaptação — a pressão do tempo paralisa o processamento numérico.",
      "Não assuma que erro em matemática = falta de atenção — é uma dificuldade específica de processamento.",
      "Não force memorização de tabuada sem contexto visual — muitos alunos com discalculia memorizam melhor com padrões visuais.",
      "Não use linguagem como 'isso é fácil' ou 'qualquer um consegue' — para o aluno com discalculia, não é.",
      "Não pule etapas na explicação — o que é óbvio para você pode ser invisível para o aluno.",
    ],
    crisisProtocol: [
      "1. Garanta a segurança emocional: remova a pressão imediata. 'Não precisa resolver agora. Vamos fazer juntos a primeira parte.'",
      "2. Se o aluno trava diante de números: ofereça apoio concreto. 'Vamos usar o material dourado para visualizar.'",
      "3. Se há ansiedade matemática severa (travamento, choro, recusa): valide o sentimento. 'Matemática é difícil para muitas pessoas. Vamos encontrar um jeito que funcione para você.'",
      "4. Ofereça alternativa: 'Me explica com suas palavras o que o problema pede.' Registre no Diário de Bordo.",
    ],
    communicationTips: [
      "Sugira jogos matemáticos em casa: dominó de números, jogos de loja, medir ingredientes na cozinha.",
      "Informe que discalculia é tão real quanto dislexia, mas menos conhecida — muitos pais nunca ouviram falar.",
      "Compartilhe que a dificuldade é no processamento numérico, não na inteligência geral do aluno.",
    ],
    disclaimer:
      "Este guia é ferramenta de apoio docente e NÃO substitui avaliação especializada. A discalculia afeta 3–6% da população e frequentemente coexiste com dislexia e TDAH.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ALTAS_HABILIDADES — Superdotação
  // ═══════════════════════════════════════════════════════════════════════════

  ALTAS_HABILIDADES: {
    id: "ALTAS_HABILIDADES",
    name: "Altas Habilidades / Superdotação",
    shortDescription:
      "Desempenho acima da média com perfil cognitivo diferenciado. Precisa de enriquecimento, não de 'mais do mesmo'.",
    color: "purple",
    icon: "Sparkles",
    seatingRecommendations: [
      "Agrupe estrategicamente com pares de nível similar para enriquecimento por pares — alunos superdotados aprendem muito entre si.",
      "Evite isolamento social: não coloque o aluno sozinho como 'o inteligente da turma'. A inclusão significa participação plena.",
      "Prefira posições que permitam fácil transição entre trabalho individual e em grupo — esses alunos alternam rapidamente entre os modos.",
    ],
    doList: [
      "Ofereça atividades de aprofundamento, não de repetição: se o aluno já domina o conteúdo, proponha pesquisa, projeto ou problema desafiador.",
      "Permita aceleração de conteúdo quando apropriado — não faz sentido o aluno repetir exercícios que já domina.",
      "Proponha projetos de investigação independente: 'Escolha um tema relacionado ao conteúdo e investigue. Apresente para a turma.'",
      "Identifique e nurture talentos específicos: um aluno pode ser excepcional em matemática e ter dificuldade em língua portuguesa.",
      "Conecte com mentores ou programas de enriquecimento fora da escola (olimpíadas, clubs de ciências, projetos universitários).",
      "Trate o aluno com normalidade nas interações sociais — ele precisa de pertencimento tanto quanto qualquer outro.",
    ],
    dontList: [
      "Não use o aluno como 'monitor' dos colegas como atividade padrão — isso o sobrecarrega e não oferece desafio cognitivo real.",
      "Não assuma que alto desempenho = não precisa de apoio emocional — superdotação pode vir com perfeccionismo, ansiedade e dificuldade social.",
      "Não ignore sinais de frustração por tédio — o desengajamento é o maior risco para alunos superdotados não desafiados.",
      "Não isole socialmente por 'ser diferente' — a inteligência não é razão para exclusão.",
      " não espere que o aluno seja 'perfeito' em tudo — ter altas habilidades em uma área não significa excelência em todas.",
    ],
    crisisProtocol: [
      "1. Garanta a segurança emocional: normalize o erro. 'Errar é como o cérebro aprende. Eu erro todos os dias.'",
      "2. Se o aluno apresenta perfeccionismo paralisante (chora ao errar, recusa atividades): ofereça pausa. 'Vamos dar uma volta rápida e voltar com calma.'",
      "3. Se há desengajamento total (aparente 'preguiça'): investigue se o conteúdo é muito fácil. Ofereça desafio genuíno, não 'mais exercícios'.",
      "4. Se há conflito social por 'ser o inteligente': mediação. Ajude o grupo a valorizar diferentes tipos de inteligência.",
    ],
    communicationTips: [
      "Compartilhe oportunidades de enriquecimento extracurricular: olimpíadas, projetos de iniciação científica, clubs.",
      "Alerte sobre risco de perfeccionismo e ansiedade de desempenho — muitos pais não percebem que a pressão é tão prejudicial quanto a negligência.",
      "Reforce que altas habilidades são uma necessidade educacional especial — o aluno precisa de suporte tanto quanto qualquer outro.",
    ],
    disclaimer:
      "Este guia é ferramenta de apoio docente e NÃO substitui avaliação especializada. Altas habilidades/superdotação afetam 2–5% da população e são reconhecidas como necessidade educacional especial pela Lei Brasileira de Inclusão.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OUTRO — Necessidades não especificadas
  // ═══════════════════════════════════════════════════════════════════════════

  OUTRO: {
    id: "OUTRO",
    name: "Outras Necessidades Educacionais",
    shortDescription:
      "Necessidades educacionais especiais não classificadas nas condições acima.",
    color: "gray",
    icon: "Users",
    seatingRecommendations: [
      "Observe o que funciona para este aluno específico — cada caso é único e merece atenção individualizada.",
      "Mantenha flexibilidade: a posição ideal pode mudar ao longo do ano conforme o aluno se desenvolve.",
      "Consulte o laudo ou relatório profissional quando disponível para orientações específicas.",
    ],
    doList: [
      "Observe padrões: em quais momentos o aluno tem mais dificuldade? Mais facilidade? Isso orienta intervenções.",
      "Comunique-se com a família e profissionais que acompanham o aluno — eles conhecem estratégias que funcionam.",
      "Documente no Diário de Bordo: registros consistentes ajudam a identificar progresso e necessidades de ajuste.",
      "Ofereça escolhas sempre que possível — autonomia é um poderoso motivador para qualquer aluno.",
      "Adapte o que for necessário e possível — inclusão não é receita, é escuta e resposta.",
    ],
    dontList: [
      "Não assuma que o rótulo define o aluno — condições são pontos de partida, não destinos.",
      "Não ignore necessidades observadas só porque não há laudo formal — a ausência de laudo não invalida a necessidade.",
      "Não espere ter 'formação perfeita' para começar a adaptar — comece com o que sabe e aprenda no caminho.",
    ],
    crisisProtocol: [
      "1. Garanta segurança imediata do aluno e dos colegas.",
      "2. Reduza estímulos: silêncio, espaço, calma.",
      "3. Registre no Diário de Bordo e comunique a coordenação para encaminhamento adequado.",
    ],
    communicationTips: [
      "Descreva comportamentos e contextos específicos, não diagnósticos.",
      "Pergunte à família o que funciona em casa — muitas estratégias são transferíveis.",
      "Mantenha comunicação frequente e positiva — não espere problemas para falar com a família.",
    ],
    disclaimer:
      "Este guia é ferramenta de apoio docente e NÃO substitui avaliação especializada. Na ausência de laudo formal, observe, registre e encaminhe.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NAO_INFORMADO — Diagnóstico não informado
  // ═══════════════════════════════════════════════════════════════════════════

  NAO_INFORMADO: {
    id: "NAO_INFORMADO",
    name: "Diagnóstico Não Informado",
    shortDescription:
      "O responsável optou por não informar o diagnóstico. Respeite essa escolha.",
    color: "gray",
    icon: "ShieldAlert",
    seatingRecommendations: [
      "Observe necessidades sem pressionar por laudo — o aluno pode precisar de apoio independente do diagnóstico.",
      "Mantenha flexibilidade no posicionamento — ajuste conforme a observação em sala.",
    ],
    doList: [
      "Respeite a decisão da família — o diagnóstico é informação sensível sob a LGPD.",
      "Observe e registre comportamentos no Diário de Bordo — padrões podem orientar conversas futuras.",
      "Ofereça acomodações universais: instruções claras, tempo extra, apoio visual — beneficiam todos os alunos.",
    ],
    dontList: [
      "Não pressione a família por laudo — isso pode criar desconfiança.",
      "Não assuma que a ausência de informação significa ausência de necessidade.",
      "Não exponha o aluno como 'caso não informado' — trate com a mesma atenção que os demais.",
    ],
    crisisProtocol: [
      "1. Garanta segurança.",
      "2. Reduza estímulos.",
      "3. Registre e comunique a coordenação.",
    ],
    communicationTips: [
      "Construa confiança com a família antes de solicitar informações sensíveis.",
      "Explique o propósito de cada dado coletado: 'Essa informação nos ajuda a posicionar melhor seu filho na sala.'",
      "Garanta sigilo: os dados são protegidos conforme a LGPD e acessíveis apenas ao professor.",
    ],
    disclaimer:
      "A ausência de laudo não impede o atendimento educacional especializado (AEE). Observe, registre e apoie.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TOD — placeholder para compatibilidade (já definido acima)
  // ═══════════════════════════════════════════════════════════════════════════
};

// ─── Export Functions ────────────────────────────────────────────────────────

/**
 * Obtém o guia de manejo para uma condição
 * @param {DiagnosisType} type
 * @returns {ConditionGuide|null}
 */
export function getGuide(type) {
  return conditionGuides[type] || null;
}

/**
 * Retorna todos os guias disponíveis
 * @returns {ConditionGuide[]}
 */
export function getAllGuides() {
  return Object.values(conditionGuides);
}

/**
 * Retorna recomendações de posicionamento agregadas para uma turma inteira
 *
 * Analisa todos os alunos com necessidades e consolida recomendações
 * sem duplicatas, priorizando por frequência.
 *
 * @param {Student[]} students
 * @returns {string[]} — lista de recomendações para a turma
 */
export function getSeatingRecommendationsForClass(students) {
  const recommendations = new Set();
  const studentsWithNeeds = students.filter((s) => s.hasAccessibilityNeeds);

  if (studentsWithNeeds.length === 0) {
    return [
      "Nenhum aluno com necessidades específicas registrado nesta turma.",
      "Mantenha o layout flexível para acomodar futuras necessidades.",
    ];
  }

  // Coleta recomendações de cada aluno
  studentsWithNeeds.forEach((student) => {
    const guide = student.diagnosisType
      ? conditionGuides[student.diagnosisType]
      : null;

    if (guide) {
      guide.seatingRecommendations.forEach((rec) =>
        recommendations.add(rec)
      );
    }

    // Recomendações genéricas para necessidades não especificadas
    if (!student.diagnosisType && student.hasAccessibilityNeeds) {
      recommendations.add(
        `Aluno "${student.name}" tem necessidades específicas sem diagnóstico informado. Observe e ajuste o posicionamento conforme necessário.`
      );
    }
  });

  return Array.from(recommendations);
}
