## Índice de Adoção de Políticas Públicas

Nosso índice é baseado no índice da Universidade de Oxford de qual rastreamos dez políticas públicas para o controle da pandemia. Estas políticas incluem fechamento de escolas e negócios não-essenciais e ordens para ficar em casa, entre outras medidas. Ajustamos estas medidas a partir de suas datas de implementação e de quanto tempo estiveram em ação. A linha preta pontilhada representa a média ponderada de todos os estados do país.

```
indexLineChart({
  country: 'argentina',
  yVariable: 'policy_index',
  yRank: 'ranking_policy_accumulated',
  useBaseline: false,
  usePercentage: false,
  chartKeyword: 'policy',
});
```

```
<div class="row">
<div class="col-md-3">
<div class="lenny_stateContainer" id="stateContainer_policy">
<div id="stateWrapper_policy" class="lenny_stateWrapper">
<ul id="stateList_policy"></ul>
</div>
</div>
</div>
<div class="col-md-9">
<figure id="wrapper_policy" class="lenny_chartWrapper">
<!-- start tooltip -->
<div id="tooltip_policy" class="lenny_chartTooltip">
<div id="tooltipHeader_policy" class="lenny_tooltipHeader">
  <span></span>
</div>
<table id="tooltipContent_policy">
<tr></tr>
</table>
</div>
<!-- end tooltip -->
</figure>
</div>
</div>
```

<hr />

## Mudança no Índice de Mobilidade em porcentagem, em comparação com a mobilidade habitual

Estimativas próprias com base em dados do Google. Estes gráficos mostram a mudança em mobilidade da população em cada estado em comparação com a mobilidade habitual nos mesmos períodos, identificada como eixo 0. Quedas na mobilidade podem levar à menor probabilidade de contágio comunitário. A linha preta pontilhada representa a média ponderada de todos os estados do país.

```
indexLineChart({
  country: 'argentina',
  yVariable: 'mobility_index',
  yRank: 'ranking_mobility_accumulated',
  useBaseline: true,
  usePercentage: true,
  chartKeyword: 'mobility',
});
```

```
<div class="row">
<div class="col-md-3">
<div class="lenny_stateContainer" id="stateContainer_mobility">
<div id="stateWrapper_mobility" class="lenny_stateWrapper">
<ul id="stateList_mobility"></ul>
</div>
</div>
</div>
<div class="col-md-9">
<figure id="wrapper_mobility" class="lenny_chartWrapper">
<!-- start tooltip -->
<div id="tooltip_mobility" class="lenny_chartTooltip">
<div id="tooltipHeader_mobility" class="lenny_tooltipHeader">
<span></span>
</div>
<table id="tooltipContent_mobility">
<tr></tr>
</table>
</div>
<!-- end tooltip -->
</figure>
</div>
</div>
```

<hr />

## Uso de máscaras Faciais

Índice da diretiva de política de saúde pública sobre o uso de máscaras faciais. Este índice é ajustado a partir de sua data de implementação em comparação com o registro do primeiro caso no país.

```
indexLineChart({
country: 'argentina',
yVariable: 'facemask_index',
yRank: 'ranking_facemask',
useBaseline: false,
usePercentage: false,
chartKeyword: 'facemask',
});
```

```
<div class="row">
<div class="col-md-3">
<div class="lenny_stateContainer" id="stateContainer_facemask">
<div id="stateWrapper_facemask" class="lenny_stateWrapper">
<ul id="stateList_facemask"></ul>
</div>
</div>
</div>
<div class="col-md-9">
<figure id="wrapper_facemask" class="lenny_chartWrapper">
<!-- start tooltip -->
<div id="tooltip_facemask" class="lenny_chartTooltip">
<div id="tooltipHeader_facemask" class="lenny_tooltipHeader">
<span></span>
</div>
<table id="tooltipContent_facemask">
<tr></tr>
</table>
</div>
<!-- end tooltip -->
</figure>
</div>
</div>
```
