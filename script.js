document.addEventListener("DOMContentLoaded", function() {  
  // Define o mínimo para o campo de data como a data atual
  const dataInput = document.getElementById("data");
  const todayDate = new Date().toISOString().split("T")[0];
  dataInput.setAttribute("min", todayDate);

  // Função para somar 10 dias úteis
  function addBusinessDays(startDate, days) {
    let currentDate = new Date(startDate);
    let addedDays = 0;
    while (addedDays < days) {
      currentDate.setDate(currentDate.getDate() + 1);
      // Considera que sábado (6) e domingo (0) não são dias úteis
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        addedDays++;
      }
    }
    return currentDate;
  }

  // Função para formatar data ISO para DD/MM/AAAA
  function formatDateIsoToBrazil(isoDate) {
    const [yyyy, mm, dd] = isoDate.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }

  // 1. Formatação do campo "Valor da conta" para moeda brasileira (BRL)
  const valorInput = document.getElementById('valor');
  valorInput.addEventListener('input', function () {
    let value = this.value.replace(/\D/g, '');
    if (!value) {
      this.value = '';
      return;
    }
    const numericValue = parseInt(value, 10);
    this.value = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue / 100);
  });

  // 2. Formatação automática para CPF/CNPJ e validação mínima de 11 dígitos (somente números)
  const cpfCnpjInput = document.getElementById('cnpj');
  cpfCnpjInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (!value) {
      e.target.value = '';
      return;
    }
    // Se o valor for menor ou igual a 11, formata como CPF
    if (value.length <= 11) {
      value = value.substring(0, 11);
      value = value.replace(/^(\d{3})(\d)/, '$1.$2');
      value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
    } else {
      value = value.substring(0, 14);
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4');
      value = value.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5');
    }
    e.target.value = value;
  });

  // 3. Atualiza os campos adicionais de pagamento
  document.getElementById("pagamento").addEventListener("change", function() {
    const selected = this.value.toLowerCase();
    const paymentDetails = document.getElementById("paymentDetails");
    paymentDetails.innerHTML = "";
    if (!selected || selected === "metodo") {
      alert("O campo 'Método de Pagamento' é obrigatório.");
      return;
    }
    if (selected === "pix") {
      paymentDetails.innerHTML = `
        <label for="chavePix">Chave Pix:</label>
        <input type="text" id="chavePix" placeholder="Digite sua chave Pix" required>
      `;
    } else if (selected === "transferência bancária") {
      paymentDetails.innerHTML = `
        <label for="agencia">Agência:</label>
        <input type="text" id="agencia" placeholder="Digite a agência" required maxlength="4">
        <label for="conta">Conta:</label>
        <input type="text" id="conta" placeholder="Digite a conta" required>
        <label for="tipoConta">Tipo de Conta:</label>
        <select id="tipoConta" required>
          <option value="">Selecione o Tipo de Conta</option>
          <option value="CONTA CORRENTE">Conta Corrente</option>
          <option value="CONTA SALARIO">Conta Salario</option>
          <option value="CONTA POUPANÇA">Conta Poupança</option>
        </select>
      `;
      // Formata o campo "conta": se houver 5 dígitos, insere um hífen antes do último dígito.
      document.getElementById("conta").addEventListener("input", function() {
        let val = this.value.replace(/\D/g, '');
        if (val.length > 5) {
          val = val.slice(0, 5);
        }
        if (val.length === 5) {
          this.value = val.slice(0, -1) + "-" + val.slice(-1);
        } else {
          this.value = val;
        }
      });
    } else if (selected === "dinheiro") {
      paymentDetails.innerHTML = `
        <label for="autorizador1">Autorizador 1:</label>
        <input type="text" id="autorizador1" placeholder="Digite o nome do Autorizador 1" required>
        <label for="autorizador2">Autorizador 2:</label>
        <input type="text" id="autorizador2" placeholder="Digite o nome do Autorizador 2" required>
      `;
    } else if (selected === "guia") {
      // Para "guia", não exibe nenhum campo extra
      paymentDetails.innerHTML = ``;
    }
  });

  // Atualiza o campo "dataLimite" sempre que a data de vencimento for alterada
  document.getElementById("data").addEventListener("change", function() {
    const dataVenc = this.value;
    if (dataVenc) {
      const dataLimite = new Date(`${dataVenc}T00:00:00`);
      dataLimite.setDate(dataLimite.getDate() + 10);
      const formattedDataLimite = formatDateIsoToBrazil(dataLimite.toISOString().split("T")[0]);
      const dataLimiteField = document.getElementById("dataLimite");
      if (dataLimiteField) {
        dataLimiteField.value = formattedDataLimite;
      }
    }
  });

  // Configuração dos radio buttons para Nota Fiscal em Anexo
  const radioDataAdiantadoContainer = document.getElementById("radioDataAdiantadoContainer");
  const dataLimiteField = document.getElementById("dataLimite");
  document.querySelectorAll('input[name="grupoOpcao"]').forEach(radio => {
    radio.addEventListener("change", function() {
      if (this.value === "3") {
        const today = new Date();
        const futureDate = addBusinessDays(today, 10);
        dataLimiteField.value = formatDateIsoToBrazil(futureDate.toISOString().slice(0,10));
        radioDataAdiantadoContainer.style.display = "flex";
      } else {
        radioDataAdiantadoContainer.style.display = "none";
        dataLimiteField.value = "";
      }
    });
  });

  // 4. Função para gerar a pré-visualização
  function gerarPrevia() {
    const nome = document.getElementById("nome").value.trim();
    const favorecido = document.getElementById("favorecido").value.trim();
    const nomeU = nome.toUpperCase();
    const favorecidoU = favorecido.toUpperCase();

    const valor = document.getElementById("valor").value.trim();
    const cnpj = document.getElementById("cnpj").value.trim();
    const dataVenc = document.getElementById("data").value;
    
    // Validação para campo "Data de Vencimento" obrigatório
    if (dataVenc === "") {
      alert("O campo 'Data de Vencimento' é obrigatório.");
      return;
    }
    
    const pagamento = document.getElementById("pagamento").value.trim().toUpperCase();
    const setor = document.getElementById("setor").value.trim().toUpperCase();
    const categoria = document.getElementById("categoria").value.trim().toUpperCase();
    const relato = document.getElementById("relato").value.trim();

    // Validações dos campos obrigatórios
    if (nome.length < 11) {
      alert("O campo 'Nome do solicitante' deve ter no mínimo 11 caracteres.");
      return;
    }
    if (favorecido.length < 11) {
      alert("O campo 'Nome do Favorecido' deve ter no mínimo 11 caracteres.");
      return;
    }
    if (valor === "") {
      alert("O campo 'Valor da Conta' é obrigatório.");
      return;
    }
    if (cnpj === "") {
      alert("O campo 'CNPJ/CPF' é obrigatório.");
      return;
    }
    if (cnpj.replace(/\D/g, '').length < 11) {
      alert("O campo 'CNPJ/CPF' deve ter no mínimo 11 dígitos.");
      return;
    }
    if (relato === "") {
      alert("O campo 'Relato' é obrigatório.");
      return;
    }
    if (relato.length < 50) {
      alert("O campo 'Relato' deve ter no mínimo 50 caracteres.");
      return;
    }
    if (pagamento === "" || pagamento === "METODO") {
      alert("O campo 'Método de Pagamento' é obrigatório.");
      return;
    }
    if (setor === "") {
      alert("O campo 'Centro de Custo' é obrigatório.");
      return;
    }
    if (categoria === "") {
      alert("O campo 'Categoria' é obrigatório.");
      return;
    }
    // Restrição: Se o Centro de Custo for "MOTORISTAS", as únicas categorias permitidas são "VALE COMBUSTÍVEL" ou "KM DESLOCAMENTO"
    if (setor === "MOTORISTAS" && !(categoria === "VALE COMBUSTÍVEL" || categoria === "KM DESLOCAMENTO")) {
      alert("Para o Centro de Custo 'Motoristas', as únicas opções de categoria permitidas são 'VALE COMBUSTÍVEL' e 'KM DESLOCAMENTO'.");
      return;
    }
    // Verifica se algum radio do grupo Nota Fiscal foi selecionado
    const notaFiscalRadios = document.querySelectorAll('input[name="grupoOpcao"]');
    let notaFiscalSelecionado = false;
    let isPagamentoAdiantado = false;
    notaFiscalRadios.forEach(radio => {
      if (radio.checked) {
        notaFiscalSelecionado = true;
        if (radio.value === "3") {
          isPagamentoAdiantado = true;
        }
      }
    });
    if (!notaFiscalSelecionado) {
      alert("O campo 'Nota Fiscal em Anexo' é obrigatório.");
      return;
    }

    // Verifica se a data de vencimento não é anterior à data atual
    const dueDate = new Date(`${dataVenc}T00:00:00`);
    dueDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      alert("A data de vencimento não pode ser anterior à data atual.");
      return;
    }

    // Cálculo da Data Limite para entregar a NF (10 dias após a data de vencimento)
    const dataLimiteNF = new Date(`${dataVenc}T00:00:00`);
    dataLimiteNF.setDate(dataLimiteNF.getDate() + 10);
    const formattedDataLimiteNF = formatDateIsoToBrazil(dataLimiteNF.toISOString().split("T")[0]);

    // Campos extras do método de pagamento
    let previewExtra = "";
    if (pagamento === "PIX") {
      const chavePix = document.getElementById("chavePix");
      if (!chavePix || !chavePix.value.trim()) {
        alert("É obrigatório informar a Chave Pix.");
        return;
      }
      previewExtra = `<p><strong>CHAVE PIX:</strong> ${chavePix.value.trim().toUpperCase()}</p>`;
    } else if (pagamento === "TRANSFERÊNCIA BANCÁRIA") {
      const agencia = document.getElementById("agencia");
      const contaField = document.getElementById("conta");
      const tipoConta = document.getElementById("tipoConta");
      if (!agencia || !agencia.value.trim()) {
        alert("É obrigatório informar a Agência.");
        return;
      }
      const agenciaDigits = agencia.value.replace(/\D/g, '');
      if (agenciaDigits.length !== 4) {
        alert("O campo 'Agência' deve ter exatamente 4 dígitos.");
        return;
      }
      if (!contaField || !contaField.value.trim()) {
        alert("É obrigatório informar a Conta.");
        return;
      }
      const contaDigits = contaField.value.replace(/\D/g, '');
      if (contaDigits.length < 5) {
        alert("O campo 'Conta' deve ter no mínimo 5 caracteres.");
        return;
      }
      if (!tipoConta || !tipoConta.value.trim()) {
        alert("É obrigatório selecionar o Tipo de Conta.");
        return;
      }
      previewExtra = `<p><strong>AGÊNCIA:</strong> ${agencia.value.trim().toUpperCase()}</p>
                      <p><strong>CONTA:</strong> ${contaField.value.trim().toUpperCase()}</p>
                      <p><strong>TIPO DE CONTA:</strong> ${tipoConta.value.trim().toUpperCase()}</p>`;
    } else if (pagamento === "DINHEIRO") {
      const autorizador1 = document.getElementById("autorizador1");
      const autorizador2 = document.getElementById("autorizador2");
      if (!autorizador1 || !autorizador1.value.trim()) {
        alert("É obrigatório informar o Autorizador 1.");
        return;
      }
      if (autorizador1.value.trim().length < 11) {
        alert("O campo 'Autorizador 1' deve ter no mínimo 11 caracteres.");
        return;
      }
      if (!autorizador2 || !autorizador2.value.trim()) {
        alert("É obrigatório informar o Autorizador 2.");
        return;
      }
      if (autorizador2.value.trim().length < 11) {
        alert("O campo 'Autorizador 2' deve ter no mínimo 11 caracteres.");
        return;
      }
      previewExtra = `<p><strong>AUTORIZADOR 1:</strong> ${autorizador1.value.trim().toUpperCase()}</p>
                      <p><strong>AUTORIZADOR 2:</strong> ${autorizador2.value.trim().toUpperCase()}</p>`;
    } else if (pagamento === "GUIA") {
      previewExtra = "";
    }

    // Cálculo da diferença de dias usando Math.ceil para considerar frações de dia
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const bgColor = diffDays <= 4 ? "#ff9999" : "#69C0AE";
    const formattedDataVenc = formatDateIsoToBrazil(dataVenc);

    // Reordenação na impressão:
    // Primeiro: DATA DE VENCIMENTO, VALOR DA CONTA, NOME DO FAVORECIDO, seguido de uma linha em branco;
    // Em seguida: NOME DO SOLICITANTE, CNPJ/CPF.
    let previewContent = `
      <div style="text-align:center; margin-bottom:1rem;">
        <img src="https://pedilar.com.br/wp-content/uploads/2021/08/pedilar-logo-c.png" style="max-height: 3rem;" alt="Pedilar Domiciliar">
      </div>
      <p><strong>DATA DE VENCIMENTO:</strong> ${formatDateIsoToBrazil(dataVenc)}</p>
      <p><strong>VALOR DA CONTA:</strong> ${valor}</p>
      <p><strong>NOME DO FAVORECIDO:</strong> ${favorecidoU}</p>
      <br>
      <p><strong>NOME DO SOLICITANTE:</strong> ${nomeU}</p>
      <p><strong>CNPJ/CPF:</strong> ${cnpj.toUpperCase()}</p>
    `;

    // Se o pagamento adiantado for selecionado, inclui "DATA LIMITE PARA ENTREGA DA NF"
    if (isPagamentoAdiantado) {
      previewContent += `<p><strong>DATA LIMITE PARA ENTREGA DA NF:</strong> ${formattedDataLimiteNF}</p>`;
    }

    previewContent += `
      <p><strong>MÉTODO DE PAGAMENTO:</strong> ${pagamento}</p>
      ${previewExtra}
      <p><strong>CENTRO DE CUSTO:</strong> ${setor}</p>
      <p><strong>CATEGORIA:</strong> ${categoria}</p>
      <p style="white-space: pre-wrap;"><strong>RELATO:</strong><br>${relato}</p>
    `;

    // Nota Fiscal em Anexos
    let notaFiscalOption = "";
    notaFiscalRadios.forEach(radio => {
      if (radio.checked) {
        if (radio.value === "3") {
          notaFiscalOption = "PAGAMENTO ADIANTADO";
        } else if (radio.value === "1") {
          notaFiscalOption = "SIM";
        } else if (radio.value === "2") {
          notaFiscalOption = "NÃO";
        }
      }
    });
    if (notaFiscalOption !== "") {
      previewContent += `<p><strong>NOTA FISCAL EM ANEXO:</strong> ${notaFiscalOption}</p>`;
    }

    document.getElementById("printPreview").innerHTML = previewContent;
    document.getElementById("preview-container").style.backgroundColor = bgColor;
  }

  document.getElementById("baixarArquivo").addEventListener("click", function(event) {
    event.preventDefault();
    gerarPrevia();
  });

  document.getElementById("printButton").addEventListener("click", function(event) {
    event.preventDefault();
    window.print();
  });

  // FUNÇÕES DE MESCLAGEM DE PDF E ORDENAMENTO

  let selectedFiles = [];

  function getInitials(fullName) {
    if (!fullName.trim()) return "";
    const parts = fullName.trim().split(/\s+/);
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
  }

  // Função para montar o nome do arquivo usando as iniciais do solicitante e as duas primeiras palavras do favorecido
  function montarNomeArquivo() {
    const nomeSolicitante = document.getElementById("nome").value.trim();
    const favorecido = document.getElementById("favorecido").value.trim();
    const valor = document.getElementById("valor").value.trim();
    const dataVenc = document.getElementById("data").value;
    const iniciais = getInitials(nomeSolicitante);
    let dataFormatted = formatDateIsoToBrazil(dataVenc);
    // Remove as barras da data para não usar "/" no nome do arquivo
    dataFormatted = dataFormatted.replace(/\//g, "-");
    const favorecidoName = favorecido.split(/\s+/).slice(0,2).join(" ");
    return `${iniciais} - AUTORIZACAO DE PAGAMENTO - ${favorecidoName.toUpperCase()} - ${valor} - VENC ${dataFormatted}.pdf`;
  }

  function updateFileName() {
    const nomeArquivo = montarNomeArquivo();
    document.getElementById("nomeArquivo").value = nomeArquivo;
  }

  document.getElementById("nome").addEventListener("input", updateFileName);
  document.getElementById("categoria").addEventListener("change", updateFileName);
  document.getElementById("valor").addEventListener("input", updateFileName);
  document.getElementById("data").addEventListener("change", updateFileName);

  document.getElementById("copiarNomeArquivo").addEventListener("click", function() {
    const nomeArquivoInput = document.getElementById("nomeArquivo");
    navigator.clipboard.writeText(nomeArquivoInput.value)
      .then(() => {
        alert("Nome do arquivo copiado: " + nomeArquivoInput.value);
      })
      .catch(err => {
        console.error("Erro ao copiar o nome do arquivo: ", err);
        alert("Não foi possível copiar o nome do arquivo.");
      });
  });

  updateFileName();

  // Exibe os arquivos selecionados e permite a reordenação
  document.getElementById("mesclarArquivo").addEventListener("click", function(event) {
    event.preventDefault();
    const fileInput = document.getElementById("pdfFiles");
    const files = Array.from(fileInput.files);
    if (!files.length) {
      alert("Por favor, selecione os PDFs para mesclar.");
      return;
    }
    // Armazena os arquivos selecionados na memória
    selectedFiles = files;
    renderFileOrder();
    document.getElementById("pdfOrderContainer").style.display = "block";
  });

  // Renderiza a lista de arquivos com base no array selectedFiles
  function renderFileOrder() {
    const pdfOrderList = document.getElementById("pdfOrderList");
    pdfOrderList.innerHTML = "";
    selectedFiles.forEach((file, index) => {
      const li = document.createElement("li");
      li.textContent = file.name;
      li.setAttribute("data-index", index);
      li.setAttribute("draggable", "true");
      pdfOrderList.appendChild(li);
    });
  }

  // Configura o drag & drop na lista
  const pdfOrderList = document.getElementById("pdfOrderList");
  let draggedIndex = null;
  pdfOrderList.addEventListener("dragstart", function(e) {
    let target = e.target;
    while (target && target.nodeName !== "LI") {
      target = target.parentElement;
    }
    if (target) {
      draggedIndex = parseInt(target.getAttribute("data-index"), 10);
      target.style.opacity = "0.5";
    }
  });
  pdfOrderList.addEventListener("dragend", function(e) {
    let target = e.target;
    while (target && target.nodeName !== "LI") {
      target = target.parentElement;
    }
    if (target) {
      target.style.opacity = "";
    }
  });
  pdfOrderList.addEventListener("dragover", function(e) {
    e.preventDefault();
  });
  pdfOrderList.addEventListener("drop", function(e) {
    e.preventDefault();
    let target = e.target;
    while (target && target.nodeName !== "LI") {
      target = target.parentElement;
    }
    if (target && draggedIndex !== null) {
      let targetIndex = parseInt(target.getAttribute("data-index"), 10);
      if (draggedIndex === targetIndex) return;
      const [moved] = selectedFiles.splice(draggedIndex, 1);
      selectedFiles.splice(targetIndex, 0, moved);
      renderFileOrder();
    }
    draggedIndex = null;
  });

  // Salva a ordem definida e mescla os PDFs com base em selectedFiles
  document.getElementById("saveOrderButton").addEventListener("click", async function(event) {
    event.preventDefault();
    if (!selectedFiles.length) {
      alert("Nenhum arquivo selecionado para mesclar.");
      return;
    }
    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();
    for (let file of selectedFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => {
        mergedPdf.addPage(page);
      });
    }
    const mergedPdfFile = await mergedPdf.save();
    const blob = new Blob([mergedPdfFile], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const fileName = montarNomeArquivo();
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    document.getElementById("mergeResult").innerHTML = `<p>PDF mesclado com sucesso: ${fileName}</p>`;
  });
});
